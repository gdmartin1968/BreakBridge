// src/App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  CLASSROOMS as CLASSROOMS_CONST,
  RATIOS,
  CAPACITY,
} from "./lib/constants";

const CLASSROOMS = [...CLASSROOMS_CONST];
const BOARD_ROOMS = [...CLASSROOMS, "Front Office", "Not in room"];
const WHITEBOARD_IMAGE_HREF = "/staff-member-schedules.jpg";

const LS_ROSTER = "ka_breaks_roster_v13";
const LS_EXCLUDED = "ka_breaks_excluded_v13";
const LS_SETTINGS = "ka_breaks_settings_v13";
const LS_PLANNED_AVAILABILITY = "ka_breaks_planned_availability_v1";

const PERMA_EXCLUDED_FIRST = ["faith", "luna"];
const HARD_BANNED_CANON = new Set(["all"]);

const ROOM_ORDER = [
  "Infants",
  "Todd A",
  "Todd B",
  "2A",
  "2B",
  "3A",
  "3B",
  "VPK A",
  "VPK B",
  "Front Office",
  "Not in room",
];

const NAP_ROOMS = new Set(["2A", "2B", "3A", "3B", "VPK A", "VPK B"]);
const TODD_POOL_ROOMS = new Set(["Todd A", "Todd B"]);
const DYNAMIC_COVERAGE_CLASSROOMS = new Set([
  "Infants",
  "Todd A",
  "Todd B",
  "2A",
  "2B",
  "3A",
  "3B",
  "VPK A",
  "VPK B",
]);

const ABSENCE_ENTRY_TYPES = [
  "pto",
  "sick",
  "doctor_appointment",
  "late_arrival",
  "early_departure",
  "training",
  "off_site",
  "meeting",
  "unavailable_for_coverage",
  "classroom_only",
  "ratio_absent",
  "other",
];

const EVENT_STATUS_OPTIONS = ["tentative", "confirmed", "cancelled"];

const WHITEBOARD_ROSTER_SEED = [
  {
    name: "Yajaira Lopez",
    defaultRoom: "Not in room",
    role: "Breaker",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Gabriela Leal",
    defaultRoom: "Not in room",
    role: "Breaker",
    shiftStart: "9:30 AM",
    shiftEnd: "6:00 PM",
  },
  {
    name: "Jackie Celis",
    defaultRoom: "Not in room",
    role: "Breaker",
    shiftStart: "9:00 AM",
    shiftEnd: "6:00 PM",
  },

  {
    name: "Tatiana Navarro",
    defaultRoom: "Infants",
    role: "Classroom",
    shiftStart: "6:30 AM",
    shiftEnd: "2:30 PM",
  },
  {
    name: "Marisela Perez",
    defaultRoom: "Infants",
    role: "Classroom",
    shiftStart: "7:00 AM",
    shiftEnd: "4:00 PM",
  },
  {
    name: "Isabel AlbaGranada",
    defaultRoom: "Infants",
    role: "Classroom",
    shiftStart: "8:00 AM",
    shiftEnd: "5:00 PM",
  },
  {
    name: "Carolina Restrepo",
    defaultRoom: "Infants",
    role: "Classroom",
    shiftStart: "10:00 AM",
    shiftEnd: "6:00 PM",
  },
  {
    name: "Surisadai Davis",
    defaultRoom: "Infants",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Olga Reynolds",
    defaultRoom: "Todd A",
    role: "Classroom",
    shiftStart: "8:00 AM",
    shiftEnd: "5:00 PM",
  },
  {
    name: "Jada Graham",
    defaultRoom: "Todd A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Mayolis Mujica",
    defaultRoom: "Todd B",
    role: "Classroom",
    shiftStart: "6:30 AM",
    shiftEnd: "3:30 PM",
  },
  {
    name: "Johanna Bastardo",
    defaultRoom: "Todd B",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Maria Guerrero",
    defaultRoom: "Todd A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Fatou Barow",
    defaultRoom: "2A",
    role: "Classroom",
    shiftStart: "8:00 AM",
    shiftEnd: "4:00 PM",
  },
  {
    name: "Veronica Gonzalez",
    defaultRoom: "2A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Ofelia Navarro",
    defaultRoom: "2B",
    role: "Classroom",
    shiftStart: "9:00 AM",
    shiftEnd: "6:00 PM",
  },
  {
    name: "Jaelyn Kuenn",
    defaultRoom: "2B",
    role: "Classroom",
    shiftStart: "7:00 AM",
    shiftEnd: "4:00 PM",
  },
  {
    name: "Victoria Gonzalez",
    defaultRoom: "2B",
    role: "Classroom",
    shiftStart: "9:00 AM",
    shiftEnd: "6:00 PM",
  },

  {
    name: "Kanthi Kuchimanchi",
    defaultRoom: "3A",
    role: "Classroom",
    shiftStart: "7:00 AM",
    shiftEnd: "4:00 PM",
  },
  {
    name: "Hadeel Mohamed",
    defaultRoom: "3A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Jessica Slutter",
    defaultRoom: "3A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Vanessa Toro",
    defaultRoom: "3B",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Ubahara Valarmathi",
    defaultRoom: "3B",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Jean DeRenzo",
    defaultRoom: "VPK A",
    role: "Classroom",
    shiftStart: "6:30 AM",
    shiftEnd: "2:30 PM",
  },
  {
    name: "Sahar Alayash",
    defaultRoom: "VPK A",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Patricia Jargo",
    defaultRoom: "VPK B",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Samantha Carroll",
    defaultRoom: "VPK B",
    role: "Classroom",
    shiftStart: "",
    shiftEnd: "",
  },

  {
    name: "Gordon Martin",
    defaultRoom: "Front Office",
    role: "Admin Cover",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Gabriela Isambert",
    defaultRoom: "Front Office",
    role: "Admin Cover",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Patti",
    defaultRoom: "Front Office",
    role: "Admin Cover",
    shiftStart: "8:00 AM",
    shiftEnd: "2:30 PM",
  },

  {
    name: "Sonia Blanco",
    defaultRoom: "Not in room",
    role: "Non-classroom",
    shiftStart: "",
    shiftEnd: "",
  },
  {
    name: "Jo-Ann Van Der Merwe",
    defaultRoom: "Front Office",
    role: "Non-classroom",
    shiftStart: "",
    shiftEnd: "",
  },
];

/* ----------------------------- Utilities ----------------------------- */

