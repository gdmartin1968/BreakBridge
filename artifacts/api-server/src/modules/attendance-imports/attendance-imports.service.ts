import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { TadpolesParserService } from "./tadpoles-parser.service";
import { TadpolesImportDto } from "./dto/tadpoles-import.dto";

@Injectable()
export class AttendanceImportsService {
  constructor(
    private prisma: PrismaService,
    private parser: TadpolesParserService,
  ) {}

  async importTadpoles(dto: TadpolesImportDto) {
    const { locationId, rawText } = dto;
    const parseResult = this.parser.parse(rawText);

    // Resolve classrooms and staff names within the location
    const [classrooms, staff] = await Promise.all([
      this.prisma.classroom.findMany({ where: { locationId } }),
      this.prisma.staff.findMany({ where: { locationId, isActive: true } }),
    ]);

    const classroomMap = new Map(
      classrooms.map((c) => [c.label.toLowerCase(), c]),
    );
    const staffMap = new Map(
      staff.map((s) => [s.displayName.toLowerCase(), s]),
    );

    const resolvedEntries: Array<{
      staffId: string;
      classroomId: string;
      status: string;
      loggedInAt: Date | null;
      isCalledOut: boolean;
    }> = [];
    const warnings = [...parseResult.warnings];

    for (const entry of parseResult.entries) {
      const matchedClassroom =
        classroomMap.get(entry.classroomLabel.toLowerCase()) ??
        [...classrooms].find((c) =>
          entry.classroomLabel
            .toLowerCase()
            .includes(c.label.toLowerCase()),
        );

      const matchedStaff = staffMap.get(entry.rawName.toLowerCase()) ??
        [...staff].find((s) =>
          s.displayName.toLowerCase().includes(entry.rawName.toLowerCase()) ||
          entry.rawName.toLowerCase().includes(s.lastName.toLowerCase()),
        );

      if (!matchedClassroom) {
        warnings.push(
          `Could not match classroom: "${entry.classroomLabel}"`,
        );
        continue;
      }
      if (!matchedStaff) {
        warnings.push(`Could not match staff member: "${entry.rawName}"`);
        continue;
      }

      resolvedEntries.push({
        staffId: matchedStaff.id,
        classroomId: matchedClassroom.id,
        status: entry.status.toUpperCase(),
        loggedInAt: entry.loggedInAt ? new Date(entry.loggedInAt) : null,
        isCalledOut: entry.status === "absent",
      });
    }

    // Persist snapshot
    const snapshot = await this.prisma.attendanceSnapshot.create({
      data: {
        locationId,
        snapshotDate: new Date(),
        rawInput: rawText,
        entries: {
          create: resolvedEntries.map((e) => ({
            staffId: e.staffId,
            classroomId: e.classroomId,
            status: (e.status as "PRESENT" | "ABSENT" | "CALLED_OUT" | "MISSING") ?? "PRESENT",
            loggedInAt: e.loggedInAt,
            isCalledOut: e.isCalledOut,
          })),
        },
      },
      include: { entries: { include: { staff: true, classroom: true } } },
    });

    return {
      snapshotId: snapshot.id,
      parsedAt: snapshot.importedAt,
      entriesCount: snapshot.entries.length,
      resolvedCount: resolvedEntries.length,
      warnings,
      entries: snapshot.entries.map((e) => ({
        staffName: e.staff.displayName,
        classroom: e.classroom.name,
        status: e.status,
        loggedInAt: e.loggedInAt,
      })),
    };
  }
}
