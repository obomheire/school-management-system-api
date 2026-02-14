/**
 * Database Seed Script for School Management System
 *
 * Seeds:
 * - 2 superadmins
 * - 3 school admins
 * - 15 schools (10 linked to superadmin #1 plan, 5 linked to superadmin #2 plan)
 * - 5 assigned schools per school admin
 * - 12 classrooms per assigned school per school admin
 * - 15 students per classroom
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const User = require("../managers/entities/user/user.mongoModel");
const School = require("../managers/entities/school/school.mongoModel");
const Classroom = require("../managers/entities/classroom/classroom.mongoModel");
const Student = require("../managers/entities/student/student.mongoModel");

const CONSTANTS = require("../managers/_common/constants");

const SUPERADMINS = [
  {
    username: "superadmin_primary",
    email: "superadmin1@school-system.com",
    password: "Superadmin1@123",
    tag: "SA1",
  },
  {
    username: "superadmin_secondary",
    email: "superadmin2@school-system.com",
    password: "Superadmin2@123",
    tag: "SA2",
  },
];

const SCHOOL_ADMINS = [
  {
    username: "schooladmin_north",
    email: "schooladmin1@school-system.com",
    password: "SchoolAdmin1@123",
    tag: "ADM1",
  },
  {
    username: "schooladmin_central",
    email: "schooladmin2@school-system.com",
    password: "SchoolAdmin2@123",
    tag: "ADM2",
  },
  {
    username: "schooladmin_south",
    email: "schooladmin3@school-system.com",
    password: "SchoolAdmin3@123",
    tag: "ADM3",
  },
];

const CLASSROOMS_PER_SCHOOL_PER_ADMIN = 12;
const STUDENTS_PER_CLASSROOM = 15;

const GRADE_LEVELS = [
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

const STATES = ["CA", "TX", "FL", "IL", "NY", "WA", "CO", "AZ", "GA", "NC"];
const CITIES = [
  "Springfield",
  "Riverside",
  "Fairview",
  "Greenville",
  "Madison",
  "Franklin",
  "Georgetown",
  "Clinton",
  "Salem",
  "Bristol",
];

function getSchoolBlueprint({ index, creatorTag }) {
  const city = CITIES[index % CITIES.length];
  const state = STATES[index % STATES.length];
  const schoolNumber = String(index + 1).padStart(2, "0");
  const name = `${creatorTag} Learning Campus ${schoolNumber}`;
  const domain = `${creatorTag.toLowerCase()}-${schoolNumber}.school.local`;

  return {
    name,
    address: {
      street: `${100 + index} Education Blvd`,
      city,
      state,
      zipCode: `${String(90000 + index).padStart(5, "0")}`,
      country: "USA",
    },
    contactInfo: {
      phone: `+1-555-${String(1000 + index).padStart(4, "0")}`,
      email: `info@${domain}`,
      website: `https://${domain}`,
    },
    metadata: {
      establishedDate: new Date(`20${String(10 + (index % 10)).padStart(2, "0")}-09-01`),
      registrationNumber: `${creatorTag}-REG-${schoolNumber}`,
      accreditation: "State Board of Education",
    },
    status: CONSTANTS.SCHOOL_STATUS.ACTIVE,
  };
}

function getGuardianAddress(seed) {
  return {
    street: `${200 + seed} Family St`,
    city: CITIES[seed % CITIES.length],
    state: STATES[seed % STATES.length],
    zipCode: `${String(70000 + seed).padStart(5, "0")}`,
  };
}

async function clearCollections() {
  await Promise.all([
    User.deleteMany({}),
    School.deleteMany({}),
    Classroom.deleteMany({}),
    Student.deleteMany({}),
  ]);
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("Clearing existing data...");
    await clearCollections();
    console.log("Existing data cleared");

    console.log("Creating superadmins...");
    const superadmins = [];
    for (const superadminSeed of SUPERADMINS) {
      const superadmin = await User.create({
        username: superadminSeed.username,
        email: superadminSeed.email,
        password: superadminSeed.password,
        role: CONSTANTS.ROLES.SUPERADMIN,
        key: nanoid(32),
        status: CONSTANTS.USER_STATUS.ACTIVE,
      });
      superadmins.push(superadmin);
    }
    console.log(`Created ${superadmins.length} superadmins`);

    console.log("Creating schools...");
    const schools = [];
    let globalSchoolIndex = 0;
    for (let i = 0; i < 10; i += 1) {
      const school = await School.create(
        getSchoolBlueprint({ index: globalSchoolIndex, creatorTag: "SA1" }),
      );
      schools.push({ doc: school, createdBy: SUPERADMINS[0].email });
      globalSchoolIndex += 1;
    }
    for (let i = 0; i < 5; i += 1) {
      const school = await School.create(
        getSchoolBlueprint({ index: globalSchoolIndex, creatorTag: "SA2" }),
      );
      schools.push({ doc: school, createdBy: SUPERADMINS[1].email });
      globalSchoolIndex += 1;
    }
    console.log(`Created ${schools.length} schools`);

    // Assign 5 schools per school admin (non-overlapping groups of 5).
    const adminSchoolBuckets = [
      schools.slice(0, 5),
      schools.slice(5, 10),
      schools.slice(10, 15),
    ];

    console.log("Creating school admins and assigning schools...");
    const schoolAdmins = [];
    for (let i = 0; i < SCHOOL_ADMINS.length; i += 1) {
      const adminSeed = SCHOOL_ADMINS[i];
      const assignedSchoolRefs = adminSchoolBuckets[i];
      const primaryAssignedSchoolId = assignedSchoolRefs[0].doc._id;

      const schoolAdmin = await User.create({
        username: adminSeed.username,
        email: adminSeed.email,
        password: adminSeed.password,
        role: CONSTANTS.ROLES.SCHOOL_ADMIN,
        assignedSchool: primaryAssignedSchoolId,
        key: nanoid(32),
        status: CONSTANTS.USER_STATUS.ACTIVE,
      });

      schoolAdmins.push({
        doc: schoolAdmin,
        schools: assignedSchoolRefs,
      });

      await School.updateMany(
        { _id: { $in: assignedSchoolRefs.map((entry) => entry.doc._id) } },
        { $addToSet: { administrators: schoolAdmin._id } },
      );
    }
    console.log(`Created ${schoolAdmins.length} school admins`);

    console.log("Creating classrooms and students...");
    let totalClassrooms = 0;
    let totalStudents = 0;

    for (let adminIndex = 0; adminIndex < schoolAdmins.length; adminIndex += 1) {
      const schoolAdmin = schoolAdmins[adminIndex];

      for (let schoolIndex = 0; schoolIndex < schoolAdmin.schools.length; schoolIndex += 1) {
        const schoolRef = schoolAdmin.schools[schoolIndex];
        const schoolDoc = schoolRef.doc;

        for (
          let classroomIndex = 1;
          classroomIndex <= CLASSROOMS_PER_SCHOOL_PER_ADMIN;
          classroomIndex += 1
        ) {
          const roomSuffix = String(classroomIndex).padStart(2, "0");
          const roomNumber = `${adminIndex + 1}${schoolIndex + 1}${roomSuffix}`;
          const gradeLevel = GRADE_LEVELS[(classroomIndex - 1) % GRADE_LEVELS.length];

          const classroom = await Classroom.create({
            name: `${schoolDoc.name} - ${schoolAdmin.doc.username.toUpperCase()} - Class ${roomSuffix}`,
            roomNumber,
            school: schoolDoc._id,
            gradeLevel,
            capacity: 40,
            currentEnrollment: 0,
            resources: ["Whiteboard", "Projector", "Computers", "Library Corner"],
            status: CONSTANTS.CLASSROOM_STATUS.ACTIVE,
          });

          const students = [];
          for (let studentIndex = 1; studentIndex <= STUDENTS_PER_CLASSROOM; studentIndex += 1) {
            const studentSeed = totalStudents + studentIndex;
            const studentCode = `${schoolAdmin.doc.username
              .split("_")[1]
              .toUpperCase()}-${schoolIndex + 1}-${roomSuffix}-${String(studentIndex).padStart(2, "0")}`;

            students.push({
              firstName: `Student${adminIndex + 1}${schoolIndex + 1}${roomSuffix}${String(studentIndex).padStart(2, "0")}`,
              lastName: "Test",
              dateOfBirth: new Date(`201${(studentIndex % 8) + 1}-0${((studentIndex % 9) + 1)}-15`),
              studentId: `STD-${studentCode}`,
              school: schoolDoc._id,
              classroom: classroom._id,
              guardianInfo: {
                guardianName: `Guardian ${studentCode}`,
                relationship: studentIndex % 2 === 0 ? "Mother" : "Father",
                phone: `+1-555-${String(3000 + studentSeed).padStart(4, "0")}`,
                email: `guardian-${studentCode.toLowerCase()}@mail.local`,
                address: getGuardianAddress(studentSeed),
              },
              status: CONSTANTS.STUDENT_STATUS.ACTIVE,
            });
          }

          await Student.insertMany(students);

          classroom.currentEnrollment = STUDENTS_PER_CLASSROOM;
          await classroom.save();

          totalClassrooms += 1;
          totalStudents += STUDENTS_PER_CLASSROOM;
        }
      }
    }

    console.log("Seed complete");
    console.log("Summary:");
    console.log(`- Superadmins: ${superadmins.length}`);
    console.log(`- School admins: ${schoolAdmins.length}`);
    console.log(`- Schools: ${schools.length} (SA1: 10, SA2: 5)`);
    console.log(`- Classrooms: ${totalClassrooms}`);
    console.log(`- Students: ${totalStudents}`);
    console.log("Login credentials:");
    for (const entry of SUPERADMINS) {
      console.log(`- ${entry.email} / ${entry.password} (${CONSTANTS.ROLES.SUPERADMIN})`);
    }
    for (const entry of SCHOOL_ADMINS) {
      console.log(`- ${entry.email} / ${entry.password} (${CONSTANTS.ROLES.SCHOOL_ADMIN})`);
    }
  } catch (error) {
    console.error("Seeding error:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

seed();
