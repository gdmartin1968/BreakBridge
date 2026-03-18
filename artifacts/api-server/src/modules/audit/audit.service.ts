import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

export interface AuditEventInput {
  locationId?: string;
  actorId?: string;
  entityType: string;
  entityId: string;
  eventType: string;
  payload?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /** Write an audit event. Called by all mutating handlers. */
  async record(input: AuditEventInput) {
    return this.prisma.auditEvent.create({ data: input });
  }

  async findAll(opts: {
    locationId?: string;
    entityType?: string;
    entityId?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Record<string, unknown> = {};
    if (opts.locationId) where["locationId"] = opts.locationId;
    if (opts.entityType) where["entityType"] = opts.entityType;
    if (opts.entityId) where["entityId"] = opts.entityId;

    const skip = (opts.page - 1) * opts.pageSize;

    const [events, total] = await Promise.all([
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: opts.pageSize,
        include: { actor: { select: { displayName: true, email: true } } },
      }),
      this.prisma.auditEvent.count({ where }),
    ]);

    return {
      data: events,
      meta: { total, page: opts.page, pageSize: opts.pageSize },
    };
  }
}
