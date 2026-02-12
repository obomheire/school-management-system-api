# School Management System API

A comprehensive RESTful API for managing schools, classrooms, and students with Role-Based Access Control (RBAC).

## ✨ Features

- **Role-Based Access Control (RBAC)**: Superadmin and School Administrator roles
- **Entity Management**: Schools, Classrooms, and Students with full CRUD operations
- **Security**: JWT authentication, password hashing, school-level access control
- **Performance**: Redis caching, MongoDB indexes, pagination
- **Data Integrity**: MongoDB transactions, classroom capacity enforcement, transfer history

## 🛠️ Tech Stack

- Node.js + Express.js
- MongoDB (Mongoose)
- Redis (Caching)
- JWT Authentication
- bcrypt (Password Hashing)

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB and Redis credentials

# Seed the database
node scripts/seed.js

# Start the server
npm start
```

Server will run on `http://localhost:5111`

### Test Credentials (After Seeding)

**Superadmin:**
- Email: `superadmin@school-system.com`
- Password: `Superadmin@123`

**School Admin (Sunrise Elementary):**
- Email: `admin@sunrise-elementary.edu`
- Password: `Admin@123`

## 📚 API Documentation

### Authentication Flow

1. **Register/Login** → Get `longToken`
2. **Create Short Token** → Get `shortToken`
3. **Use Short Token** in all requests via `token` header

### Main Endpoints

#### Authentication
```http
POST /api/auth/register      # Register user
POST /api/auth/login         # Login
POST /api/token/v1_createShortToken  # Create short token from long token
GET  /api/auth/getProfile    # Get user profile
```

#### Schools (Superadmin only)
```http
POST /api/school/createSchool
GET  /api/school/listSchools?page=1&limit=20
GET  /api/school/getSchool?schoolId=<id>
POST /api/school/updateSchool?schoolId=<id>
POST /api/school/deleteSchool?schoolId=<id>
POST /api/school/assignAdministrator?schoolId=<id>
```

#### Classrooms (School Admin scoped)
```http
POST /api/classroom/createClassroom
GET  /api/classroom/listClassrooms?schoolId=<id>&page=1
GET  /api/classroom/getClassroom?schoolId=<id>&classroomId=<id>
POST /api/classroom/updateClassroom?schoolId=<id>&classroomId=<id>
POST /api/classroom/deleteClassroom?schoolId=<id>&classroomId=<id>
```

#### Students (School Admin scoped)
```http
POST /api/student/enrollStudent
GET  /api/student/listStudents?schoolId=<id>&page=1
GET  /api/student/getStudent?schoolId=<id>&studentId=<id>
POST /api/student/updateStudent?schoolId=<id>&studentId=<id>
POST /api/student/deleteStudent?schoolId=<id>&studentId=<id>
POST /api/student/transferStudent?schoolId=<id>&studentId=<id>
```

### Example: Register and Login

```bash
# 1. Register
curl -X POST http://localhost:5111/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_test",
    "email": "test@example.com",
    "password": "Test@123",
    "role": "superadmin"
  }'

# 2. Login
curl -X POST http://localhost:5111/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@school-system.com",
    "password": "Superadmin@123"
  }'

# 3. Create Short Token
curl -X POST http://localhost:5111/api/token/v1_createShortToken \
  -H "token: <long-token-from-login>"

# 4. Use Short Token
curl -X GET http://localhost:5111/api/auth/getProfile \
  -H "token: <short-token>"
```

## 🔐 Role-Based Access Control

### Superadmin
- Full access to all schools
- Can create/update/delete schools
- Can assign School Admins
- Can manage all classrooms and students

### School Administrator
- Access only to their assigned school
- Cannot access other schools
- Can manage classrooms in their school
- Can manage students in their school

## 📁 Project Structure

```
managers/
  ├── entities/
  │   ├── auth/          # Authentication manager
  │   ├── school/        # School CRUD operations
  │   ├── classroom/     # Classroom management
  │   └── student/       # Student enrollment & transfer
  ├── _common/
  │   ├── constants.js   # System constants
  │   ├── rbac.helper.js # RBAC utilities
  │   └── schema.validators.js
mws/
  ├── __auth.mw.js       # JWT authentication
  ├── __role.mw.js       # Role authorization
  └── __schoolScope.mw.js # School scoping
scripts/
  └── seed.js            # Database seeding
```

## 🌍 Environment Variables

```env
# Server
USER_PORT=5111
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://...

# Redis
CACHE_REDIS=redis://...
OYSTER_REDIS=redis://...
CORTEX_REDIS=redis://...

# JWT Secrets (CHANGE IN PRODUCTION!)
LONG_TOKEN_SECRET=your-secret-min-32-chars
SHORT_TOKEN_SECRET=your-secret-min-32-chars
NACL_SECRET=your-secret-min-32-chars
```

## 🚢 Deployment

1. Set environment variables in your hosting platform
2. Deploy to Railway, Render, Heroku, or DigitalOcean
3. Run seed script: `node scripts/seed.js`
4. Test all endpoints

## 🧪 Testing

### Test RBAC
1. Login as Superadmin → Access all schools ✅
2. Login as School Admin → Access only assigned school ✅
3. School Admin tries another school → 403 Error ✅

### Test Classroom Capacity
1. Create classroom with capacity 2
2. Enroll 2 students → Success ✅
3. Enroll 3rd student → Capacity error ✅

### Test Student Transfer
1. Enroll student in School A
2. Transfer to School B → Updates both schools ✅
3. Check transfer history → Recorded ✅

## 📝 Key Features

- **Manager-based Architecture**: Declarative middleware via `__` prefixed parameters
- **Automatic Validation**: Schema-based input validation
- **MongoDB Transactions**: Ensures data consistency for enrollment/transfer
- **Redis Caching**: Frequently accessed schools cached (1 hour TTL)
- **Pagination**: All list endpoints support pagination (default: 20, max: 100)
- **Security Headers**: Helmet.js ready for production
- **Password Hashing**: bcrypt with 10 salt rounds

## 📄 License

ISC

---

**Made for the School Management System Technical Challenge** 🎓
