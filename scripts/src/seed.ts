/**
 * BreakBridge — Fictional seed data
 * All names are invented. No real employee names or childcare data are used.
 */

import { PrismaClient } from "@workspace/prisma";

const prisma = new PrismaClient({ log: ["error"] });

async function main() {
  console.log("🌱 Seeding BreakBridge database...");

  // ── System Roles ─────────────────────────────────────────────────────────
  const systemRoles = [
    { name: "platform_admin", label: "Platform Admin" },
    { name: "org_admin", label: "Organization Admin" },
    { name: "location_admin", label: "Location Admin" },
    { name: "supervisor", label: "Supervisor / Scheduler" },
    { name: "viewer", label: "Read-Only Viewer" },
  ];

  for (const role of systemRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: { ...role, isSystem: true },
      update: { label: role.label, isSystem: true },
    });
  }
  console.log("✓ System roles seeded (5 roles)");

  // ── Organization ─────────────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "brightstart-early-learning" },
    create: { name: "BrightStart Early Learning", slug: "brightstart-early-learning" },
    update: {},
  });
  console.log(`✓ Organization: ${org.name}`);

  // ── Locations ─────────────────────────────────────────────────────────────
  const locationA = await prisma.location.upsert({
    where: { id: "loc-maple-grove" },
    create: {
      id: "loc-maple-grove",
      organizationId: org.id,
      name: "Maple Grove Center",
      address: "100 Maple Grove Dr",
      timezone: "America/New_York",
    },
    update: {},
  });

  const locationB = await prisma.location.upsert({
    where: { id: "loc-cedar-ridge" },
    create: {
      id: "loc-cedar-ridge",
      organizationId: org.id,
      name: "Cedar Ridge Center",
      address: "200 Cedar Ridge Blvd",
      timezone: "America/New_York",
    },
    update: {},
  });
  console.log("✓ Locations: Maple Grove Center, Cedar Ridge Center");

  // ── Rule Configs ─────────────────────────────────────────────────────────
  for (const loc of [locationA, locationB]) {
    await prisma.ruleConfig.upsert({
      where: { locationId: loc.id },
      create: {
        locationId: loc.id,
        breakCutoffTime: "15:00",
        defaultBreakMins: 30,
        minBreakGapMins: 30,
        maxBreaksPerStaff: 1,
      },
      update: {},
    });
  }

  // ── Classrooms for Maple Grove ────────────────────────────────────────────
  const classroomDefs = [
    { id: "cls-mg-infant",   name: "Infant Room",    label: "Infant",   capacity: 8,  minStaffRatio: 0.25, maxKidsPerRoom: 8,  isNapRoom: true,  napWindowStart: "11:30", napWindowEnd: "14:00", sortOrder: 1 },
    { id: "cls-mg-toddler",  name: "Toddler Room",   label: "Toddler",  capacity: 12, minStaffRatio: 0.20, maxKidsPerRoom: 12, isNapRoom: true,  napWindowStart: "12:00", napWindowEnd: "14:30", sortOrder: 2 },
    { id: "cls-mg-twos",     name: "Twos Room",      label: "Twos",     capacity: 14, minStaffRatio: 0.17, maxKidsPerRoom: 14, isNapRoom: false, napWindowStart: null,    napWindowEnd: null,    sortOrder: 3 },
    { id: "cls-mg-threes",   name: "Threes Room",    label: "Threes",   capacity: 16, minStaffRatio: 0.13, maxKidsPerRoom: 16, isNapRoom: false, napWindowStart: null,    napWindowEnd: null,    sortOrder: 4 },
    { id: "cls-mg-preka",    name: "Pre-K A",        label: "Pre-K A",  capacity: 18, minStaffRatio: 0.11, maxKidsPerRoom: 18, isNapRoom: false, napWindowStart: null,    napWindowEnd: null,    sortOrder: 5 },
    { id: "cls-mg-prekb",    name: "Pre-K B",        label: "Pre-K B",  capacity: 18, minStaffRatio: 0.11, maxKidsPerRoom: 18, isNapRoom: false, napWindowStart: null,    napWindowEnd: null,    sortOrder: 6 },
  ];

  for (const cls of classroomDefs) {
    await prisma.classroom.upsert({
      where: { id: cls.id },
      create: { ...cls, locationId: locationA.id },
      update: {},
    });
  }
  console.log("✓ Classrooms: 6 classrooms for Maple Grove");

  // ── Fictional Staff — Maple Grove (12 members) ────────────────────────────
  // All names are invented. No real employee data.
  const staffDefs = [
    { id: "stf-01", firstName: "Avery",   lastName: "Caldwell",   displayName: "Avery Caldwell",   classroomId: "cls-mg-infant",   role: "CLASSROOM" as const },
    { id: "stf-02", firstName: "Morgan",  lastName: "Thatcher",   displayName: "Morgan Thatcher",  classroomId: "cls-mg-infant",   role: "CLASSROOM" as const },
    { id: "stf-03", firstName: "Quinn",   lastName: "Ellsworth",  displayName: "Quinn Ellsworth",  classroomId: "cls-mg-toddler",  role: "CLASSROOM" as const },
    { id: "stf-04", firstName: "Jordan",  lastName: "Neville",    displayName: "Jordan Neville",   classroomId: "cls-mg-toddler",  role: "CLASSROOM" as const },
    { id: "stf-05", firstName: "Casey",   lastName: "Ashford",    displayName: "Casey Ashford",    classroomId: "cls-mg-twos",     role: "CLASSROOM" as const },
    { id: "stf-06", firstName: "Reese",   lastName: "Holbrook",   displayName: "Reese Holbrook",   classroomId: "cls-mg-twos",     role: "CLASSROOM" as const },
    { id: "stf-07", firstName: "Sawyer",  lastName: "Prescott",   displayName: "Sawyer Prescott",  classroomId: "cls-mg-threes",   role: "CLASSROOM" as const },
    { id: "stf-08", firstName: "Finley",  lastName: "Davenport",  displayName: "Finley Davenport", classroomId: "cls-mg-threes",   role: "CLASSROOM" as const },
    { id: "stf-09", firstName: "Blake",   lastName: "Whitmore",   displayName: "Blake Whitmore",   classroomId: "cls-mg-preka",    role: "CLASSROOM" as const },
    { id: "stf-10", firstName: "Peyton",  lastName: "Larkspur",   displayName: "Peyton Larkspur",  classroomId: "cls-mg-prekb",    role: "CLASSROOM" as const },
    { id: "stf-11", firstName: "Hayden",  lastName: "Merritt",    displayName: "Hayden Merritt",   classroomId: null,              role: "BREAKER" as const },
    { id: "stf-12", firstName: "Skyler",  lastName: "Fontaine",   displayName: "Skyler Fontaine",  classroomId: null,              role: "BREAKER" as const },
  ];

  for (const s of staffDefs) {
    await prisma.staff.upsert({
      where: { id: s.id },
      create: { ...s, locationId: locationA.id, isActive: true },
      update: {},
    });
  }
  console.log("✓ Staff: 12 fictional staff members seeded (Maple Grove)");

  console.log("\n✅ Seed complete.");
  console.log(`   Org:       ${org.name}`);
  console.log(`   Locations: Maple Grove Center, Cedar Ridge Center`);
  console.log(`   Classrooms: 6 (Infant, Toddler, Twos, Threes, Pre-K A, Pre-K B)`);
  console.log(`   Staff:      12 fictional members`);
  console.log(`   Roles:      5 system roles`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