function safeJsonParse(s, fallback) {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

function makeId(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function canonName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function splitNameParts(name) {
  const parts = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return {
    parts,
    first: parts[0] || "",
    last: parts.length ? parts[parts.length - 1] : "",
    lastInitial: parts.length ? parts[parts.length - 1][0] : "",
  };
}

function firstNameKey(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)[0]
      ?.toLowerCase() || ""
  );
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function shiftISODate(dateStr, deltaDays) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function humanDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function defaultInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function duplicateSafeInitials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "??";
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();

  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${first.slice(0, 2)}${last.slice(0, 1)}`.toUpperCase();
}

function applyUniqueInitials(list) {
  const grouped = new Map();

  for (const t of list) {
    const base = defaultInitials(t.name);
    if (!grouped.has(base)) grouped.set(base, []);
    grouped.get(base).push(t);
  }

  return list.map((t) => {
    const base = defaultInitials(t.name);
    const group = grouped.get(base) || [];
    if (group.length === 1) return { ...t, initials: base };
    return { ...t, initials: duplicateSafeInitials(t.name) };
  });
}

function isBannedRosterName(name) {
  const n = canonName(name);
  if (!n) return true;
  return HARD_BANNED_CANON.has(n);
}

function isPermanentlyExcludedName(name) {
  return PERMA_EXCLUDED_FIRST.includes(firstNameKey(name));
}

function isNoBreakName(name) {
  const full = canonName(name);
  const first = firstNameKey(name);
  if (first === "tatiana") return true;
  if (full === "hadeel mohamed") return true;
  if (full === "ubahara valarmathi") return true;
  return false;
}

function isThirtyMinuteOnlyName(name) {
  return canonName(name) === "carolina restrepo";
}

function normalizeRoom(raw) {
  const s = (raw || "").trim();
  if (!s) return null;
  if (BOARD_ROOMS.includes(s)) return s;

  const lower = s.toLowerCase();

  if (lower === "not in room") return "Not in room";
  if (lower === "front office") return "Front Office";
  if (lower === "infants") return "Infants";

  if (lower === "todd a" || lower === "todda" || lower === "toddler a")
    return "Todd A";
  if (lower === "todd b" || lower === "toddb" || lower === "toddler b")
    return "Todd B";
  if (lower === "todd a and b") return "Todd A";

  if (
    lower === "2a" ||
    lower === "2 a" ||
    lower === "2's a" ||
    lower === "2s a" ||
    lower === "two a"
  )
    return "2A";
  if (
    lower === "2b" ||
    lower === "2 b" ||
    lower === "2's b" ||
    lower === "2s b" ||
    lower === "two b"
  )
    return "2B";

  if (lower === "3a" || lower === "3 a") return "3A";
  if (lower === "3b" || lower === "3 b") return "3B";

  if (lower === "vpk a" || lower === "vpka") return "VPK A";
  if (lower === "vpk b" || lower === "vpkb") return "VPK B";

  return null;
}

function normalizeTileLabel(label) {
  const s = String(label || "")
    .trim()
    .toLowerCase();
  if (!s) return null;

  const room = normalizeRoom(label);
  if (room) return { type: "room", id: room };

  if (s.includes("todds playground"))
    return { type: "location", id: "Todds Playground" };
  if (s.includes("2s & 3s playground") || s.includes("2s and 3s playground"))
    return { type: "location", id: "2s & 3s Playground" };
  if (s.includes("vpk playground"))
    return { type: "location", id: "VPK Playground" };
  if (s.includes("soccer field"))
    return { type: "location", id: "Soccer Field" };
  if (s.includes("splash pad")) return { type: "location", id: "Splash Pad" };
  if (s === "kitchen") return { type: "location", id: "Kitchen" };

  return null;
}

function isNoiseLine(line) {
  const s = String(line || "").trim();
  if (!s) return true;

  const lower = s.toLowerCase();

  if (lower === "all") return true;
  if (normalizeTileLabel(s)) return true;

  if (/^\d+kidsstaff\d+$/i.test(s)) return true;
  if (/^\d+\s*kids\s*staff\s*\d+$/i.test(s)) return true;
  if (/^staff\d+$/i.test(s)) return true;

  const junkStarts = [
    "choose a classroom",
    "add class",
    "change metric",
    "showing ratios",
    "center stats",
    "enrollment",
    "reminders",
    "missing",
    "health screens",
    "hover over stats",
    "active",
    "inactive",
    "combined",
    "students",
    "staff",
    "filter by name",
    "attendance",
    "15 minute counts",
    "reports",
    "export to csv",
    "add employee",
    "student in out hours",
  ];

  if (junkStarts.some((j) => lower.startsWith(j))) return true;
  if (/^\d+\s+in$/i.test(s)) return true;
  if (/^\d+\s+out$/i.test(s)) return true;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return true;

  return false;
}

function looksLikeRoleLabel(line) {
  const lower = String(line || "")
    .trim()
    .toLowerCase();
  if (!lower) return false;

  const exacts = new Set([
    "assistant director",
    "director",
    "chef",
    "soccer",
    "crm",
    "mkt",
    "kitchen classroom",
    "tcf",
    "tcf-regional",
    "tcf-operations",
    "tcf-education",
    "tcf-hr",
    "tcf-marketing",
    "wiregrass ranch",
    "basketball coach",
  ]);

  if (exacts.has(lower)) return true;
  if (lower.includes("assistant director")) return true;
  if (lower.includes("director")) return true;
  if (lower.includes("coach")) return true;
  if (lower.includes("chef")) return true;
  if (lower.includes("trial")) return true;
  if (lower.includes("substitute")) return true;
  if (lower.includes("regional")) return true;
  if (lower.includes("operations")) return true;
  if (lower.includes("education")) return true;
  if (lower.includes("marketing")) return true;
  if (lower.includes("hr")) return true;

  return false;
}

function looksLikePersonName(line) {
  const s = String(line || "").trim();
  if (!s) return false;
  if (isNoiseLine(s)) return false;
  if (normalizeTileLabel(s)) return false;
  if (isPermanentlyExcludedName(s)) return false;
  if (isBannedRosterName(s)) return false;
  if (looksLikeRoleLabel(s)) return false;
  if (/^\d/.test(s)) return false;
  if (!/[A-Za-z]/.test(s)) return false;
  return s.split(/\s+/).filter(Boolean).length >= 1;
}

function parseAttendanceMap(text) {
  const raw = String(text || "");
  const normalized = raw.replace(/\r/g, "\n");
  const attendanceMarker = normalized.toLowerCase().indexOf("attendance");
  if (attendanceMarker === -1) return new Map();

  const tail = normalized.slice(attendanceMarker);
  const lines = tail
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const map = new Map();
  const timeRe =
    /^(.*?)\s+(\d{1,2}:\d{2}\s*(?:AM|PM))(?:\s+(\d{1,2}:\d{2}\s*(?:AM|PM)))?$/i;

  for (const line of lines) {
    if (isNoiseLine(line)) continue;

    const m = line.match(timeRe);
    if (!m) continue;

    const name = (m[1] || "").trim();
    if (!looksLikePersonName(name)) continue;

    const inTime = (m[2] || "").trim();
    const outTime = (m[3] || "").trim();

    map.set(canonName(name), { inTime, outTime });
  }

  return map;
}

function parseTilesSnapshot(text) {
  let raw = (text || "").replace(/\r/g, " ").trim();
  const rooms = {};
  const locations = {};
  if (!raw) return { rooms, locations };

  raw = raw
    .replace(/(\d+)\s*kidsstaff\s*(\d+)/gi, "$1 kids staff $2")
    .replace(/(\d+)kidsstaff(\d+)/gi, "$1 kids staff $2")
    .replace(/(\d+)\s*kids\s*staff\s*(\d+)/gi, "$1 kids staff $2");

  const re =
    /(\d+)\s*kids\s*staff\s*(\d+)\s*([A-Za-z0-9'’&\s]+?)(?=\s*\d+\s*kids\s*staff|\s*$)/gi;

  let match;
  while ((match = re.exec(raw)) !== null) {
    const kidsCount = Number(match[1]);
    const staffCount = Number(match[2]);
    const label = (match[3] || "").trim();

    const norm = normalizeTileLabel(label);
    if (!norm) continue;

    if (norm.type === "room")
      rooms[norm.id] = { kids: kidsCount, staff: staffCount };
    if (norm.type === "location")
      locations[norm.id] = { kids: kidsCount, staff: staffCount };
  }

  return { rooms, locations };
}

function extractDetectedPeopleFromInSection(text) {
  const lines = String(text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const startIdx = lines.findIndex((l) => /^\d+\s+in$/i.test(l));
  if (startIdx === -1) return [];

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^\d+\s+out$/i.test(lines[i]) || /^add employee$/i.test(lines[i])) {
      endIdx = i;
      break;
    }
  }

  const section = lines.slice(startIdx + 1, endIdx);
  const detected = [];

  for (let i = 0; i < section.length; i++) {
    const current = section[i];
    if (!looksLikePersonName(current)) continue;

    const next = section[i + 1] || "";
    const nextRoom = normalizeRoom(next);
    const nextLooksRole = looksLikeRoleLabel(next);

    detected.push({
      name: current,
      room: nextRoom || null,
      roleHint: nextLooksRole ? next : "",
    });
  }

  return detected;
}

function ceilDiv(a, b) {
  return Math.ceil(a / b);
}

function requiredStaffForRoom({ room, kids, napMode }) {
  const ratio = RATIOS[room];
  if (!ratio || kids == null) return null;

  const normalRequired = ceilDiv(kids, ratio);
  const napApplies = napMode && NAP_ROOMS.has(room);
  if (!napApplies) return normalRequired;
  return Math.max(1, Math.ceil(normalRequired / 2));
}

function statusForRoom({ room, kids, capacity, activeStaff, requiredStaff }) {
  if (!RATIOS[room]) return { label: "", tone: "neutral" };
  if (kids == null) return { label: "Kids?", tone: "neutral" };
  if (requiredStaff == null) return { label: "Req?", tone: "neutral" };

  if (activeStaff < requiredStaff)
    return { label: "Out of Ratio", tone: "bad" };

  const isMaxed = capacity != null && kids === capacity;
  const isFragile = activeStaff === requiredStaff;

  if (isFragile && isMaxed) return { label: "Fragile + Maxed", tone: "warn2" };
  if (isFragile) return { label: "Fragile", tone: "warn" };

  const surplus = activeStaff - requiredStaff;
  if (surplus > 0) return { label: `Green +${surplus}`, tone: "goodplus" };
  return { label: "Green", tone: "good" };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function parseTimeToMinutes(s) {
  const t = String(s || "").trim();
  if (!t) return null;
  const m = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hh = Number(m[1]);
  const mm = Number(m[2]);
  const ap = m[3].toUpperCase();
  if (ap === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }
  return hh * 60 + mm;
}

function minutesToTime(mins) {
  const hh24 = Math.floor(mins / 60) % 24;
  const mm = mins % 60;
  const ap = hh24 >= 12 ? "PM" : "AM";
  let hh = hh24 % 12;
  if (hh === 0) hh = 12;
  return `${hh}:${pad2(mm)} ${ap}`;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

function parseShiftRange(shiftStart, shiftEnd) {
  const start =
    parseTimeToMinutes(shiftStart || "") ?? parseTimeToMinutes("7:00 AM");
  const end =
    parseTimeToMinutes(shiftEnd || "") ?? parseTimeToMinutes("6:00 PM");
  return { start, end };
}

function roomPriority(room) {
  return ROOM_ORDER.indexOf(room);
}

function yayaBlockedForMealWindow(startMin, endMin, teacherName) {
  if (canonName(teacherName) !== "yajaira lopez") return false;

  const blockedWindows = [
    [parseTimeToMinutes("8:00 AM"), parseTimeToMinutes("9:00 AM")],
    [parseTimeToMinutes("11:00 AM"), parseTimeToMinutes("12:15 PM")],
    [parseTimeToMinutes("2:15 PM"), parseTimeToMinutes("3:15 PM")],
  ];

  return blockedWindows.some(([a, b]) => overlaps(startMin, endMin, a, b));
}

function staffWeightForCoverage(t) {
  let score = 0;

  if (t.role === "Breaker") score += 1000;
  else if (t.role === "Admin Cover") score += 800;
  else if (t.role === "Classroom") score += 500;

  const full = canonName(t.name);
  const first = firstNameKey(t.name);

  if (full.includes("gabriela isambert")) score += 70;
  if (full.includes("gordon martin")) score += 65;
  if (full.includes("jean derenzo")) score += 60;
  if (first === "patti" || first === "patricia") score += 55;
  if (full.includes("yajaira lopez")) score += 35;

  return score;
}

function makeEventId() {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function eventBlocksTime(event, startMin, endMin) {
  if (event.isAllDay) return true;
  const eventStart = parseTimeToMinutes(event.startTime || "");
  const eventEnd = parseTimeToMinutes(event.endTime || "");
  if (eventStart == null || eventEnd == null) return true;
  return overlaps(startMin, endMin, eventStart, eventEnd);
}

function getEntriesForDate(entries, selectedDate) {
  return (entries || []).filter((e) => e.date === selectedDate);
}

function getPlannedConstraintsForStaff(staffName, selectedDate, entries) {
  return (entries || []).filter(
    (e) =>
      canonName(e.staffName) === canonName(staffName) &&
      e.date === selectedDate &&
      e.status !== "cancelled",
  );
}

function staffBlockedByPlannedEvent(
  staffName,
  selectedDate,
  startMin,
  endMin,
  events,
  purpose,
) {
  const matches = getPlannedConstraintsForStaff(
    staffName,
    selectedDate,
    events,
  );

  return matches.some((e) => {
    if (!eventBlocksTime(e, startMin, endMin)) return false;

    if (purpose === "coverage") return !!e.affectsCoverage;
    if (purpose === "ratio") return !!e.affectsRatio;
    return true;
  });
}

function findRosterMatchForDetectedName(name, roster) {
  const detectedId = makeId(name);
  const detectedCanon = canonName(name);
  const detectedParts = splitNameParts(name);

  for (const r of roster || []) {
    if (makeId(r.name) === detectedId) return r;
  }

  for (const r of roster || []) {
    if (canonName(r.name) === detectedCanon) return r;
  }

  const firstLastInitialMatches = (roster || []).filter((r) => {
    const rp = splitNameParts(r.name);
    if (!rp.first || !detectedParts.first) return false;
    return (
      rp.first === detectedParts.first &&
      rp.lastInitial &&
      detectedParts.lastInitial &&
      rp.lastInitial === detectedParts.lastInitial
    );
  });
  if (firstLastInitialMatches.length === 1) return firstLastInitialMatches[0];

  const firstNameMatches = (roster || []).filter((r) => {
    const rp = splitNameParts(r.name);
    return rp.first && detectedParts.first && rp.first === detectedParts.first;
  });
  if (firstNameMatches.length === 1) return firstNameMatches[0];

  return null;
}

function Badge({ tone, text }) {
  const styles = {
    neutral: { background: "#f2f2f2", border: "#ddd", color: "#333" },
    good: { background: "#e9f7ec", border: "#bfe6c7", color: "#145a23" },
    goodplus: { background: "#e2f6ff", border: "#b9e8ff", color: "#0b4f6c" },
    warn: { background: "#fff5db", border: "#ffe2a3", color: "#6a4b00" },
    warn2: { background: "#ffe8e8", border: "#ffbaba", color: "#7a0c0c" },
    bad: { background: "#ffe1e1", border: "#ff9f9f", color: "#7a0c0c" },
  }[tone] || { background: "#f2f2f2", border: "#ddd", color: "#333" };

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 900,
        padding: "4px 8px",
        borderRadius: 999,
        border: `1px solid ${styles.border}`,
        background: styles.background,
        color: styles.color,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function DroppableRoom({ roomName, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: `room::${roomName}` });
  return (
    <div
      ref={setNodeRef}
      style={{ outline: isOver ? "3px solid #111" : "none", borderRadius: 12 }}
    >
      {children}
    </div>
  );
}

function RoomCard({
  roomName,
  teacherIds,
  kids,
  effectiveKids,
  adjustment,
  capacity,
  activeStaff,
  requiredStaff,
  status,
  staffSourceLabel,
  children,
}) {
  const showKids = RATIOS[roomName] != null;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 12,
        background: "#fff",
        minHeight: 190,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 16 }}>{roomName}</div>

            <div style={{ color: "#666", fontSize: 12 }}>
              {teacherIds.length} tokens · <b>Staff:</b> {activeStaff}
              {staffSourceLabel ? (
                <span style={{ color: "#888" }}> ({staffSourceLabel})</span>
              ) : null}
            </div>

            {status?.label ? (
              <Badge tone={status.tone} text={status.label} />
            ) : null}
          </div>

          {showKids ? (
            <div
              style={{
                fontSize: 12,
                color: "#444",
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span>
                Kids: <b>{kids ?? "—"}</b>
              </span>
              <span>
                Override:{" "}
                <b>{adjustment > 0 ? `+${adjustment}` : adjustment}</b>
              </span>
              <span>
                Effective: <b>{effectiveKids ?? "—"}</b> /{" "}
                <b>{capacity ?? "—"}</b>
              </span>
              <span>
                Required: <b>{requiredStaff ?? "—"}</b>
              </span>
              <span>
                Ratio: <b>1:{RATIOS[roomName]}</b>
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#777" }}>Non-ratio area</div>
          )}
        </div>
      </div>

      <SortableContext items={teacherIds} strategy={rectSortingStrategy}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {children}
        </div>
      </SortableContext>
    </div>
  );
}

function TeacherToken({ teacher, onOpen, onToggleCallout }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: teacher.id,
    disabled: teacher.calledOut || teacher.isMissing || teacher.notLoggedIn,
  });

  const isOut = !!teacher.calledOut;
  const isMissing = !!teacher.isMissing;
  const notLoggedIn = !!teacher.notLoggedIn;

  const bg =
    isOut || isMissing || notLoggedIn
      ? "#f2f2f2"
      : teacher.onBreak
        ? "#ffe9c2"
        : "#f4f6ff";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: 58,
    height: 58,
    borderRadius: 999,
    border: "2px solid #111",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    background: bg,
    opacity: isOut
      ? 0.45
      : isDragging
        ? 0.5
        : isMissing || notLoggedIn
          ? 0.55
          : 1,
    cursor: isOut || isMissing || notLoggedIn ? "not-allowed" : "grab",
    position: "relative",
    userSelect: "none",
    filter: isOut || isMissing || notLoggedIn ? "grayscale(0.6)" : "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        title={[
          teacher.name,
          teacher.role === "Breaker" ? "(BREAKER)" : "",
          teacher.role === "Admin Cover" ? "(ADMIN COVER)" : "",
          teacher.noBreaks ? "(NO BREAKS)" : "",
          teacher.force30 ? "(30 MIN ONLY)" : "",
          teacher.room ? `Room: ${teacher.room}` : "",
          isMissing ? "MISSING" : "",
          notLoggedIn ? "NO IN" : "",
          isOut ? "OUT" : "",
          teacher.breakCompleted ? "DONE" : "",
        ]
          .filter(Boolean)
          .join(" • ")}
      >
        {teacher.initials}

        {(isMissing || notLoggedIn) && !isOut && (
          <span
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#111",
              color: "#fff",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            {isMissing ? "MISSING" : "NO IN"}
          </span>
        )}

        {teacher.breakCompleted && !isOut && !isMissing && !notLoggedIn && (
          <span
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#111",
              color: "#fff",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            DONE
          </span>
        )}

        {isOut && (
          <span
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              background: "#111",
              color: "#fff",
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              whiteSpace: "nowrap",
            }}
          >
            OUT
          </span>
        )}

        {teacher.noBreaks && (
          <span
            title="No breaks"
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 18,
              height: 18,
              borderRadius: 999,
              background: "#d90000",
              color: "#fff",
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
            }}
          >
            !
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => onOpen(teacher.id)}
          disabled={teacher.isMissing || teacher.notLoggedIn}
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "4px 6px",
            fontSize: 11,
            background: "#fff",
            cursor:
              teacher.isMissing || teacher.notLoggedIn
                ? "not-allowed"
                : "pointer",
            opacity: teacher.isMissing || teacher.notLoggedIn ? 0.5 : 1,
          }}
        >
          Plan
        </button>

        <button
          onClick={() => onToggleCallout?.(teacher.id)}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: "4px 6px",
            fontSize: 11,
            background: teacher.calledOut ? "#111" : "#fff",
            color: teacher.calledOut ? "#fff" : "#111",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          OUT
        </button>
      </div>
    </div>
  );
}

function TeacherPlannerModal({ teacher, onClose, onUpdate }) {
  const [start, setStart] = useState(teacher.breakPlan.start || "");
  const [minutes, setMinutes] = useState(
    teacher.breakPlan.minutes ?? (teacher.force30 ? 30 : 60),
  );

  useEffect(() => {
    setStart(teacher.breakPlan.start || "");
    setMinutes(teacher.breakPlan.minutes ?? (teacher.force30 ? 30 : 60));
  }, [
    teacher?.id,
    teacher?.breakPlan?.start,
    teacher?.breakPlan?.minutes,
    teacher?.force30,
  ]);

  const suggestedMessage = useMemo(() => {
    const when = start ? start : "your scheduled time";
    const mins = minutes === 0 ? "no break" : `${minutes}-min break`;
    return `Hi ${teacher.name.split(" ")[0]} — please take your ${mins} at ${when}. Thank you!`;
  }, [teacher.name, start, minutes]);

  function save() {
    if (teacher.noBreaks && minutes > 0) {
      alert("Rule: this person does not take breaks. Set minutes to 0.");
      return;
    }
    if (teacher.force30 && minutes > 30) {
      alert("Rule: Carolina only takes 30-minute breaks.");
      return;
    }
    if (teacher.breakCompleted) {
      alert("This teacher is marked DONE. No break needed.");
      return;
    }
    if (teacher.isMissing || teacher.notLoggedIn) {
      alert("This person is not detected/logged in.");
      return;
    }

    onUpdate(teacher.id, {
      breakPlan: { start, minutes, message: suggestedMessage },
    });
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 560,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          boxShadow: "0 10px 40px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18 }}>{teacher.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              Room: <b>{teacher.room}</b>
              {teacher.noBreaks ? " · NO BREAKS" : ""}
              {teacher.force30 ? " · 30 MIN ONLY" : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: "6px 10px",
              background: "#fff",
              cursor: "pointer",
              height: 34,
            }}
          >
            Close
          </button>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>Break start</span>
            <input
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="e.g., 12:30 PM"
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 800 }}>Minutes</span>
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: "10px 12px",
                fontSize: 14,
                background: "#fff",
              }}
            >
              <option value={0}>0 (no break)</option>
              <option value={30}>30</option>
              {!teacher.force30 && <option value={60}>60</option>}
            </select>
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={save}
            style={{
              border: "1px solid #111",
              borderRadius: 12,
              padding: "10px 12px",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Save break plan
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- App -------------------------------- */

export default function App() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  const coverageScheduleRef = useRef(null);

  const [pasteText, setPasteText] = useState("");
  const [napMode, setNapMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayISODate());

  const [settings, setSettings] = useState(() => {
    const fromLS = safeJsonParse(localStorage.getItem(LS_SETTINGS), null);
    return fromLS || { autoAddFromPaste: true };
  });

  const [roster, setRoster] = useState(() => {
    const fromLS = safeJsonParse(localStorage.getItem(LS_ROSTER), null);
    if (Array.isArray(fromLS) && fromLS.length) return fromLS;
    return [...WHITEBOARD_ROSTER_SEED];
  });

  const [excluded, setExcluded] = useState(() => {
    const fromLS = safeJsonParse(localStorage.getItem(LS_EXCLUDED), null);
    if (Array.isArray(fromLS)) return fromLS;
    return [];
  });

  const [plannedAvailability, setPlannedAvailability] = useState(() => {
    return safeJsonParse(localStorage.getItem(LS_PLANNED_AVAILABILITY), []);
  });

  const [teachers, setTeachers] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [plannerOpenId, setPlannerOpenId] = useState(null);
  const [copyFlash, setCopyFlash] = useState("");

  const [kidsCounts, setKidsCounts] = useState(() => {
    const initial = {};
    Object.keys(RATIOS).forEach((r) => (initial[r] = ""));
    return initial;
  });

  const [staffCounts, setStaffCounts] = useState(() => {
    const initial = {};
    Object.keys(RATIOS).forEach((r) => (initial[r] = ""));
    return initial;
  });

  const [kidsOverrides, setKidsOverrides] = useState(() => {
    const initial = {};
    Object.keys(RATIOS).forEach((r) => (initial[r] = 0));
    return initial;
  });

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffRoom, setNewStaffRoom] = useState("Not in room");
  const [newStaffRole, setNewStaffRole] = useState("Classroom");
  const [newShiftStart, setNewShiftStart] = useState("");
  const [newShiftEnd, setNewShiftEnd] = useState("");

  const [newAvailabilityEvent, setNewAvailabilityEvent] = useState({
    staffName: "",
    date: todayISODate(),
    startTime: "",
    endTime: "",
    isAllDay: false,
    entryType: "unavailable_for_coverage",
    affectsRatio: false,
    affectsCoverage: true,
    note: "",
    status: "confirmed",
  });

  useEffect(
    () => localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)),
    [settings],
  );
  useEffect(
    () => localStorage.setItem(LS_ROSTER, JSON.stringify(roster)),
    [roster],
  );
  useEffect(
    () => localStorage.setItem(LS_EXCLUDED, JSON.stringify(excluded)),
    [excluded],
  );
  useEffect(
    () =>
      localStorage.setItem(
        LS_PLANNED_AVAILABILITY,
        JSON.stringify(plannedAvailability),
      ),
    [plannedAvailability],
  );

  const excludedFullSet = useMemo(
    () => new Set((excluded || []).map((x) => canonName(x)).filter(Boolean)),
    [excluded],
  );

  function isExcludedName(name) {
    const nm = canonName(name);
    if (!nm) return true;
    if (isBannedRosterName(nm)) return true;
    if (isPermanentlyExcludedName(name)) return true;
    if (excludedFullSet.has(nm)) return true;
    return false;
  }

  const rosterById = useMemo(() => {
    const m = new Map();
    for (const r of roster) {
      if (!r?.name) continue;
      m.set(makeId(r.name), r);
    }
    return m;
  }, [roster]);

  const dateEvents = useMemo(
    () =>
      getEntriesForDate(plannedAvailability, selectedDate).filter(
        (e) => e.status !== "cancelled",
      ),
    [plannedAvailability, selectedDate],
  );

  function rosterShiftHintForName(name) {
    const rosterEntry =
      findRosterMatchForDetectedName(name, roster) ||
      rosterById.get(makeId(name));
    if (rosterEntry?.shiftStart || rosterEntry?.shiftEnd) {
      return {
        start: rosterEntry.shiftStart || "",
        end: rosterEntry.shiftEnd || "",
      };
    }
    return null;
  }

  function parsePasteToDetected(text) {
    const raw = (text || "").trim();
    if (!raw) return { detected: [], attendanceMap: new Map() };

    const attendanceMap = parseAttendanceMap(raw);
    const inSectionPeople = extractDetectedPeopleFromInSection(raw);

    const detected = [];
    const seen = new Set();

    for (const p of inSectionPeople) {
      const rawName = p.name;
      if (!looksLikePersonName(rawName)) continue;
      if (isBannedRosterName(rawName)) continue;
      if (isPermanentlyExcludedName(rawName)) continue;
      if (isExcludedName(rawName)) continue;

      const rosterEntry =
        findRosterMatchForDetectedName(rawName, roster) ||
        rosterById.get(makeId(rawName));

      if (rosterEntry?.role === "Non-classroom") continue;

      const canonicalDetectedName = rosterEntry?.name || rawName;
      const id = makeId(canonicalDetectedName);
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const attendanceHit =
        attendanceMap.get(canonName(canonicalDetectedName)) ||
        attendanceMap.get(canonName(rawName)) ||
        null;

      const inTime = attendanceHit?.inTime || "";
      const outTime = attendanceHit?.outTime || "";

      const inferredRole =
        rosterEntry?.role ||
        (canonName(p.roleHint).includes("assistant director")
          ? "Admin Cover"
          : canonName(p.roleHint).includes("chef")
            ? "Breaker"
            : "Classroom");

      if (inferredRole === "Non-classroom") continue;

      const room =
        normalizeRoom(p.room) ||
        normalizeRoom(rosterEntry?.defaultRoom) ||
        "Not in room";
      const noBreaks = isNoBreakName(canonicalDetectedName);
      const force30 = isThirtyMinuteOnlyName(canonicalDetectedName);

      const notLoggedIn = !inTime;
      const breakCompleted = !!outTime;
      const inRatioClassroom = RATIOS[room] != null;
      const autoMinutes = notLoggedIn
        ? 0
        : breakCompleted
          ? 0
          : noBreaks
            ? 0
            : force30
              ? 30
              : inRatioClassroom
                ? 60
                : 0;

      detected.push({
        id,
        name: canonicalDetectedName,
        initials: defaultInitials(canonicalDetectedName),
        room,
        role: inferredRole,
        onBreak: false,
        calledOut: false,
        attendance: { inTime, outTime },
        notLoggedIn,
        breakCompleted,
        isMissing: false,
        shiftHint: rosterShiftHintForName(canonicalDetectedName),
        noBreaks,
        force30,
        breakPlan: { start: "", minutes: autoMinutes, message: "" },
        coverageAssignment: null,
        coveringAnotherRoom: null,
      });
    }

    return { detected: applyUniqueInitials(detected), attendanceMap };
  }

  function mergeDetectedWithRoster(detected) {
    const detectedById = new Map(detected.map((t) => [t.id, t]));
    const merged = [...detected];

    for (const r of roster) {
      if (!r?.name) continue;
      if (r.role === "Non-classroom") continue;

      const id = makeId(r.name);
      if (!id || detectedById.has(id)) continue;

      merged.push({
        id,
        name: r.name,
        initials: defaultInitials(r.name),
        room: normalizeRoom(r.defaultRoom) || "Not in room",
        role: r.role || "Classroom",
        onBreak: false,
        calledOut: false,
        attendance: { inTime: "", outTime: "" },
        notLoggedIn: true,
        breakCompleted: false,
        isMissing: true,
        shiftHint: rosterShiftHintForName(r.name),
        noBreaks: isNoBreakName(r.name),
        force30: isThirtyMinuteOnlyName(r.name),
        breakPlan: {
          start: "",
          minutes: isNoBreakName(r.name)
            ? 0
            : isThirtyMinuteOnlyName(r.name)
              ? 30
              : 0,
          message: "",
        },
        coverageAssignment: null,
        coveringAnotherRoom: null,
      });
    }

    merged.sort((a, b) => {
      const roomCmp = roomPriority(a.room) - roomPriority(b.room);
      if (roomCmp !== 0) return roomCmp;
      return a.name.localeCompare(b.name);
    });

    return applyUniqueInitials(merged);
  }

  function maybePromptAddNewNames(detected) {
    if (!settings.autoAddFromPaste) return;

    setRoster((prev) => {
      const existing = new Set((prev || []).map((r) => makeId(r.name)));
      const next = [...(prev || [])];

      for (const t of detected) {
        if (!t?.name) continue;
        if (normalizeTileLabel(t.name)) continue;
        if (isNoiseLine(t.name)) continue;
        if (!looksLikePersonName(t.name)) continue;

        const id = makeId(t.name);
        if (!id || existing.has(id)) continue;

        const ok = window.confirm(
          `New name detected: "${t.name}".\n\nOK = Add to roster\nCancel = Ignore`,
        );
        if (!ok) continue;

        next.push({
          name: t.name,
          defaultRoom: normalizeRoom(t.room) || "Not in room",
          role: "Classroom",
          shiftStart: "",
          shiftEnd: "",
        });
        existing.add(id);
      }

      return next;
    });
  }

  function updateFromPaste() {
    const { rooms } = parseTilesSnapshot(pasteText);
    const roomEntries = Object.entries(rooms || {});
    if (roomEntries.length > 0) {
      setKidsCounts((prev) => {
        const next = { ...prev };
        for (const [room, data] of roomEntries) {
          if (next[room] !== undefined) next[room] = String(data.kids);
        }
        return next;
      });

      setStaffCounts((prev) => {
        const next = { ...prev };
        for (const [room, data] of roomEntries) {
          if (next[room] !== undefined) next[room] = String(data.staff);
        }
        return next;
      });
    }

    const { detected } = parsePasteToDetected(pasteText);
    maybePromptAddNewNames(detected);
    const merged = mergeDetectedWithRoster(detected);
    setTeachers(merged);
    setCoverage([]);
  }

  const idToTeacher = useMemo(() => {
    const m = new Map();
    (teachers || []).forEach((t) => m.set(t.id, t));
    return m;
  }, [teachers]);

  const roomToTeacherIds = useMemo(() => {
    const map = new Map();
    BOARD_ROOMS.forEach((r) => map.set(r, []));
    for (const t of teachers) {
      const room = normalizeRoom(t.room) || "Not in room";
      if (!map.has(room)) map.set(room, []);
      map.get(room).push(t.id);
    }
    return map;
  }, [teachers]);

  const effectiveKidsCounts = useMemo(() => {
    const out = {};
    for (const room of Object.keys(RATIOS)) {
      const rawKids = (kidsCounts[room] ?? "").toString().trim();
      const baseKids = /^\d+$/.test(rawKids) ? Number(rawKids) : 0;
      const adj = Number(kidsOverrides[room] || 0);
      out[room] = Math.max(0, baseKids + adj);
    }
    return out;
  }, [kidsCounts, kidsOverrides]);

  const roomStats = useMemo(() => {
    const stats = {};
    for (const room of BOARD_ROOMS) {
      const ids = roomToTeacherIds.get(room) || [];
      const teachersInRoom = ids
        .map((id) => idToTeacher.get(id))
        .filter(Boolean);

      const activeTokens = teachersInRoom.filter(
        (t) => !t.onBreak && !t.calledOut && !t.isMissing && !t.notLoggedIn,
      ).length;

      const activeClassroomTokens = teachersInRoom.filter(
        (t) =>
          !t.onBreak &&
          !t.calledOut &&
          !t.isMissing &&
          !t.notLoggedIn &&
          t.role === "Classroom",
      ).length;

      const isClassroom = RATIOS[room] != null;
      const rawStaff = (staffCounts[room] ?? "").toString().trim();
      const tileStaff =
        isClassroom && /^\d+$/.test(rawStaff) ? Number(rawStaff) : null;

      const activeStaffForRatio = isClassroom
        ? tileStaff != null
          ? tileStaff
          : activeClassroomTokens
        : activeTokens;
      const staffSourceLabel = isClassroom
        ? tileStaff != null
          ? "tiles"
          : "tokens"
        : "";

      const rawKids = (kidsCounts[room] ?? "").toString().trim();
      const baseKids =
        isClassroom && /^\d+$/.test(rawKids)
          ? Number(rawKids)
          : isClassroom
            ? null
            : null;
      const adj = isClassroom ? Number(kidsOverrides[room] || 0) : 0;
      const effectiveKids =
        isClassroom && baseKids != null
          ? Math.max(0, baseKids + adj)
          : isClassroom
            ? null
            : null;

      const cap = isClassroom ? (CAPACITY[room] ?? null) : null;
      const req =
        isClassroom && effectiveKids != null
          ? requiredStaffForRoom({ room, kids: effectiveKids, napMode })
          : null;

      const status = isClassroom
        ? statusForRoom({
            room,
            kids: effectiveKids,
            capacity: cap,
            activeStaff: activeStaffForRatio,
            requiredStaff: req,
          })
        : { label: "", tone: "neutral" };

      stats[room] = {
        activeStaff: activeStaffForRatio,
        activeTokens,
        activeClassroomTokens,
        tileStaff,
        staffSourceLabel,
        kidsNow: baseKids,
        effectiveKids,
        adjustment: adj,
        cap,
        req,
        status,
        surplus: req == null ? 0 : activeStaffForRatio - req,
      };
    }
    return stats;
  }, [
    roomToTeacherIds,
    idToTeacher,
    kidsCounts,
    staffCounts,
    kidsOverrides,
    napMode,
  ]);

  const legendItems = useMemo(() => {
    return (teachers || [])
      .filter(
        (t) => t && !t.isMissing && !t.notLoggedIn && t.attendance?.inTime,
      )
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((t) => {
        const hint = rosterShiftHintForName(t.name);
        const shiftText =
          hint?.start || hint?.end
            ? `${hint.start || "?"}–${hint.end || "?"}`
            : "—";
        return { ...t, shiftText };
      });
  }, [teachers, rosterById, roster]);

  const projectedRisk = useMemo(() => {
    const warnings = [];
    const ratioEvents = dateEvents.filter((e) => e.affectsRatio);
    const coverageEvents = dateEvents.filter((e) => e.affectsCoverage);

    for (const room of CLASSROOMS) {
      const roomTeachers = (teachers || []).filter(
        (t) =>
          t.room === room &&
          t.role === "Classroom" &&
          !t.calledOut &&
          !t.isMissing &&
          !t.notLoggedIn,
      );

      const blockedRatioCount = roomTeachers.filter((t) =>
        staffBlockedByPlannedEvent(
          t.name,
          selectedDate,
          parseTimeToMinutes("11:00 AM"),
          parseTimeToMinutes("3:30 PM"),
          plannedAvailability,
          "ratio",
        ),
      ).length;

      if (blockedRatioCount > 0) {
        warnings.push(
          `${room}: ${blockedRatioCount} planned staffing block${blockedRatioCount > 1 ? "s" : ""} affecting ratio.`,
        );
      }

      const required = roomStats[room]?.req;
      const active = roomStats[room]?.activeStaff;
      if (required != null && active != null && active === required) {
        warnings.push(
          `${room} is already fragile before planned future blocks are applied.`,
        );
      }
    }

    for (const e of coverageEvents) {
      warnings.push(
        `${e.staffName} unavailable for coverage${e.isAllDay ? " all day" : ` ${e.startTime || "?"}-${e.endTime || "?"}`}.`,
      );
    }

    return {
      ratioEvents: ratioEvents.length,
      coverageEvents: coverageEvents.length,
      warnings: Array.from(new Set(warnings)).slice(0, 12),
    };
  }, [dateEvents, teachers, selectedDate, plannedAvailability, roomStats]);

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const teacherId = active.id;
    const overId = over.id;

    let targetRoom = null;
    if (typeof overId === "string" && overId.startsWith("room::")) {
      targetRoom = overId.replace("room::", "");
    } else {
      const overTeacher = idToTeacher.get(overId);
      if (overTeacher)
        targetRoom = normalizeRoom(overTeacher.room) || "Not in room";
    }

    if (!targetRoom || !BOARD_ROOMS.includes(targetRoom)) return;

    setTeachers((prev) =>
      applyUniqueInitials(
        (prev || []).map((t) => {
          if (t.id !== teacherId) return t;
          if (t.calledOut || t.isMissing || t.notLoggedIn) return t;
          return { ...t, room: targetRoom };
        }),
      ),
    );
  }

  function toggleCallout(teacherId) {
    setTeachers((prev) =>
      applyUniqueInitials(
        (prev || []).map((t) => {
          if (t.id !== teacherId) return t;
          const next = !t.calledOut;
          return {
            ...t,
            calledOut: next,
            onBreak: next ? false : t.onBreak,
            coverageAssignment: next ? null : t.coverageAssignment,
            coveringAnotherRoom: next ? null : t.coveringAnotherRoom,
          };
        }),
      ),
    );
  }

  function updateTeacher(teacherId, patch) {
    setTeachers((prev) =>
      applyUniqueInitials(
        (prev || []).map((t) => {
          if (t.id !== teacherId) return t;
          const next = { ...t, ...patch };
          if (patch.breakPlan)
            next.breakPlan = {
              ...(t.breakPlan || {}),
              ...(patch.breakPlan || {}),
            };
          return next;
        }),
      ),
    );
  }

  function updateKids(room, value) {
    const v = String(value || "").replace(/[^\d]/g, "");
    setKidsCounts((prev) => ({ ...prev, [room]: v }));
  }

  function updateStaff(room, value) {
    const v = String(value || "").replace(/[^\d]/g, "");
    setStaffCounts((prev) => ({ ...prev, [room]: v }));
  }

  function updateKidsOverride(room, value) {
    const cleaned = String(value || "").trim();
    if (cleaned === "" || cleaned === "-" || cleaned === "+") {
      setKidsOverrides((prev) => ({ ...prev, [room]: 0 }));
      return;
    }
    const n = Number(cleaned);
    if (Number.isNaN(n)) return;
    setKidsOverrides((prev) => ({ ...prev, [room]: Math.trunc(n) }));
  }

  function resetOverrides() {
    const next = {};
    Object.keys(RATIOS).forEach((r) => {
      next[r] = 0;
    });
    setKidsOverrides(next);
  }

  function addPlannedAvailabilityEvent() {
    const e = newAvailabilityEvent;
    if (!e.staffName.trim()) {
      alert("Choose a staff member.");
      return;
    }
    if (!e.date) {
      alert("Choose a date.");
      return;
    }
    if (!e.isAllDay && (!e.startTime || !e.endTime)) {
      alert("Enter a start and end time, or mark All Day.");
      return;
    }

    const record = {
      ...e,
      id: makeEventId(),
      enteredBy: "Gordon Martin",
      createdAt: new Date().toISOString(),
    };

    setPlannedAvailability((prev) =>
      [...prev, record].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!!a.isAllDay !== !!b.isAllDay) return a.isAllDay ? -1 : 1;
        return (a.startTime || "").localeCompare(b.startTime || "");
      }),
    );

    setNewAvailabilityEvent((prev) => ({
      ...prev,
      staffName: "",
      note: "",
      startTime: "",
      endTime: "",
      isAllDay: false,
      entryType: "unavailable_for_coverage",
      affectsRatio: false,
      affectsCoverage: true,
      status: "confirmed",
    }));
  }

  function removePlannedAvailabilityEvent(id) {
    setPlannedAvailability((prev) => prev.filter((e) => e.id !== id));
  }

  function buildCopyPayload() {
    const lines = [];
    lines.push(`Break Plan Summary – ${humanDate(selectedDate)}`);
    lines.push("");

    const pending = [...pendingBreakSummary];
    if (pending.length === 0) {
      lines.push("No pending breaks scheduled.");
    } else {
      for (const r of pending) {
        const coverageText = r.coverage
          ? `${r.coverage.breakerName || "Self / Room"} (${r.coverage.startText}–${r.coverage.endText})`
          : "—";
        lines.push(
          `${r.name} | ${r.room} | ${r.start || "—"} | ${r.minutes} min | ${coverageText}`,
        );
      }
    }

    if (coverage.length > 0) {
      lines.push("");
      lines.push("Coverage Schedule");
      for (const c of [...coverage].sort((a, b) => a.startMin - b.startMin)) {
        lines.push(
          `${c.breakerName || "Self / Room"}${c.breakerRole ? ` (${c.breakerRole})` : ""} -> ${c.teacherName} | ${c.room} | ${c.startText}-${c.endText} | ${c.coverageMode || ""}`,
        );
      }
    }

    if (dateEvents.length > 0) {
      lines.push("");
      lines.push("Planned Absence & Availability");
      for (const e of dateEvents) {
        lines.push(
          `${e.staffName} | ${e.entryType} | ${e.isAllDay ? "All day" : `${e.startTime}-${e.endTime}`} | ratio:${e.affectsRatio ? "Y" : "N"} | coverage:${e.affectsCoverage ? "Y" : "N"} | ${e.status}`,
        );
      }
    }

    return lines.join("\n");
  }

  async function copyBreakPlanPayload() {
    const payload = buildCopyPayload();
    try {
      await navigator.clipboard.writeText(payload);
      setCopyFlash("Copied");
      setTimeout(() => setCopyFlash(""), 1400);
    } catch {
      alert("Clipboard copy failed.");
    }
  }

  async function copyCoverageSchedule() {
    const rows = [...(coverage || [])].sort((a, b) => a.startMin - b.startMin);
    if (!rows.length) {
      alert("There is no coverage schedule to copy.");
      return;
    }

    const lines = [];
    lines.push(`Coverage Schedule (Auto) – ${humanDate(selectedDate)}`);
    lines.push("Cover\tTeacher\tRoom\tTime\tMode");

    for (const c of rows) {
      const coverName = c.breakerName
        ? `${c.breakerName}${c.breakerRole ? ` (${c.breakerRole})` : ""}`
        : "Self / Room";

      lines.push(
        [
          coverName,
          c.teacherName || "",
          c.room || "",
          `${c.startText} – ${c.endText}`,
          c.coverageMode || "",
        ].join("\t"),
      );
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      alert("Coverage schedule copied to clipboard.");
    } catch {
      alert("Clipboard copy failed.");
    }
  }

  function candidateEligibleForBreak(t) {
    if (!t) return false;
    if (t.isMissing || t.notLoggedIn || t.calledOut || t.breakCompleted)
      return false;
    if (t.role !== "Classroom") return false;
    if (t.noBreaks) return false;
    if (RATIOS[t.room] == null) return false;
    return true;
  }

  function roomCanSelfCover(room) {
    if (napMode && NAP_ROOMS.has(room)) return true;
    if (room === "Infants") return true;
    if (TODD_POOL_ROOMS.has(room)) return true;
    return false;
  }

  function autoProposeBreaks() {
    const activeTeachers = (teachers || []).filter(
      (t) =>
        !t.isMissing && !t.notLoggedIn && !t.calledOut && !t.breakCompleted,
    );

    const candidates = activeTeachers
      .filter(candidateEligibleForBreak)
      .map((t) => {
        const shift = parseShiftRange(t.shiftHint?.start, t.shiftHint?.end);
        const preferredMinutes = Math.max(
          0,
          Number(t.breakPlan?.minutes ?? (t.force30 ? 30 : 60)),
        );
        const breakPriority =
          ((roomStats[t.room]?.status?.label || "")
            .toLowerCase()
            .includes("fragile")
            ? 25
            : 0) +
          (t.room === "Infants" ? 20 : 0) +
          (TODD_POOL_ROOMS.has(t.room) ? 15 : 0) +
          (NAP_ROOMS.has(t.room) ? 10 : 0);

        return {
          id: t.id,
          name: t.name,
          room: t.room,
          minutes: t.force30 ? 30 : preferredMinutes || 60,
          shiftStart: shift.start,
          shiftEnd: shift.end,
          breakPriority,
        };
      })
      .sort((a, b) => {
        const priorityRooms = [
          "Infants",
          "Todd A",
          "Todd B",
          "2A",
          "2B",
          "3A",
          "3B",
          "VPK A",
          "VPK B",
        ];
        const roomCmp =
          priorityRooms.indexOf(a.room) - priorityRooms.indexOf(b.room);
        if (roomCmp !== 0) return roomCmp;
        if (a.breakPriority !== b.breakPriority)
          return b.breakPriority - a.breakPriority;
        if (a.shiftStart !== b.shiftStart) return a.shiftStart - b.shiftStart;
        return a.name.localeCompare(b.name);
      });

    if (candidates.length === 0) {
      alert("No eligible classroom teachers found to schedule.");
      return;
    }

    const dynamicCoveragePool = activeTeachers
      .filter(
        (t) =>
          t.role === "Breaker" ||
          t.role === "Admin Cover" ||
          t.role === "Classroom",
      )
      .filter((t) => !t.noBreaks || t.role !== "Classroom")
      .slice()
      .sort((a, b) => {
        const weightDiff =
          staffWeightForCoverage(b) - staffWeightForCoverage(a);
        if (weightDiff !== 0) return weightDiff;
        return a.name.localeCompare(b.name);
      });

    const assignments = [];
    const newPlans = new Map();

    const nextFree = new Map();
    for (const t of activeTeachers)
      nextFree.set(t.id, parseTimeToMinutes("11:00 AM"));

    const SLOT_MINUTES = 30;
    const BASE_START = parseTimeToMinutes("11:00 AM");
    const MAX_END = parseTimeToMinutes("4:30 PM");

    function teacherBusy(id, startMin, endMin) {
      return assignments.some((a) => {
        if (a.teacherId === id)
          return overlaps(startMin, endMin, a.startMin, a.endMin);
        if (a.breakerId === id)
          return overlaps(startMin, endMin, a.startMin, a.endMin);
        return false;
      });
    }

    function startOptionsForCandidate(candidate) {
      const opts = [];
      let cursor = Math.max(BASE_START, candidate.shiftStart || BASE_START);
      cursor =
        BASE_START +
        Math.max(0, Math.ceil((cursor - BASE_START) / SLOT_MINUTES)) *
          SLOT_MINUTES;

      while (
        cursor + candidate.minutes <=
        Math.min(MAX_END, candidate.shiftEnd || MAX_END)
      ) {
        opts.push(cursor);
        cursor += SLOT_MINUTES;
      }
      return opts;
    }

    function roomEffectiveSurplus(room, startMin, endMin) {
      const baseSurplus = roomStats[room]?.surplus ?? 0;
      let outbound = 0;
      let inbound = 0;

      for (const a of assignments) {
        if (!overlaps(startMin, endMin, a.startMin, a.endMin)) continue;

        const breakTeacherRoom = idToTeacher.get(a.teacherId)?.room || "";
        if (breakTeacherRoom === room) outbound += 1;
        if (
          a.coverSourceRoom === room &&
          a.coverSourceRoom !== a.coverTargetRoom
        )
          outbound += 1;
        if (
          a.coverTargetRoom === room &&
          a.coverSourceRoom !== a.coverTargetRoom
        )
          inbound += 1;
      }

      return baseSurplus - outbound + inbound;
    }

    function roomSpecificCoverageBoost(
      coverTeacher,
      targetRoom,
      candidateName,
    ) {
      const full = canonName(coverTeacher.name);
      const candidate = canonName(candidateName);
      let boost = 0;

      if (
        targetRoom === "Infants" &&
        ["marisela perez", "isabel albagranada", "carolina restrepo"].includes(
          full,
        )
      )
        boost += 80;
      if (
        TODD_POOL_ROOMS.has(targetRoom) &&
        [
          "mayolis mujica",
          "johanna bastardo",
          "fatou barow",
          "olga reynolds",
          "maria guerrero",
        ].includes(full)
      )
        boost += 90;
      if (targetRoom === "2B" && full === "jean derenzo") boost += 110;
      if (
        targetRoom === "VPK A" &&
        (full === "patti" || full === "patricia jargo")
      )
        boost += 100;
      if (targetRoom === "3B") {
        if (candidate === "vanessa toro" && full === "ubahara valarmathi")
          boost += 150;
        if (candidate === "ubahara valarmathi" && full === "vanessa toro")
          boost += 150;
      }
      if (
        targetRoom === "3A" &&
        ["kanthi kuchimanchi", "jessica slutter", "hadeel mohamed"].includes(
          full,
        )
      )
        boost += 95;

      return boost;
    }

    function findCoverageOption(candidate, startMin, endMin) {
      const supportCandidates = dynamicCoveragePool
        .filter((t) => t.id !== candidate.id)
        .filter((t) => !teacherBusy(t.id, startMin, endMin))
        .filter((t) => (nextFree.get(t.id) ?? BASE_START) <= startMin)
        .filter((t) => !yayaBlockedForMealWindow(startMin, endMin, t.name))
        .filter(
          (t) =>
            !staffBlockedByPlannedEvent(
              t.name,
              selectedDate,
              startMin,
              endMin,
              plannedAvailability,
              "coverage",
            ),
        )
        .map((t) => {
          const sameRoom = t.room === candidate.room;
          const sameToddPool =
            TODD_POOL_ROOMS.has(t.room) && TODD_POOL_ROOMS.has(candidate.room);
          const sourceRoom = t.room;
          const targetRoom = candidate.room;
          const sourceSurplus = roomEffectiveSurplus(
            sourceRoom,
            startMin,
            endMin,
          );

          let allowed = false;
          let mode = "";
          let bonus = roomSpecificCoverageBoost(t, targetRoom, candidate.name);

          if (t.role === "Breaker") {
            allowed = true;
            mode = "Breaker coverage";
          } else if (t.role === "Admin Cover") {
            allowed = true;
            mode = "Admin coverage";
          } else if (t.role === "Classroom") {
            if (!DYNAMIC_COVERAGE_CLASSROOMS.has(t.room)) {
              allowed = false;
            } else if (
              sameRoom &&
              (roomCanSelfCover(candidate.room) ||
                (roomStats[candidate.room]?.activeClassroomTokens ?? 0) >= 2)
            ) {
              allowed = true;
              mode = "Same-room classroom coverage";
              bonus += 120;
            } else if (sameToddPool) {
              allowed = true;
              mode = "Shared Todds coverage";
              bonus += 130;
            } else if (napMode && NAP_ROOMS.has(candidate.room) && sameRoom) {
              allowed = true;
              mode = "During-nap same-room coverage";
              bonus += 160;
            } else if (!sameRoom && sourceSurplus > 0) {
              allowed = true;
              mode = "Cross-room classroom coverage";
            }
          }

          return {
            teacher: t,
            allowed,
            mode,
            sameRoom,
            sameToddPool,
            sourceSurplus,
            weight: staffWeightForCoverage(t) + bonus,
          };
        })
        .filter((x) => x.allowed)
        .sort((a, b) => {
          if (b.weight !== a.weight) return b.weight - a.weight;
          if (a.sameRoom !== b.sameRoom) return a.sameRoom ? -1 : 1;
          if (a.sameToddPool !== b.sameToddPool) return a.sameToddPool ? -1 : 1;
          if (b.sourceSurplus !== a.sourceSurplus)
            return b.sourceSurplus - a.sourceSurplus;
          return a.teacher.name.localeCompare(b.teacher.name);
        });

      if (supportCandidates.length > 0) {
        const chosen = supportCandidates[0];
        return {
          mode: chosen.mode,
          breakerId: chosen.teacher.id,
          breakerName: chosen.teacher.name,
          breakerRole: chosen.teacher.role,
          coverSourceRoom: chosen.teacher.room,
          coverTargetRoom: candidate.room,
        };
      }

      if (
        roomCanSelfCover(candidate.room) ||
        roomEffectiveSurplus(candidate.room, startMin, endMin) > 0
      ) {
        return {
          mode: "Self / room absorbs",
          breakerId: null,
          breakerName: "",
          breakerRole: "",
          coverSourceRoom: candidate.room,
          coverTargetRoom: candidate.room,
        };
      }

      return null;
    }

    for (const c of candidates) {
      const options = startOptionsForCandidate(c);
      let scheduled = null;

      for (const startMin of options) {
        const endMin = startMin + c.minutes;
        if (teacherBusy(c.id, startMin, endMin)) continue;
        if (
          staffBlockedByPlannedEvent(
            c.name,
            selectedDate,
            startMin,
            endMin,
            plannedAvailability,
            "ratio",
          )
        )
          continue;

        const coverageOption = findCoverageOption(c, startMin, endMin);
        if (!coverageOption) continue;

        scheduled = {
          breakerId: coverageOption.breakerId,
          breakerName: coverageOption.breakerName,
          breakerRole: coverageOption.breakerRole,
          teacherId: c.id,
          teacherName: c.name,
          room: c.room,
          startMin,
          endMin,
          startText: minutesToTime(startMin),
          endText: minutesToTime(endMin),
          coverSourceRoom: coverageOption.coverSourceRoom,
          coverTargetRoom: coverageOption.coverTargetRoom,
          coverageMode: coverageOption.mode,
        };
        break;
      }

      if (!scheduled) continue;

      assignments.push(scheduled);
      newPlans.set(c.id, {
        start: scheduled.startText,
        minutes: c.minutes,
      });

      if (scheduled.breakerId)
        nextFree.set(scheduled.breakerId, scheduled.endMin);
    }

    if (assignments.length === 0) {
      alert(
        "No break assignments could be generated from the current staffing pattern and planned constraints.",
      );
      return;
    }

    setTeachers((prev) =>
      applyUniqueInitials(
        (prev || []).map((t) => {
          const plan = newPlans.get(t.id);
          const cover = assignments.find((a) => a.teacherId === t.id);
          const coverForBreaker = assignments.find((a) => a.breakerId === t.id);

          let next = { ...t };

          if (plan) {
            next = {
              ...next,
              breakPlan: {
                ...(next.breakPlan || {}),
                start: plan.start,
                minutes: plan.minutes,
              },
            };
          }

          next.coverageAssignment = cover
            ? {
                breakerId: cover.breakerId,
                breakerName: cover.breakerName,
                room: cover.room,
                startText: cover.startText,
                endText: cover.endText,
                coverageMode: cover.coverageMode,
              }
            : null;

          next.coveringAnotherRoom = coverForBreaker
            ? {
                teacherName: coverForBreaker.teacherName,
                room: coverForBreaker.room,
                startText: coverForBreaker.startText,
                endText: coverForBreaker.endText,
                coverageMode: coverForBreaker.coverageMode,
              }
            : null;

          return next;
        }),
      ),
    );

    setCoverage(assignments);
  }

  const { pendingBreakSummary, doneBreakSummary } = useMemo(() => {
    const base = (teachers || []).filter((t) => !t.calledOut);

    const pending = base
      .filter((t) => !t.isMissing && !t.notLoggedIn)
      .filter((t) => !t.breakCompleted)
      .filter((t) => (t.breakPlan?.minutes ?? 0) > 0)
      .map((t) => ({
        id: t.id,
        initials: t.initials,
        name: t.name,
        room: t.room,
        start: (t.breakPlan?.start || "").trim(),
        minutes: t.breakPlan?.minutes ?? 60,
        coverage: t.coverageAssignment || null,
      }))
      .sort((a, b) => {
        if (!a.start && !b.start) return a.name.localeCompare(b.name);
        if (!a.start) return 1;
        if (!b.start) return -1;
        return parseTimeToMinutes(a.start) - parseTimeToMinutes(b.start);
      });

    const done = base
      .filter((t) => t.breakCompleted)
      .map((t) => ({
        id: t.id,
        initials: t.initials,
        name: t.name,
        room: t.room,
        outTime: t.attendance?.outTime || "",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { pendingBreakSummary: pending, doneBreakSummary: done };
  }, [teachers]);

  const activeTeacher = activeId ? idToTeacher.get(activeId) : null;
  const plannerTeacher = plannerOpenId ? idToTeacher.get(plannerOpenId) : null;

  function addToRoster() {
    const name = newStaffName.trim();
    if (!name) return;

    if (!looksLikePersonName(name)) {
      alert(`"${name}" does not look like a valid staff name.`);
      return;
    }

    const nm = canonName(name);
    if (isBannedRosterName(nm)) {
      alert(`"${name}" is not allowed as a staff name.`);
      return;
    }
    if (isPermanentlyExcludedName(name)) {
      alert(`"${name}" is permanently excluded by first name.`);
      return;
    }
    if (excludedFullSet.has(nm)) {
      alert("That exact name is currently excluded.");
      return;
    }

    const id = makeId(name);
    if (rosterById.has(id)) {
      alert("That person is already in the roster.");
      return;
    }

    setRoster((prev) => [
      ...(prev || []),
      {
        name,
        defaultRoom: normalizeRoom(newStaffRoom) || "Not in room",
        role: newStaffRole,
        shiftStart: newShiftStart.trim(),
        shiftEnd: newShiftEnd.trim(),
      },
    ]);

    setNewStaffName("");
    setNewStaffRoom("Not in room");
    setNewStaffRole("Classroom");
    setNewShiftStart("");
    setNewShiftEnd("");
  }

  function excludeName(name) {
    const nm = canonName(name);
    if (!nm) return;
    if (isBannedRosterName(nm)) return;
    if (isPermanentlyExcludedName(name)) return;

    setExcluded((prev) => {
      const s = new Set((prev || []).map((x) => canonName(x)).filter(Boolean));
      s.add(nm);
      return Array.from(s);
    });

    setRoster((prev) =>
      (prev || []).filter((r) => makeId(r.name) !== makeId(name)),
    );
  }

  function removeFromRoster(name) {
    setRoster((prev) =>
      (prev || []).filter((r) => makeId(r.name) !== makeId(name)),
    );
  }

  function updateRosterEntry(name, patch) {
    const id = makeId(name);
    setRoster((prev) =>
      (prev || []).map((r) => (makeId(r.name) === id ? { ...r, ...patch } : r)),
    );
  }

  useEffect(() => {
    if (coverage.length > 0 && coverageScheduleRef.current) {
      coverageScheduleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [coverage]);

  function clearBoardState() {
    setPasteText("");
    setTeachers([]);
    setCoverage([]);
    setKidsCounts(() => {
      const initial = {};
      Object.keys(RATIOS).forEach((r) => (initial[r] = ""));
      return initial;
    });
    setStaffCounts(() => {
      const initial = {};
      Object.keys(RATIOS).forEach((r) => (initial[r] = ""));
      return initial;
    });
    setKidsOverrides(() => {
      const initial = {};
      Object.keys(RATIOS).forEach((r) => (initial[r] = 0));
      return initial;
    });
  }
  const upcomingEvents = useMemo(() => {
    const endDate = shiftISODate(selectedDate, 90);
    return (plannedAvailability || [])
      .filter(
        (e) =>
          e.date >= selectedDate &&
          e.date <= endDate &&
          e.status !== "cancelled",
      )
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        if (!!a.isAllDay !== !!b.isAllDay) return a.isAllDay ? -1 : 1;
        return (a.startTime || "").localeCompare(b.startTime || "");
      })
      .slice(0, 50);
  }, [plannedAvailability, selectedDate]);

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
        background: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <div
        style={{ maxWidth: 1480, margin: "0 auto", display: "grid", gap: 16 }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 900 }}>
            BreakBridge Command Center
          </h1>
          <div style={{ color: "#475569", fontSize: 14 }}>
            Workflow: Paste Tadpoles → Update Board → Auto-Propose Breaks →
            Review Coverage → Adjust Board
          </div>
        </div>

        <div
          style={{
            position: "sticky",
            top: 10,
            zIndex: 30,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            padding: 12,
            border: "1px solid #dbeafe",
            borderRadius: 16,
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={updateFromPaste}
              style={{
                border: "1px solid #4f46e5",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#4f46e5",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Update Board
            </button>

            <button
              onClick={autoProposeBreaks}
              style={{
                border: "1px solid #0f172a",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Auto-Propose Breaks
            </button>

            <button
              onClick={clearBoardState}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Clear
            </button>

            <button
              onClick={copyBreakPlanPayload}
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 12,
                padding: "10px 14px",
                background: "#fff",
                color: "#0f172a",
                cursor: "pointer",
                fontWeight: 900,
              }}
            >
              Copy
            </button>

            <a
              href={WHITEBOARD_IMAGE_HREF}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12, fontWeight: 900, color: "#0f172a" }}
            >
              Open whiteboard photo
            </a>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {copyFlash ? (
              <div style={{ fontSize: 12, fontWeight: 900, color: "#334155" }}>
                {copyFlash}
              </div>
            ) : null}

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12,
                fontWeight: 900,
                color: "#334155",
              }}
            >
              <span>Nap Mode</span>
              <input
                type="checkbox"
                checked={napMode}
                onChange={(e) => setNapMode(e.target.checked)}
                style={{ transform: "scale(1.15)" }}
              />
            </label>

            <div style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>
              {humanDate(selectedDate)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.9fr) minmax(360px, 1fr)",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                border: "1px solid #c7d2fe",
                borderRadius: 20,
                padding: 16,
                background: "#eef2ff",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: "#6366f1",
                    }}
                  >
                    Primary Input
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 24, marginTop: 2 }}>
                    🧾 Paste Staff Status
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                    Highest-priority input area. Paste Tadpoles staffing text,
                    then update the board.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={updateFromPaste}
                    style={{
                      border: "1px solid #4f46e5",
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: "#4f46e5",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Update Board
                  </button>
                  <button
                    onClick={autoProposeBreaks}
                    style={{
                      border: "1px solid #0f172a",
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: "#fff",
                      color: "#0f172a",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Auto-Propose Breaks
                  </button>
                  <button
                    onClick={clearBoardState}
                    style={{
                      border: "1px solid #cbd5e1",
                      borderRadius: 12,
                      padding: "10px 12px",
                      background: "#fff",
                      color: "#0f172a",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste Tadpoles staff snapshot here..."
                style={{
                  width: "100%",
                  marginTop: 14,
                  minHeight: 86,
                  height: 86,
                  border: "1px solid #cbd5e1",
                  borderRadius: 16,
                  padding: 12,
                  fontSize: 13,
                  lineHeight: 1.45,
                  resize: "vertical",
                  background: "#fff",
                }}
              />

              <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                Gray tokens = on roster but not detected in paste (MISSING) or
                detected without an IN time (NO IN).
              </div>
            </div>

            <div
              style={{
                border: "1px solid #fde68a",
                borderRadius: 20,
                padding: 16,
                background: "#fffbeb",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div style={{ display: "grid", gap: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "start",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: 0.8,
                        textTransform: "uppercase",
                        color: "#b45309",
                      }}
                    >
                      Planning
                    </div>
                    <div
                      style={{ fontWeight: 900, fontSize: 24, marginTop: 2 }}
                    >
                      📅 Planned Absence & Availability
                    </div>
                    <div
                      style={{ fontSize: 12, color: "#475569", marginTop: 4 }}
                    >
                      Future staffing constraints, availability blocks, and
                      projected risk use the selected working date.
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        setSelectedDate((d) => shiftISODate(d, -1))
                      }
                      style={{
                        border: "1px solid #d6d3d1",
                        borderRadius: 10,
                        padding: "8px 10px",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      ← Prev
                    </button>

                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setNewAvailabilityEvent((prev) => ({
                          ...prev,
                          date: e.target.value,
                        }));
                      }}
                      style={{
                        border: "1px solid #d6d3d1",
                        borderRadius: 10,
                        padding: "8px 10px",
                        fontSize: 14,
                        background: "#fff",
                      }}
                    />

                    <button
                      onClick={() => {
                        const today = todayISODate();
                        setSelectedDate(today);
                        setNewAvailabilityEvent((prev) => ({
                          ...prev,
                          date: today,
                        }));
                      }}
                      style={{
                        border: "1px solid #d6d3d1",
                        borderRadius: 10,
                        padding: "8px 10px",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      Today
                    </button>

                    <button
                      onClick={() => setSelectedDate((d) => shiftISODate(d, 1))}
                      style={{
                        border: "1px solid #d6d3d1",
                        borderRadius: 10,
                        padding: "8px 10px",
                        background: "#fff",
                        cursor: "pointer",
                        fontWeight: 900,
                      }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    border: "1px solid #f1e5b8",
                    borderRadius: 16,
                    padding: 12,
                    background: "rgba(255,255,255,0.72)",
                    display: "grid",
                    gridTemplateColumns: "1.2fr 150px 110px 110px 180px",
                    gap: 8,
                  }}
                >
                  <select
                    value={newAvailabilityEvent.staffName}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        staffName: e.target.value,
                      }))
                    }
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  >
                    <option value="">Select staff</option>
                    {roster
                      .filter((r) => r.role !== "Non-classroom")
                      .slice()
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((r) => (
                        <option key={r.name} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                  </select>

                  <input
                    type="date"
                    value={newAvailabilityEvent.date}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        date: e.target.value,
                      }))
                    }
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  />

                  <input
                    value={newAvailabilityEvent.startTime}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        startTime: e.target.value,
                      }))
                    }
                    placeholder="Start"
                    disabled={newAvailabilityEvent.isAllDay}
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  />

                  <input
                    value={newAvailabilityEvent.endTime}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        endTime: e.target.value,
                      }))
                    }
                    placeholder="End"
                    disabled={newAvailabilityEvent.isAllDay}
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  />

                  <select
                    value={newAvailabilityEvent.entryType}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        entryType: e.target.value,
                      }))
                    }
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  >
                    {ABSENCE_ENTRY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newAvailabilityEvent.isAllDay}
                      onChange={(e) =>
                        setNewAvailabilityEvent((p) => ({
                          ...p,
                          isAllDay: e.target.checked,
                        }))
                      }
                    />
                    All day
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newAvailabilityEvent.affectsRatio}
                      onChange={(e) =>
                        setNewAvailabilityEvent((p) => ({
                          ...p,
                          affectsRatio: e.target.checked,
                        }))
                      }
                    />
                    Affects ratio
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 12,
                      color: "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newAvailabilityEvent.affectsCoverage}
                      onChange={(e) =>
                        setNewAvailabilityEvent((p) => ({
                          ...p,
                          affectsCoverage: e.target.checked,
                        }))
                      }
                    />
                    Affects coverage
                  </label>

                  <select
                    value={newAvailabilityEvent.status}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        status: e.target.value,
                      }))
                    }
                    style={{
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  >
                    {EVENT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={addPlannedAvailabilityEvent}
                    style={{
                      border: "1px solid #0f172a",
                      borderRadius: 10,
                      padding: "8px 12px",
                      background: "#0f172a",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 900,
                    }}
                  >
                    Add Event
                  </button>

                  <input
                    value={newAvailabilityEvent.note}
                    onChange={(e) =>
                      setNewAvailabilityEvent((p) => ({
                        ...p,
                        note: e.target.value,
                      }))
                    }
                    placeholder="Note"
                    style={{
                      gridColumn: "1 / -1",
                      border: "1px solid #d6d3d1",
                      borderRadius: 10,
                      padding: "8px 10px",
                      background: "#fff",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.25fr 0.95fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      border: "1px solid #f1e5b8",
                      borderRadius: 16,
                      padding: 12,
                      background: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Selected Date Events</div>
                    <div
                      style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                    >
                      {humanDate(selectedDate)}
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                      {dateEvents.length === 0 ? (
                        <div style={{ fontSize: 13, color: "#64748b" }}>
                          No planned events for this date.
                        </div>
                      ) : (
                        dateEvents.map((e) => (
                          <div
                            key={e.id}
                            style={{
                              border: "1px solid #ece7d0",
                              borderRadius: 12,
                              padding: 10,
                              display: "grid",
                              gridTemplateColumns: "1fr auto",
                              gap: 8,
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 900 }}>
                                {e.staffName}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>
                                {e.entryType} ·{" "}
                                {e.isAllDay
                                  ? "All day"
                                  : `${e.startTime || "?"}–${e.endTime || "?"}`}{" "}
                                · {e.status}
                              </div>
                              <div style={{ fontSize: 12, color: "#64748b" }}>
                                ratio: <b>{e.affectsRatio ? "Y" : "N"}</b> ·
                                coverage: <b>{e.affectsCoverage ? "Y" : "N"}</b>
                              </div>
                              {e.note ? (
                                <div style={{ fontSize: 12, marginTop: 4 }}>
                                  {e.note}
                                </div>
                              ) : null}
                            </div>

                            <button
                              onClick={() =>
                                removePlannedAvailabilityEvent(e.id)
                              }
                              style={{
                                border: "1px solid #d6d3d1",
                                borderRadius: 10,
                                padding: "6px 10px",
                                background: "#fff",
                                cursor: "pointer",
                                fontWeight: 900,
                                height: 34,
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        border: "1px solid #f1e5b8",
                        borderRadius: 16,
                        padding: 12,
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        Projected Daily Risk
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                      >
                        Forecast for {humanDate(selectedDate)} based on planned
                        availability entries.
                      </div>

                      <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                        <div style={{ fontSize: 13 }}>
                          Planned ratio-impact events:{" "}
                          <b>{projectedRisk.ratioEvents}</b>
                        </div>
                        <div style={{ fontSize: 13 }}>
                          Planned coverage-impact events:{" "}
                          <b>{projectedRisk.coverageEvents}</b>
                        </div>

                        {projectedRisk.warnings.length === 0 ? (
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            No projected risk warnings currently detected.
                          </div>
                        ) : (
                          <div style={{ display: "grid", gap: 6 }}>
                            {projectedRisk.warnings.map((w, idx) => (
                              <div
                                key={idx}
                                style={{
                                  fontSize: 12,
                                  border: "1px solid #ece7d0",
                                  borderRadius: 10,
                                  padding: "8px 10px",
                                  background: "#fffbeb",
                                }}
                              >
                                {w}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        border: "1px solid #f1e5b8",
                        borderRadius: 16,
                        padding: 12,
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>
                        Upcoming (next 3 months)
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}
                      >
                        Showing up to 50 planned entries.
                      </div>

                      <div
                        style={{
                          marginTop: 10,
                          display: "grid",
                          gap: 8,
                          maxHeight: 260,
                          overflow: "auto",
                        }}
                      >
                        {upcomingEvents.length === 0 ? (
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            No upcoming entries found.
                          </div>
                        ) : (
                          upcomingEvents.map((e) => (
                            <div
                              key={e.id}
                              style={{
                                border: "1px solid #ece7d0",
                                borderRadius: 10,
                                padding: "8px 10px",
                                background: "#fff",
                                fontSize: 12,
                              }}
                            >
                              <div style={{ fontWeight: 900 }}>
                                {e.staffName}
                              </div>
                              <div>{humanDate(e.date)}</div>
                              <div>
                                {e.entryType} ·{" "}
                                {e.isAllDay
                                  ? "All day"
                                  : `${e.startTime || "?"}–${e.endTime || "?"}`}
                              </div>
                              <div style={{ color: "#64748b" }}>
                                ratio: {e.affectsRatio ? "Y" : "N"} · coverage:{" "}
                                {e.affectsCoverage ? "Y" : "N"} · {e.status}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: 16,
                background: "#fff",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: "#64748b",
                }}
              >
                Ratios
              </div>
              <div style={{ fontWeight: 900, fontSize: 24, marginTop: 2 }}>
                Kids + Staff Counts
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                Tiles drive ratios. Override lets you adjust kids after Update
                Board when Tadpoles is incomplete.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: 10,
                }}
              >
                <button
                  onClick={resetOverrides}
                  style={{
                    border: "1px solid #0f172a",
                    borderRadius: 10,
                    padding: "8px 12px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Reset Overrides
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1.25fr 72px 72px 86px 86px",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                  }}
                >
                  Room
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Kids
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Staff
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Override
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                    textTransform: "uppercase",
                    textAlign: "right",
                  }}
                >
                  Effective
                </div>

                {Object.keys(RATIOS).map((room) => (
                  <React.Fragment key={room}>
                    <div style={{ fontSize: 13, display: "grid", gap: 2 }}>
                      <div style={{ fontWeight: 900 }}>{room}</div>
                      <div style={{ color: "#64748b", fontSize: 11 }}>
                        max {CAPACITY[room]} · 1:{RATIOS[room]}
                      </div>
                    </div>

                    <input
                      value={kidsCounts[room]}
                      onChange={(e) => updateKids(room, e.target.value)}
                      placeholder="0"
                      inputMode="numeric"
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 10,
                        padding: "8px 8px",
                        fontSize: 13,
                        textAlign: "right",
                        background: "#fff",
                      }}
                    />

                    <input
                      value={staffCounts[room]}
                      onChange={(e) => updateStaff(room, e.target.value)}
                      placeholder="0"
                      inputMode="numeric"
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 10,
                        padding: "8px 8px",
                        fontSize: 13,
                        textAlign: "right",
                        background: "#fff",
                      }}
                    />

                    <input
                      value={kidsOverrides[room] || 0}
                      onChange={(e) => updateKidsOverride(room, e.target.value)}
                      placeholder="0"
                      style={{
                        border: "1px solid #cbd5e1",
                        borderRadius: 10,
                        padding: "8px 8px",
                        fontSize: 13,
                        textAlign: "right",
                        background: "#fff",
                      }}
                    />

                    <div
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 10,
                        padding: "8px 8px",
                        fontSize: 13,
                        textAlign: "right",
                        background: "#f8fafc",
                        fontWeight: 900,
                      }}
                    >
                      {effectiveKidsCounts[room]}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div
              ref={coverageScheduleRef}
              style={{
                border: "1px solid #bae6fd",
                borderRadius: 20,
                padding: 16,
                background: "#f0f9ff",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      color: "#0284c7",
                    }}
                  >
                    Automation Output
                  </div>
                  <div style={{ fontWeight: 900, fontSize: 24, marginTop: 2 }}>
                    ⚙️ Coverage Schedule (Auto)
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                    Uses planned availability, room strategy, dynamic coverage
                    pools, same-room preference, and Todds shared pool logic.
                  </div>
                </div>

                <button
                  onClick={copyCoverageSchedule}
                  style={{
                    border: "1px solid #0f172a",
                    borderRadius: 10,
                    padding: "8px 12px",
                    background: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Copy
                </button>
              </div>

              <div
                style={{
                  marginTop: 12,
                  overflowX: "auto",
                  border: "1px solid #dbeafe",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Cover
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Teacher
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Room
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Time
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Mode
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{ padding: "16px 10px", color: "#64748b" }}
                        >
                          No coverage schedule yet. Click{" "}
                          <b>Auto-Propose Breaks</b> to generate one.
                        </td>
                      </tr>
                    ) : (
                      coverage
                        .slice()
                        .sort((a, b) => a.startMin - b.startMin)
                        .map((c, idx) => (
                          <tr key={`${c.teacherId}-${idx}`}>
                            <td
                              style={{
                                padding: "10px 8px",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {c.breakerName ? (
                                <>
                                  <b>{c.breakerName}</b>{" "}
                                  <span style={{ color: "#64748b" }}>
                                    ({c.breakerRole})
                                  </span>
                                </>
                              ) : (
                                <span style={{ color: "#64748b" }}>
                                  Self / Room
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: "10px 8px",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {c.teacherName}
                            </td>
                            <td
                              style={{
                                padding: "10px 8px",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {c.room}
                            </td>
                            <td
                              style={{
                                padding: "10px 8px",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {c.startText} – {c.endText}
                            </td>
                            <td
                              style={{
                                padding: "10px 8px",
                                borderBottom: "1px solid #f1f5f9",
                              }}
                            >
                              {c.coverageMode}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #bbf7d0",
            borderRadius: 20,
            padding: 16,
            background: "#ecfdf5",
            boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "baseline",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  color: "#059669",
                }}
              >
                Operations
              </div>
              <div style={{ fontWeight: 900, fontSize: 24, marginTop: 2 }}>
                🏫 Live Classroom Staff Board
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                Drag-and-drop room placement with live staffing balance, ratio
                status, and teacher planning controls.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
                  gap: 12,
                }}
              >
                {BOARD_ROOMS.map((room) => {
                  const ids = roomToTeacherIds.get(room) || [];
                  const s = roomStats[room] || {};
                  return (
                    <DroppableRoom key={room} roomName={room}>
                      <RoomCard
                        roomName={room}
                        teacherIds={ids}
                        kids={s.kidsNow}
                        effectiveKids={s.effectiveKids}
                        adjustment={s.adjustment || 0}
                        capacity={s.cap}
                        activeStaff={s.activeStaff ?? 0}
                        requiredStaff={s.req}
                        status={s.status}
                        staffSourceLabel={s.staffSourceLabel}
                      >
                        {ids.map((id) => {
                          const t = idToTeacher.get(id);
                          if (!t) return null;
                          return (
                            <TeacherToken
                              key={t.id}
                              teacher={t}
                              onOpen={setPlannerOpenId}
                              onToggleCallout={toggleCallout}
                            />
                          );
                        })}
                      </RoomCard>
                    </DroppableRoom>
                  );
                })}
              </div>

              <DragOverlay>
                {activeTeacher ? (
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: 999,
                      border: "2px solid #111",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      background: "#f4f6ff",
                      opacity:
                        activeTeacher.calledOut ||
                        activeTeacher.isMissing ||
                        activeTeacher.notLoggedIn
                          ? 0.6
                          : 1,
                    }}
                  >
                    {activeTeacher.initials}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 20,
              padding: 16,
              background: "#fff",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                Break Plan Summary
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                Pending = minutes &gt; 0 and logged-in detected staff. DONE =
                Attendance OUT time detected.
              </div>
            </div>

            {pendingBreakSummary.length === 0 ? (
              <div style={{ marginTop: 12, fontSize: 13, color: "#64748b" }}>
                No pending breaks scheduled. Click <b>Plan</b> under a teacher
                or use <b>Auto-Propose Breaks</b>.
              </div>
            ) : (
              <div style={{ marginTop: 12, overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Teacher
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Room
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Start
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Min
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          borderBottom: "1px solid #e2e8f0",
                          padding: "10px 8px",
                        }}
                      >
                        Coverage
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingBreakSummary.map((r) => (
                      <tr key={r.id}>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <b style={{ marginRight: 8 }}>{r.initials}</b>{" "}
                          {r.name}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {r.room}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {r.start || "—"}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f1f5f9",
                            textAlign: "right",
                          }}
                        >
                          {r.minutes}
                        </td>
                        <td
                          style={{
                            padding: "10px 8px",
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          {r.coverage
                            ? `${r.coverage.breakerName || "Self / Room"} (${r.coverage.startText}–${r.coverage.endText})`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {doneBreakSummary.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 900, fontSize: 13 }}>
                  DONE (per Attendance OUT)
                </div>
                <div style={{ marginTop: 8, overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: 13,
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "10px 8px",
                          }}
                        >
                          Teacher
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "10px 8px",
                          }}
                        >
                          Room
                        </th>
                        <th
                          style={{
                            textAlign: "left",
                            borderBottom: "1px solid #e2e8f0",
                            padding: "10px 8px",
                          }}
                        >
                          OUT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doneBreakSummary.map((r) => (
                        <tr key={r.id}>
                          <td
                            style={{
                              padding: "10px 8px",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            <b style={{ marginRight: 8 }}>{r.initials}</b>{" "}
                            {r.name}
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            {r.room}
                          </td>
                          <td
                            style={{
                              padding: "10px 8px",
                              borderBottom: "1px solid #f1f5f9",
                            }}
                          >
                            {r.outTime || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            {legendItems.length > 0 && (
              <div
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 20,
                  padding: 16,
                  background: "#fff",
                  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 20 }}>
                  Legend (Logged-in detected staff)
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 6 }}>
                  These are staff detected in the IN list who also have an IN
                  time in Attendance.
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 8,
                    maxHeight: 420,
                    overflow: "auto",
                  }}
                >
                  {legendItems.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "64px 1fr 180px 234px",
                        gap: 10,
                        alignItems: "center",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "8px 10px",
                        background: t.calledOut ? "#fafafa" : "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{t.initials}</div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ fontWeight: 900, lineHeight: 1.1 }}>
                          {t.name}{" "}
                          {t.calledOut ? (
                            <span style={{ color: "#111" }}> (OUT)</span>
                          ) : t.breakCompleted ? (
                            <span> (DONE)</span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Room: <b>{t.room}</b>
                          {t.role === "Breaker" ? " · BREAKER" : ""}
                          {t.role === "Admin Cover" ? " · ADMIN COVER" : ""}
                          {t.noBreaks ? " · NO BREAKS" : ""}
                          {t.force30 ? " · 30 MIN ONLY" : ""}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Proposed: <b>{t.breakPlan?.start || "—"}</b> ·{" "}
                          <b>{t.breakPlan?.minutes ?? 0}</b> min
                        </div>
                      </div>

                      <div style={{ fontSize: 12, color: "#334155" }}>
                        Shift: <b>{t.shiftText}</b>
                        {t.attendance?.inTime ? (
                          <div style={{ fontSize: 12, color: "#64748b" }}>
                            IN: <b>{t.attendance.inTime}</b>
                            {t.attendance.outTime ? (
                              <>
                                {" "}
                                · OUT: <b>{t.attendance.outTime}</b>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          justifyContent: "flex-end",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() => setPlannerOpenId(t.id)}
                          style={{
                            border: "1px solid #cbd5e1",
                            borderRadius: 10,
                            padding: "6px 10px",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: 12,
                          }}
                        >
                          Plan
                        </button>

                        <button
                          onClick={() => excludeName(t.name)}
                          style={{
                            border: "1px solid #cbd5e1",
                            borderRadius: 10,
                            padding: "6px 10px",
                            background: "#fff",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: 12,
                          }}
                        >
                          Exclude
                        </button>

                        <button
                          onClick={() => toggleCallout(t.id)}
                          style={{
                            border: "1px solid #0f172a",
                            borderRadius: 10,
                            padding: "6px 10px",
                            background: t.calledOut ? "#0f172a" : "#fff",
                            color: t.calledOut ? "#fff" : "#0f172a",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontSize: 12,
                          }}
                        >
                          OUT
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 20,
                padding: 16,
                background: "#fff",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "baseline",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 20 }}>
                  Roster Manager
                </div>
                <label
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 12,
                    color: "#334155",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!settings.autoAddFromPaste}
                    onChange={(e) =>
                      setSettings((p) => ({
                        ...p,
                        autoAddFromPaste: e.target.checked,
                      }))
                    }
                  />
                  Prompt to add new names from paste
                </label>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 130px 140px 130px 130px 90px",
                  gap: 8,
                }}
              >
                <input
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Add staff name"
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                  }}
                />

                <select
                  value={newStaffRoom}
                  onChange={(e) => setNewStaffRoom(e.target.value)}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  {BOARD_ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                    background: "#fff",
                  }}
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Breaker">Breaker</option>
                  <option value="Admin Cover">Admin Cover</option>
                  <option value="Non-classroom">Non-classroom</option>
                </select>

                <input
                  value={newShiftStart}
                  onChange={(e) => setNewShiftStart(e.target.value)}
                  placeholder="Shift start"
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                  }}
                />
                <input
                  value={newShiftEnd}
                  onChange={(e) => setNewShiftEnd(e.target.value)}
                  placeholder="Shift end"
                  style={{
                    border: "1px solid #cbd5e1",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 13,
                  }}
                />

                <button
                  onClick={addToRoster}
                  style={{
                    border: "1px solid #0f172a",
                    borderRadius: 10,
                    padding: "8px 10px",
                    background: "#0f172a",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 900,
                    fontSize: 12,
                  }}
                >
                  Add
                </button>
              </div>

              <div style={{ fontSize: 12, color: "#64748b", marginTop: 10 }}>
                Permanent exclusions by first name: <b>Faith</b>, <b>Luna</b>.
                Hard-banned: <b>All</b>.
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 8,
                  maxHeight: 420,
                  overflow: "auto",
                }}
              >
                {roster
                  .slice()
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((r) => (
                    <div
                      key={makeId(r.name)}
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "1.2fr 120px 140px 120px 120px 100px 100px",
                        gap: 8,
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "8px 10px",
                        alignItems: "center",
                        background: "#fff",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{r.name}</div>

                      <select
                        value={r.defaultRoom || "Not in room"}
                        onChange={(e) =>
                          updateRosterEntry(r.name, {
                            defaultRoom: e.target.value,
                          })
                        }
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                      >
                        {BOARD_ROOMS.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                      </select>

                      <select
                        value={r.role || "Classroom"}
                        onChange={(e) =>
                          updateRosterEntry(r.name, { role: e.target.value })
                        }
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                      >
                        <option value="Classroom">Classroom</option>
                        <option value="Breaker">Breaker</option>
                        <option value="Admin Cover">Admin Cover</option>
                        <option value="Non-classroom">Non-classroom</option>
                      </select>

                      <input
                        value={r.shiftStart || ""}
                        onChange={(e) =>
                          updateRosterEntry(r.name, {
                            shiftStart: e.target.value,
                          })
                        }
                        placeholder="Start"
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          fontSize: 12,
                        }}
                      />
                      <input
                        value={r.shiftEnd || ""}
                        onChange={(e) =>
                          updateRosterEntry(r.name, {
                            shiftEnd: e.target.value,
                          })
                        }
                        placeholder="End"
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          fontSize: 12,
                        }}
                      />

                      <button
                        onClick={() => excludeName(r.name)}
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        Exclude
                      </button>

                      <button
                        onClick={() => removeFromRoster(r.name)}
                        style={{
                          border: "1px solid #cbd5e1",
                          borderRadius: 10,
                          padding: "6px 8px",
                          background: "#fff",
                          cursor: "pointer",
                          fontWeight: 900,
                          fontSize: 12,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {plannerTeacher && (
          <TeacherPlannerModal
            teacher={plannerTeacher}
            onClose={() => setPlannerOpenId(null)}
            onUpdate={updateTeacher}
          />
        )}
      </div>
    </div>
  );
}
