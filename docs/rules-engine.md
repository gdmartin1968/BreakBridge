# BreakBridge Rules Engine

## Overview

The BreakBridge Rules Engine is responsible for converting a real-time staffing snapshot into a structured and safe break schedule for a childcare center.

Childcare environments operate under strict staff-to-child ratio regulations. At the same time, employees must take scheduled breaks throughout the day.

Supervisors traditionally perform this planning manually using whiteboards, spreadsheets, or informal notes. This process requires constant attention to classroom staffing levels and often consumes significant administrative time.

BreakBridge automates this process by evaluating staffing conditions and proposing break assignments that maintain classroom coverage while respecting operational constraints.

The Rules Engine is the decision-making core of the BreakBridge system.

---

# Operational Context

Each day, supervisors must coordinate breaks while ensuring that classrooms remain within their required staffing ratios.

Several factors affect break planning:

• number of children in each classroom  
• required staff-to-child ratios  
• teachers currently logged into each room  
• floating staff or administrators available for coverage  
• shift start times  
• classroom nap schedules  
• operational priorities between classrooms  

Because these factors constantly change during the day, break scheduling is a dynamic coordination problem.

BreakBridge evaluates these conditions and produces a proposed break plan that administrators can review and adjust.

---

# Data Source

BreakBridge receives its operational data from a staffing snapshot exported from the Tadpoles childcare management system.

The snapshot includes:

• classroom enrollment counts  
• number of staff currently assigned to each classroom  
• active staff logged into the center  
• classroom assignments for each staff member  
• timestamped attendance data

This information is copied from Tadpoles and pasted into BreakBridge as the system's operational input.

The Rules Engine then evaluates this data to determine safe break opportunities.

---

# Core Inputs

The Rules Engine relies on several structured inputs.

## Classroom Configuration

Each classroom defines:

• required staffing ratio  
• maximum capacity  
• classroom identifier  
• operational grouping

Example classroom types:

| Classroom | Ratio | Capacity |
|----------|------|-----------|
| Infants | 1:4 | small capacity |
| Toddlers | 1:6 | medium capacity |
| Twos | 1:11 | larger capacity |
| Pre-K | 1:12+ | variable capacity |

These ratios determine the minimum number of teachers required for each room.

---

## Staff Presence

The engine receives a list of staff members currently logged into the center.

Example (using fictional names):

| Staff Member | Assigned Area |
|--------------|---------------|
| Camila Restful | Infants |
| Faith Beatty | Toddler Rooms |
| Jeannie Bottle | Toddler B |
| Kiara Kangaroo | 3-Year Classroom |
| Jasmine Koala | 2-Year Classroom |
| Genevieve Leopard | 3-Year Classroom |
| Octavia Navajo | Float |
| Trinity Navajo | Infants |
| Mary Percy | Infants |
| Olga Raymond | Toddler A |
| Valeria Tomahawk | 3-Year Classroom |
| Ursula Valkyrie | 3-Year Classroom |
| Paisley Jansen | Pre-K |

These names are fictional placeholders used for demonstration purposes.

---

## Operational Rules

The system also applies operational policies such as:

• minimum staffing ratios must never be violated  
• certain classrooms may require coverage before releasing staff  
• floating staff may provide temporary coverage  
• teachers in the same room may relieve each other during nap periods  
• administrative staff may provide coverage during certain hours  

These rules allow BreakBridge to replicate real operational behavior in childcare environments.

---

# Core Evaluation Process

The Rules Engine evaluates staffing conditions in several stages.

---

## Step 1 — Classroom Staffing Evaluation

The engine calculates the required number of teachers for each classroom using the classroom ratio and number of children present.

Example formula:
required_teachers = ceiling(children / ratio)


Each classroom is then classified as one of three operational states.

| Status | Meaning |
|------|---------|
| Green | classroom has additional staffing above minimum |
| Fragile | classroom is exactly at minimum staffing |
| Maxed | classroom cannot release staff safely |

Only classrooms in **Green status** are immediately eligible to release teachers for breaks.

---

## Step 2 — Break Eligibility

The engine evaluates which teachers are eligible to take a break.

Eligibility may depend on:

• classroom staffing status  
• break sequencing rules  
• nap schedules  
• classroom collaboration patterns  

For example:

• teachers in the same classroom may relieve each other during nap  
• floating staff may cover certain classrooms  
• administrative staff may provide temporary coverage

---

## Step 3 — Coverage Candidate Identification

If a teacher takes a break, another staff member may need to temporarily cover their classroom.

Possible coverage sources include:

• floating teachers  
• administrative staff  
• teachers from classrooms with surplus staffing  
• teachers who temporarily rotate coverage between rooms

Coverage assignments are only generated if they do not create a staffing violation elsewhere.

---

## Step 4 — Break Proposal Generation

After determining eligible staff and available coverage, the engine generates proposed break assignments.

Example proposal:

| Teacher | Classroom | Break Window |
|--------|-----------|--------------|
| Camila Restful | Infants | break during infant rotation |
| Faith Beatty | Toddler Rooms | 12:00 – 1:00 |
| Olga Raymond | Toddler A | 1:00 – 2:00 |
| Jeannie Bottle | Toddler B | 1:00 – 2:00 |
| Kiara Kangaroo | 3-Year Classroom | break during nap |

These proposals represent safe break opportunities under current staffing conditions.

---

## Step 5 — Coverage Assignment

When coverage is required, the system generates a coverage assignment.

Example:

| Breaker | Covering | Classroom |
|--------|----------|-----------|
| Octavia Navajo | Olga Raymond | Toddler A |
| Paisley Jansen | Jeannie Bottle | Toddler B |
| Ursula Valkyrie | Valeria Tomahawk | 3-Year Classroom |

These assignments ensure classrooms remain within ratio while teachers take breaks.

---

# Conflict Detection

The Rules Engine actively checks for conditions that prevent safe break scheduling.

Examples include:

• insufficient coverage staff  
• classrooms already at minimum staffing  
• conflicting break windows  
• overlapping coverage requirements  

When conflicts occur, the engine produces warnings and leaves certain breaks unscheduled.

This guarantees the system never proposes an unsafe schedule.

---

# Administrative Review

BreakBridge treats engine output as **recommendations**, not automatic commands.

Supervisors can:

• modify break timing  
• assign different coverage staff  
• remove teachers from the plan  
• adjust plans based on real-world conditions

This preserves human oversight while reducing the complexity of planning.

---

# Architectural Boundary

The Rules Engine is implemented on the **server side**, not in the frontend interface.

Reasons include:

• maintaining consistent scheduling logic  
• protecting operational rules from client manipulation  
• enabling automation workflows  
• supporting multi-location deployments

The frontend only displays engine output and allows administrators to adjust the plan.

---

# Why the Rules Engine Matters

BreakBridge is not simply a scheduling interface.

It is a **decision-support system** designed to help supervisors safely coordinate staffing in environments where regulatory compliance and operational safety are critical.

The Rules Engine transforms a real-time staffing snapshot into a structured break plan that:

• reduces administrative workload  
• improves operational safety  
• maintains staffing compliance  
• produces consistent planning outcomes

By automating this reasoning process, BreakBridge allows childcare teams to focus on teaching and supervision rather than manual scheduling coordination.