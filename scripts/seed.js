/**
 * Database Seed Script for School Management System
 * Creates initial data: Superadmin, Schools, School Admins, Classrooms, and Students
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const User = require('../managers/entities/user/user.mongoModel');
const School = require('../managers/entities/school/school.mongoModel');
const Classroom = require('../managers/entities/classroom/classroom.mongoModel');
const Student = require('../managers/entities/student/student.mongoModel');

const CONSTANTS = require('../managers/_common/constants');

async function seed() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            School.deleteMany({}),
            Classroom.deleteMany({}),
            Student.deleteMany({})
        ]);
        console.log('✅ Existing data cleared\n');

        // Create Superadmin
        console.log('👤 Creating Superadmin...');
        const superadmin = new User({
            username: 'superadmin',
            email: 'superadmin@school-system.com',
            password: 'Superadmin@123',
            role: CONSTANTS.ROLES.SUPERADMIN,
            key: nanoid(32),
            status: CONSTANTS.USER_STATUS.ACTIVE
        });
        await superadmin.save();
        console.log(`✅ Superadmin created: ${superadmin.email}\n`);

        // Create Schools
        console.log('🏫 Creating Schools...');
        const school1 = new School({
            name: 'Sunrise Elementary School',
            address: {
                street: '123 Education Ave',
                city: 'Springfield',
                state: 'IL',
                zipCode: '62701',
                country: 'USA'
            },
            contactInfo: {
                phone: '+1-217-555-0101',
                email: 'info@sunrise-elementary.edu',
                website: 'https://sunrise-elementary.edu'
            },
            metadata: {
                establishedDate: new Date('2000-01-15'),
                registrationNumber: 'SE-2000-001',
                accreditation: 'State Board of Education'
            },
            status: CONSTANTS.SCHOOL_STATUS.ACTIVE
        });
        await school1.save();
        console.log(`✅ Created: ${school1.name}`);

        const school2 = new School({
            name: 'Oakwood High School',
            address: {
                street: '456 Knowledge Blvd',
                city: 'Chicago',
                state: 'IL',
                zipCode: '60601',
                country: 'USA'
            },
            contactInfo: {
                phone: '+1-312-555-0202',
                email: 'contact@oakwood-high.edu',
                website: 'https://oakwood-high.edu'
            },
            metadata: {
                establishedDate: new Date('1995-09-01'),
                registrationNumber: 'OH-1995-002',
                accreditation: 'State Board of Education'
            },
            status: CONSTANTS.SCHOOL_STATUS.ACTIVE
        });
        await school2.save();
        console.log(`✅ Created: ${school2.name}\n`);

        // Create School Administrators
        console.log('👥 Creating School Administrators...');
        const admin1 = new User({
            username: 'admin_sunrise',
            email: 'admin@sunrise-elementary.edu',
            password: 'Admin@123',
            role: CONSTANTS.ROLES.SCHOOL_ADMIN,
            assignedSchool: school1._id,
            key: nanoid(32),
            status: CONSTANTS.USER_STATUS.ACTIVE
        });
        await admin1.save();
        school1.administrators.push(admin1._id);
        await school1.save();
        console.log(`✅ Created: ${admin1.email} → ${school1.name}`);

        const admin2 = new User({
            username: 'admin_oakwood',
            email: 'admin@oakwood-high.edu',
            password: 'Admin@123',
            role: CONSTANTS.ROLES.SCHOOL_ADMIN,
            assignedSchool: school2._id,
            key: nanoid(32),
            status: CONSTANTS.USER_STATUS.ACTIVE
        });
        await admin2.save();
        school2.administrators.push(admin2._id);
        await school2.save();
        console.log(`✅ Created: ${admin2.email} → ${school2.name}\n`);

        // Create Classrooms for School 1
        console.log('🚪 Creating Classrooms for Sunrise Elementary...');
        const classroom1 = new Classroom({
            name: 'Grade 1 - Room A',
            roomNumber: '101',
            school: school1._id,
            gradeLevel: '1st Grade',
            capacity: 25,
            currentEnrollment: 0,
            resources: ['Whiteboard', 'Projector', 'Computers'],
            status: CONSTANTS.CLASSROOM_STATUS.ACTIVE
        });
        await classroom1.save();
        console.log(`✅ Created: ${classroom1.name}`);

        const classroom2 = new Classroom({
            name: 'Grade 2 - Room B',
            roomNumber: '102',
            school: school1._id,
            gradeLevel: '2nd Grade',
            capacity: 30,
            currentEnrollment: 0,
            resources: ['Whiteboard', 'Library Corner'],
            status: CONSTANTS.CLASSROOM_STATUS.ACTIVE
        });
        await classroom2.save();
        console.log(`✅ Created: ${classroom2.name}\n`);

        // Create Classrooms for School 2
        console.log('🚪 Creating Classrooms for Oakwood High...');
        const classroom3 = new Classroom({
            name: 'Math 101',
            roomNumber: '201',
            school: school2._id,
            gradeLevel: '9th Grade',
            capacity: 35,
            currentEnrollment: 0,
            resources: ['Whiteboard', 'Scientific Calculators', 'Smart Board'],
            status: CONSTANTS.CLASSROOM_STATUS.ACTIVE
        });
        await classroom3.save();
        console.log(`✅ Created: ${classroom3.name}\n`);

        // Create Sample Students
        console.log('👨‍🎓 Creating Sample Students...');
        const student1 = new Student({
            firstName: 'Alice',
            lastName: 'Johnson',
            dateOfBirth: new Date('2016-03-15'),
            studentId: 'SE-2024-001',
            school: school1._id,
            classroom: classroom1._id,
            guardianInfo: {
                guardianName: 'Robert Johnson',
                relationship: 'Father',
                phone: '+1-217-555-1001',
                email: 'rjohnson@email.com',
                address: {
                    street: '789 Oak St',
                    city: 'Springfield',
                    state: 'IL',
                    zipCode: '62701'
                }
            },
            status: CONSTANTS.STUDENT_STATUS.ACTIVE
        });
        await student1.save();
        classroom1.currentEnrollment += 1;
        await classroom1.save();
        console.log(`✅ Created: ${student1.fullName} → ${school1.name}`);

        const student2 = new Student({
            firstName: 'Bob',
            lastName: 'Smith',
            dateOfBirth: new Date('2010-07-22'),
            studentId: 'OH-2024-001',
            school: school2._id,
            classroom: classroom3._id,
            guardianInfo: {
                guardianName: 'Linda Smith',
                relationship: 'Mother',
                phone: '+1-312-555-2001',
                email: 'lsmith@email.com',
                address: {
                    street: '321 Maple Ave',
                    city: 'Chicago',
                    state: 'IL',
                    zipCode: '60601'
                }
            },
            status: CONSTANTS.STUDENT_STATUS.ACTIVE
        });
        await student2.save();
        classroom3.currentEnrollment += 1;
        await classroom3.save();
        console.log(`✅ Created: ${student2.fullName} → ${school2.name}\n`);

        // Summary
        console.log('═══════════════════════════════════════════════════════');
        console.log('🎉 Database Seeding Complete!\n');
        console.log('📊 Summary:');
        console.log(`   • 1 Superadmin`);
        console.log(`   • 2 Schools`);
        console.log(`   • 2 School Administrators`);
        console.log(`   • 3 Classrooms`);
        console.log(`   • 2 Students\n`);
        console.log('🔑 Login Credentials:');
        console.log('   Superadmin:');
        console.log(`     Email: superadmin@school-system.com`);
        console.log(`     Password: Superadmin@123\n`);
        console.log('   School Admin (Sunrise Elementary):');
        console.log(`     Email: admin@sunrise-elementary.edu`);
        console.log(`     Password: Admin@123\n`);
        console.log('   School Admin (Oakwood High):');
        console.log(`     Email: admin@oakwood-high.edu`);
        console.log(`     Password: Admin@123`);
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run the seed function
seed();
