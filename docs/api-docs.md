# School Management System API Documentation

## Table of Contents
- [Health Check](#health-check)
- [Authentication](#authentication)
- [School Management](#school-management)
- [Classroom Management](#classroom-management)
- [Student Management](#student-management)

## Base URL
```
https://your-domain.com/api
```

## Health Check
Check application, database, and redis connectivity status.

### Endpoint
```
GET /
```

### Example Request
```bash
curl -X GET https://your-domain.com/api
```

### Success Response (`200 OK`)
```json
{
  "status": "ok",
  "database": "ok",
  "redis": "ok",
  "message": "Server is running ... 🚀"
}
```

### Degraded Response (`503 Service Unavailable`)
```json
{
  "status": "error",
  "database": "ok|error",
  "redis": "ok|error",
  "message": "Server is running ... 🚀"
}
```

## Authentication Headers
Most API endpoints require authentication. Include the following header in your requests:

```bash
Authorization: Bearer YOUR_SHORT_TOKEN
```

Legacy compatibility is also supported:

```bash
token: YOUR_SHORT_TOKEN
```

## Token Management
The system uses a dual-token system:
- **Long Token**: Valid for 3 years, used only to generate short tokens. Long tokens CANNOT be used to authenticate API requests.
- **Short Token**: Valid for 1 year, used for authenticating API requests

### Authentication Flow
1. Register or login to receive a `longToken`
2. Call `POST /token/v1_createShortToken` with the long token
3. Use the returned `shortToken` on all protected routes
4. Protected middleware accepts `Authorization: Bearer <shortToken>` (or legacy `token` header)

## Error Handling
The API uses conventional HTTP response codes to indicate success or failure of requests. In general:
- Codes in the 2xx range indicate success
- Codes in the 4xx range indicate an error that failed given the information provided
- Codes in the 5xx range indicate an error with the server

### Common Error Response Format
All error responses follow this format:
```json
{
  "errors": ["Error message 1", "Error message 2"]
}
```

### HTTP Status Codes
- `200 OK`: Request succeeded
- `201 Created`: Request succeeded and a resource was created
- `400 Bad Request`: Request failed due to invalid input data
- `401 Unauthorized`: Authentication failed or user doesn't have permissions
- `403 Forbidden`: Access denied due to insufficient permissions
- `404 Not Found`: Requested resource doesn't exist
- `409 Conflict`: Request conflicts with current state of the server (e.g., duplicate entry)
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: An unexpected server error occurred

### Runtime Error-Code Alignment
The API runtime maps errors using these rules:
- Validation/invalid input/required fields -> `422`
- Auth token missing/invalid -> `401`
- Role or scope violations -> `403`
- Missing resources -> `404`
- Duplicate or conflict conditions -> `409`
- Internal operation failures (`Failed to ...`) -> `500`

### Common Error Messages
- `"Authentication required"`: Missing or invalid authorization header
- `"Access denied"`: Insufficient permissions to perform the action
- `"Access denied. Superadmin role required"`: Action requires superadmin privileges
- `"invalid"`: Invalid token provided
- `"missing token"`: Authorization token is missing from the request
- `"unauthorized"`: Invalid or expired token provided
- `"Email already registered"`: Email address is already in use
- `"Username already taken"`: Username is already in use
- `"Invalid email or password"`: Login credentials are incorrect
- `"Account is inactive or suspended"`: User account is not active
- `"School with this name already exists"`: Duplicate school name detected
- `"School not found"`: Requested school does not exist
- `"School is not in recycle bin"`: Attempt to restore an active school
- `"School has not been deleted. Soft delete it first before permanent deletion."`: Attempt to permanently delete an active school
- `"Cannot permanently delete school with linked records"`: Dependencies prevent permanent deletion
- `"Administrator not found"`: Referenced administrator does not exist
- `"User must have school_admin role"`: User role is not appropriate for the action
- `"Student not found"`: Requested student does not exist
- `"Classroom not found"`: Requested classroom does not exist
- `"Invalid role"`: Provided role is not valid
- `"School Admin must be assigned to a school"`: School admin needs to be assigned to a school
- `"Assigned school not found"`: Referenced school for assignment does not exist
- `"Assigned school is not active"`: Referenced school is inactive
- `"No school assigned to this administrator"`: Administrator has no assigned school
- `"Access denied. You can only access your assigned school."`: Administrator tried to access unauthorized school
- `"Access denied. You can only manage your assigned school."`: Administrator tried to manage unauthorized school
- `"School ID is required"`: Missing required school ID parameter
- `"School ID and Admin ID are required"`: Missing required IDs for assignment
- `"Registration failed. Please try again."`: Generic registration error
- `"Login failed. Please try again."`: Generic login error
- `"Failed to create school"`: Generic school creation error
- `"Failed to fetch schools"`: Generic school listing error
- `"Failed to fetch deleted schools"`: Generic deleted school listing error
- `"Failed to fetch school"`: Generic school retrieval error
- `"Failed to update school"`: Generic school update error
- `"Failed to delete school"`: Generic school deletion error
- `"Failed to restore school"`: Generic school restoration error
- `"Failed to permanently delete school"`: Generic permanent school deletion error
- `"Failed to assign administrator"`: Generic administrator assignment error
- `"Failed to enroll student"`: Generic student enrollment error
- `"Failed to fetch students"`: Generic student listing error
- `"Failed to fetch student"`: Generic student retrieval error
- `"Failed to update student"`: Generic student update error
- `"Failed to withdraw student"`: Generic student withdrawal error
- `"Failed to restore student"`: Generic student restoration error
- `"Failed to transfer student"`: Generic student transfer error
- `"Failed to create classroom"`: Generic classroom creation error
- `"Failed to fetch classrooms"`: Generic classroom listing error
- `"Failed to fetch classroom"`: Generic classroom retrieval error
- `"Failed to update classroom"`: Generic classroom update error
- `"Failed to delete classroom"`: Generic classroom deletion error
- `"Failed to restore classroom"`: Generic classroom restoration error
- `"Failed to permanently delete classroom"`: Generic permanent classroom deletion error

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
Get a paginated list of schools (Superadmin only).

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
Retrieve details of a specific school (Superadmin only).

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
Update details of a specific school (Superadmin only).

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
Restore a deleted school from the recycle bin (Superadmin only).

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
