# School Management System API Documentation

## Table of Contents
- [Authentication](#authentication)
- [School Management](#school-management)
- [Classroom Management](#classroom-management)
- [Student Management](#student-management)

## Base URL
```
https://your-domain.com/api
```

## Authentication Headers
Most API endpoints require authentication. Include the following header in your requests:

```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

## Token Management
The system uses a dual-token system:
- **Long Token**: Valid for 3 years, used only to generate short tokens. Long tokens CANNOT be used to authenticate API requests.
- **Short Token**: Valid for 1 year, used for authenticating API requests

---

## Authentication

### Register User
Register a new user account.

#### Endpoint
```
POST /auth/register
```

#### Request Body
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "superadmin|school_admin",
  "assignedSchool": "string (optional, required for school_admin)"
}
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "school_admin",
    "assignedSchool": "5f8b8c9a7d6e5f4a3b2c1d0e"
  }'
```

#### Response
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "assignedSchool": "string",
    "status": "active|inactive|suspended",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "longToken": "string"
}
```

---

### Login User
Authenticate and receive a long token for future requests.

#### Endpoint
```
POST /auth/login
```

#### Request Body
```json
{
  "email": "string",
  "password": "string"
}
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

#### Response
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "assignedSchool": "string",
    "status": "active|inactive|suspended",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  },
  "longToken": "string"
}
```

---

### Create Short Token
Generate a short-lived token from a long token.

#### Endpoint
```
POST /token/v1_createShortToken
```

#### Headers
```bash
Authorization: Bearer YOUR_LONG_TOKEN
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/token/v1_createShortToken \
  -H "Authorization: Bearer YOUR_LONG_TOKEN"
```

**Note**: This is the only endpoint that accepts a long token. All other authenticated endpoints require a short token.

#### Response
```json
{
  "shortToken": "string"
}
```

---

### Get Profile
Retrieve the authenticated user's profile information.

#### Endpoint
```
GET /auth/getProfile
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Example Request
```bash
curl -X GET https://your-domain.com/api/auth/getProfile \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "user": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "assignedSchool": {
      "_id": "string",
      "name": "string",
      "address": {
        "street": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
      },
      "contactInfo": {
        "phone": "string",
        "email": "string"
      }
    },
    "status": "active|inactive|suspended",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

## School Management

### Create School
Create a new school (Superadmin only).

#### Endpoint
```
POST /school/createSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Request Body
```json
{
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "zipCode": "string",
    "country": "string"
  },
  "contactInfo": {
    "phone": "string",
    "email": "string"
  },
  "metadata": {
    "key": "value"
  }
}
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/school/createSchool \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "name": "Greenwood High School",
    "address": {
      "street": "123 Education Lane",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "USA"
    },
    "contactInfo": {
      "phone": "+1-555-123-4567",
      "email": "info@greenwood.edu"
    },
    "metadata": {
      "established": 1995,
      "type": "public"
    }
  }'
```

#### Response
```json
{
  "school": {
    "_id": "string",
    "name": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    },
    "contactInfo": {
      "phone": "string",
      "email": "string"
    },
    "administrators": [],
    "status": "active|inactive",
    "metadata": {
      "key": "value"
    },
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### List Schools
Get a paginated list of schools.

#### Endpoint
```
GET /school/listSchools
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/school/listSchools?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "schools": [
    {
      "_id": "string",
      "name": "string",
      "address": {
        "street": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
      },
      "contactInfo": {
        "phone": "string",
        "email": "string"
      },
      "administrators": [
        {
          "_id": "string",
          "username": "string",
          "email": "string",
          "role": "string"
        }
      ],
      "status": "active|inactive",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### Get School
Retrieve details of a specific school.

#### Endpoint
```
GET /school/getSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school to retrieve

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/school/getSchool?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "school": {
    "_id": "string",
    "name": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    },
    "contactInfo": {
      "phone": "string",
      "email": "string"
    },
    "administrators": [
      {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string"
      }
    ],
    "status": "active|inactive",
    "metadata": {
      "key": "value"
    },
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Update School
Update details of a specific school.

#### Endpoint
```
PUT /school/updateSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school to update

#### Request Body
```json
{
  "name": "string (optional)",
  "address": {
    "street": "string (optional)",
    "city": "string (optional)",
    "state": "string (optional)",
    "zipCode": "string (optional)",
    "country": "string (optional)"
  },
  "contactInfo": {
    "phone": "string (optional)",
    "email": "string (optional)"
  },
  "status": "active|inactive (optional)",
  "metadata": {
    "key": "value (optional)"
  }
}
```

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/school/updateSchool?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "name": "Updated Greenwood High School",
    "contactInfo": {
      "phone": "+1-555-987-6543"
    }
  }'
```

#### Response
```json
{
  "school": {
    "_id": "string",
    "name": "string",
    "address": {
      "street": "string",
      "city": "string",
      "state": "string",
      "zipCode": "string",
      "country": "string"
    },
    "contactInfo": {
      "phone": "string",
      "email": "string"
    },
    "administrators": [
      {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string"
      }
    ],
    "status": "active|inactive",
    "metadata": {
      "key": "value"
    },
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Assign Administrator
Assign an administrator to a school (Superadmin only).

#### Endpoint
```
PUT /school/assignAdministrator
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school
- `adminId` (required): ID of the administrator to assign

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/school/assignAdministrator?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e&adminId=5f8b8c9a7d6e5f4a3b2c1d0f" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Administrator assigned successfully",
  "school": {
    "_id": "string",
    "name": "string",
    "administrators": [
      {
        "_id": "string",
        "username": "string",
        "email": "string",
        "role": "string"
      }
    ]
  }
}
```

---

### Delete School
Soft delete a school (set status to inactive) (Superadmin only).

#### Endpoint
```
DELETE /school/deleteSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school to delete

#### Example Request
```bash
curl -X DELETE "https://your-domain.com/api/school/deleteSchool?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "School deleted successfully"
}
```

---

### Restore School
Restore a deleted school from the recycle bin.

#### Endpoint
```
PUT /school/restoreSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school to restore

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/school/restoreSchool?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "School restored successfully",
  "school": {
    "_id": "string",
    "name": "string",
    "status": "active"
  }
}
```

---

### List Deleted Schools
Get a paginated list of deleted schools in the recycle bin (Superadmin only).

#### Endpoint
```
GET /school/listDeletedSchools
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/school/listDeletedSchools?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "schools": [
    {
      "_id": "string",
      "name": "string",
      "address": {
        "street": "string",
        "city": "string",
        "state": "string",
        "zipCode": "string",
        "country": "string"
      },
      "contactInfo": {
        "phone": "string",
        "email": "string"
      },
      "status": "inactive",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### Permanently Delete School
Permanently delete a school from the recycle bin (Superadmin only).

#### Endpoint
```
DELETE /school/permanentlyDeleteSchool
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `schoolId` (required): ID of the school to permanently delete

#### Example Request
```bash
curl -X DELETE "https://your-domain.com/api/school/permanentlyDeleteSchool?schoolId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "School permanently deleted from recycle bin"
}
```

---

## Classroom Management

### Create Classroom
Create a new classroom.

#### Endpoint
```
POST /classroom/createClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Request Body
```json
{
  "name": "string",
  "roomNumber": "string",
  "gradeLevel": "string",
  "capacity": "number",
  "resources": ["string"]
}
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/classroom/createClassroom \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "name": "Mathematics Room",
    "roomNumber": "M-101",
    "gradeLevel": "9th Grade",
    "capacity": 30,
    "resources": ["projector", "whiteboard", "computers"]
  }'
```

#### Response
```json
{
  "classroom": {
    "_id": "string",
    "name": "string",
    "roomNumber": "string",
    "gradeLevel": "string",
    "capacity": "number",
    "resources": ["string"],
    "school": "string (school ID)",
    "status": "active|inactive",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### List Classrooms
Get a paginated list of classrooms.

#### Endpoint
```
GET /classroom/listClassrooms
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `schoolId` (optional): Filter by school ID

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/classroom/listClassrooms?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "classrooms": [
    {
      "_id": "string",
      "name": "string",
      "roomNumber": "string",
      "gradeLevel": "string",
      "capacity": "number",
      "resources": ["string"],
      "school": "string (school ID)",
      "status": "active|inactive",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### Get Classroom
Retrieve details of a specific classroom.

#### Endpoint
```
GET /classroom/getClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `classroomId` (required): ID of the classroom to retrieve

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/classroom/getClassroom?classroomId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "classroom": {
    "_id": "string",
    "name": "string",
    "roomNumber": "string",
    "gradeLevel": "string",
    "capacity": "number",
    "resources": ["string"],
    "school": {
      "_id": "string",
      "name": "string"
    },
    "status": "active|inactive",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Update Classroom
Update details of a specific classroom.

#### Endpoint
```
PUT /classroom/updateClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `classroomId` (required): ID of the classroom to update

#### Request Body
```json
{
  "name": "string (optional)",
  "capacity": "number (optional)",
  "resources": ["string (optional)"],
  "status": "active|inactive (optional)"
}
```

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/classroom/updateClassroom?classroomId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "name": "Advanced Mathematics Room",
    "capacity": 35
  }'
```

#### Response
```json
{
  "classroom": {
    "_id": "string",
    "name": "string",
    "roomNumber": "string",
    "gradeLevel": "string",
    "capacity": "number",
    "resources": ["string"],
    "school": "string (school ID)",
    "status": "active|inactive",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Delete Classroom
Soft delete a classroom (set status to inactive).

#### Endpoint
```
DELETE /classroom/deleteClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `classroomId` (required): ID of the classroom to delete

#### Example Request
```bash
curl -X DELETE "https://your-domain.com/api/classroom/deleteClassroom?classroomId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Classroom deleted successfully"
}
```

---

### Restore Classroom
Restore a deleted classroom from the recycle bin.

#### Endpoint
```
PUT /classroom/restoreClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `classroomId` (required): ID of the classroom to restore

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/classroom/restoreClassroom?classroomId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Classroom restored successfully",
  "classroom": {
    "_id": "string",
    "name": "string",
    "status": "active"
  }
}
```

---

### List Deleted Classrooms
Get a paginated list of deleted classrooms in the recycle bin.

#### Endpoint
```
GET /classroom/listDeletedClassrooms
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/classroom/listDeletedClassrooms?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "classrooms": [
    {
      "_id": "string",
      "name": "string",
      "roomNumber": "string",
      "gradeLevel": "string",
      "capacity": "number",
      "resources": ["string"],
      "school": "string (school ID)",
      "status": "inactive",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

---

### Permanently Delete Classroom
Permanently delete a classroom from the recycle bin.

#### Endpoint
```
DELETE /classroom/permanentlyDeleteClassroom
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `classroomId` (required): ID of the classroom to permanently delete

#### Example Request
```bash
curl -X DELETE "https://your-domain.com/api/classroom/permanentlyDeleteClassroom?classroomId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Classroom permanently deleted from recycle bin"
}
```

---

## Student Management

### Enroll Student
Enroll a new student in a classroom.

#### Endpoint
```
POST /student/enrollStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Request Body
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "studentId": "string",
  "classroomId": "string",
  "guardianInfo": {
    "name": "string",
    "phone": "string",
    "email": "string",
    "relationship": "string"
  }
}
```

#### Example Request
```bash
curl -X POST https://your-domain.com/api/student/enrollStudent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "2010-05-15",
    "studentId": "STD-2023-001",
    "classroomId": "5f8b8c9a7d6e5f4a3b2c1d0e",
    "guardianInfo": {
      "name": "Jane Doe",
      "phone": "+1-555-123-4567",
      "email": "jane.doe@example.com",
      "relationship": "Mother"
    }
  }'
```

#### Response
```json
{
  "student": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "studentId": "string",
    "classroom": "string (classroom ID)",
    "school": "string (school ID)",
    "guardianInfo": {
      "name": "string",
      "phone": "string",
      "email": "string",
      "relationship": "string"
    },
    "status": "active|transferred|graduated|withdrawn",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### List Students
Get a paginated list of students.

#### Endpoint
```
GET /student/listStudents
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `schoolId` (optional): Filter by school ID
- `classroomId` (optional): Filter by classroom ID

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/student/listStudents?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "students": [
    {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "studentId": "string",
      "classroom": {
        "_id": "string",
        "name": "string"
      },
      "school": {
        "_id": "string",
        "name": "string"
      },
      "guardianInfo": {
        "name": "string",
        "phone": "string",
        "email": "string",
        "relationship": "string"
      },
      "status": "active|transferred|graduated|withdrawn",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

---

### Get Student
Retrieve details of a specific student.

#### Endpoint
```
GET /student/getStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `studentId` (required): ID of the student to retrieve

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/student/getStudent?studentId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "student": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "studentId": "string",
    "classroom": {
      "_id": "string",
      "name": "string"
    },
    "school": {
      "_id": "string",
      "name": "string"
    },
    "guardianInfo": {
      "name": "string",
      "phone": "string",
      "email": "string",
      "relationship": "string"
    },
    "status": "active|transferred|graduated|withdrawn",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Update Student
Update details of a specific student.

#### Endpoint
```
PUT /student/updateStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `studentId` (required): ID of the student to update

#### Request Body
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "guardianInfo": {
    "name": "string (optional)",
    "phone": "string (optional)",
    "email": "string (optional)",
    "relationship": "string (optional)"
  },
  "status": "active|transferred|graduated|withdrawn (optional)"
}
```

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/student/updateStudent?studentId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "firstName": "Johnny",
    "guardianInfo": {
      "phone": "+1-555-987-6543"
    }
  }'
```

#### Response
```json
{
  "student": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "fullName": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "studentId": "string",
    "classroom": "string (classroom ID)",
    "school": "string (school ID)",
    "guardianInfo": {
      "name": "string",
      "phone": "string",
      "email": "string",
      "relationship": "string"
    },
    "status": "active|transferred|graduated|withdrawn",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### Withdrawn Student
Withdraw a student from school (soft delete).

#### Endpoint
```
DELETE /student/withdrawnStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `studentId` (required): ID of the student to withdraw

#### Example Request
```bash
curl -X DELETE "https://your-domain.com/api/student/withdrawnStudent?studentId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Student withdrawn successfully"
}
```

---

### Restore Student
Restore a withdrawn student.

#### Endpoint
```
PUT /student/restoreStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `studentId` (required): ID of the student to restore

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/student/restoreStudent?studentId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "message": "Student restored successfully",
  "student": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "active"
  }
}
```

---

### List Withdrawn Students
Get a paginated list of withdrawn students.

#### Endpoint
```
GET /student/listWithdrawnStudents
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

#### Example Request
```bash
curl -X GET "https://your-domain.com/api/student/listWithdrawnStudents?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN"
```

#### Response
```json
{
  "students": [
    {
      "_id": "string",
      "firstName": "string",
      "lastName": "string",
      "fullName": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "studentId": "string",
      "classroom": {
        "_id": "string",
        "name": "string"
      },
      "school": {
        "_id": "string",
        "name": "string"
      },
      "guardianInfo": {
        "name": "string",
        "phone": "string",
        "email": "string",
        "relationship": "string"
      },
      "status": "withdrawn",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### Transfer Student
Transfer a student to another school/classroom.

#### Endpoint
```
PUT /student/transferStudent
```

#### Headers
```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

#### Query Parameters
- `studentId` (required): ID of the student to transfer

#### Request Body
```json
{
  "targetSchoolId": "string",
  "targetClassroomId": "string",
  "reason": "string (optional)"
}
```

#### Example Request
```bash
curl -X PUT "https://your-domain.com/api/student/transferStudent?studentId=5f8b8c9a7d6e5f4a3b2c1d0e" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SHORT_TOKEN" \
  -d '{
    "targetSchoolId": "5f8b8c9a7d6e5f4a3b2c1d0f",
    "targetClassroomId": "5f8b8c9a7d6e5f4a3b2c1d1g",
    "reason": "Family relocation"
  }'
```

#### Response
```json
{
  "message": "Student transferred successfully",
  "student": {
    "_id": "string",
    "firstName": "string",
    "lastName": "string",
    "status": "transferred",
    "school": "string (new school ID)",
    "classroom": "string (new classroom ID)"
  }
}
```