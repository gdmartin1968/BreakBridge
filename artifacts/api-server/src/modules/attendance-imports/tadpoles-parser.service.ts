import { Injectable } from "@nestjs/common";

export interface ParsedEntry {
  rawName: string;
  classroomLabel: string;
  status: "logged_in" | "logged_out" | "absent" | "unknown";
  loggedInAt: string | null;
}

export interface ParseResult {
  entries: ParsedEntry[];
  warnings: string[];
}

@Injectable()
export class TadpolesParserService {
  /**
   * Parse raw Tadpoles clipboard text into structured staff entries.
   * Phase 1: best-effort heuristic parser. Logic will be refined in Phase 2.
   */
  parse(rawText: string): ParseResult {
    const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
    const entries: ParsedEntry[] = [];
    const warnings: string[] = [];
    let currentClassroom = "Unknown";

    for (const line of lines) {
      // Classroom header detection: lines that don't look like person names
      if (this.looksLikeClassroomHeader(line)) {
        currentClassroom = this.normalizeClassroomLabel(line);
        continue;
      }

      if (this.looksLikePersonName(line)) {
        const status = this.detectStatus(line);
        const loggedInAt = this.extractTime(line);
        entries.push({
          rawName: this.extractName(line),
          classroomLabel: currentClassroom,
          status,
          loggedInAt,
        });
        continue;
      }

      if (!this.isNoiseLine(line)) {
        warnings.push(`Unrecognized line: "${line}"`);
      }
    }

    return { entries, warnings };
  }

  private looksLikeClassroomHeader(line: string): boolean {
    const classroomKeywords = [
      "infant", "toddler", "twos", "threes", "prek", "pre-k",
      "kindergarten", "school age", "floater", "breaker",
    ];
    const lower = line.toLowerCase();
    return classroomKeywords.some((kw) => lower.includes(kw)) &&
      !line.includes(",") &&
      line.length < 40;
  }

  private normalizeClassroomLabel(line: string): string {
    return line.replace(/[:\-–]/g, "").trim();
  }

  private looksLikePersonName(line: string): boolean {
    // Heuristic: "LastName, FirstName" or "First Last" patterns
    return /^[A-Z][a-z]+,?\s+[A-Z][a-z]/.test(line) ||
      /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line);
  }

  private extractName(line: string): string {
    // Strip status tokens and time stamps from the end
    return line.replace(/\b(IN|OUT|ABSENT|AM|PM|\d{1,2}:\d{2})\b/g, "").trim();
  }

  private detectStatus(line: string): ParsedEntry["status"] {
    const upper = line.toUpperCase();
    if (upper.includes(" IN") || /\d{1,2}:\d{2}\s*(AM|PM)?/.test(line)) {
      return "logged_in";
    }
    if (upper.includes("OUT")) return "logged_out";
    if (upper.includes("ABSENT")) return "absent";
    return "unknown";
  }

  private extractTime(line: string): string | null {
    const match = line.match(/\b(\d{1,2}:\d{2})\s*(AM|PM)?\b/i);
    return match ? match[0] : null;
  }

  private isNoiseLine(line: string): boolean {
    // Skip obvious non-content lines
    return (
      line.length < 2 ||
      /^[-=_*#]+$/.test(line) ||
      /^\d+$/.test(line) ||
      line.toLowerCase().includes("total")
    );
  }
}
