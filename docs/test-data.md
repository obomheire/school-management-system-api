# Test Data Reference

This file documents the dataset created by `/scripts/seed.js`.

## Seed Command

```bash
npm run seed
```

## Seeded Users

### Superadmins

| Email | Password | Role |
|---|---|---|
| `superadmin1@school-system.com` | `Superadmin1@123` | `superadmin` |
| `superadmin2@school-system.com` | `Superadmin2@123` | `superadmin` |

### School Admins

| Email | Password | Role | Primary `assignedSchool` (single-field fallback) |
|---|---|---|---|
| `schooladmin1@school-system.com` | `SchoolAdmin1@123` | `school_admin` | `SA1 Learning Campus 01` |
| `schooladmin2@school-system.com` | `SchoolAdmin2@123` | `school_admin` | `SA1 Learning Campus 06` |
| `schooladmin3@school-system.com` | `SchoolAdmin3@123` | `school_admin` | `SA2 Learning Campus 11` |

## Seeded Schools

Total schools: `15`

- Created in seed plan for superadmin1: `10`
  - `SA1 Learning Campus 01` to `SA1 Learning Campus 10`
- Created in seed plan for superadmin2: `5`
  - `SA2 Learning Campus 11` to `SA2 Learning Campus 15`

## School Assignment Matrix

- `schooladmin1@school-system.com` manages:
  - `SA1 Learning Campus 01`
  - `SA1 Learning Campus 02`
  - `SA1 Learning Campus 03`
  - `SA1 Learning Campus 04`
  - `SA1 Learning Campus 05`
- `schooladmin2@school-system.com` manages:
  - `SA1 Learning Campus 06`
  - `SA1 Learning Campus 07`
  - `SA1 Learning Campus 08`
  - `SA1 Learning Campus 09`
  - `SA1 Learning Campus 10`
- `schooladmin3@school-system.com` manages:
  - `SA2 Learning Campus 11`
  - `SA2 Learning Campus 12`
  - `SA2 Learning Campus 13`
  - `SA2 Learning Campus 14`
  - `SA2 Learning Campus 15`

Each assignment is persisted on the school document in `administrators[]`. This is the source used by scoped access middleware.

## Classroom + Student Volume

Per school admin:
- Schools managed: `5`
- Classrooms created per managed school: `12`
- Total classrooms created per admin: `60`
- Students enrolled per classroom: `15`
- Total students enrolled per admin: `900`

Global totals:
- Classrooms: `180`
- Students: `2700`

## Data Naming Patterns

- School names:
  - `SA1 Learning Campus 01` ... `SA1 Learning Campus 10`
  - `SA2 Learning Campus 11` ... `SA2 Learning Campus 15`
- Classroom names:
  - `<School Name> - <ADMIN_USERNAME_UPPERCASE> - Class <01..12>`
- Student IDs:
  - `STD-<ADMIN_TAG>-<school_index>-<class_index>-<student_index>`
  - Example: `STD-NORTH-1-01-01`

## How To Get IDs For API Calls

Because MongoDB IDs are generated at seed time:

1. Login with a seeded user.
2. Call list endpoints (`/school/listSchools`, `/classroom/listClassrooms`, `/student/listStudents`).
3. Copy `_id` values from responses for route testing.
