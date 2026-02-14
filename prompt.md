Here are **all the API routes** extracted from the provided Postman collection, listed with their **HTTP methods** and full endpoint paths:

### AUTH
- **POST** `{{baseURL}}/auth/register`
- **POST** `{{baseURL}}/auth/login`
- **POST** `{{baseURL}}/token/v1_createShortToken`
- **GET**  `{{baseURL}}/auth/getProfile`

### SCHOOL
- **POST**   `{{baseURL}}/school/createSchool`
- **GET**    `{{baseURL}}/school/listSchools`
- **GET**    `{{baseURL}}/school/getSchool`
- **PUT**    `{{baseURL}}/school/updateSchool`
- **PUT**    `{{baseURL}}/school/assignAdministrator`
- **DELETE** `{{baseURL}}/school/deleteSchool`
- **PUT**    `{{baseURL}}/school/restoreSchool`
- **GET**    `{{baseURL}}/school/listDeletedSchools`
- **DELETE** `{{baseURL}}/school/permanentlyDeleteSchool`

### CLASSROOM
- **POST**   `{{baseURL}}/classroom/createClassroom`
- **GET**    `{{baseURL}}/classroom/listClassrooms`
- **GET**    `{{baseURL}}/classroom/getClassroom`
- **PUT**    `{{baseURL}}/classroom/updateClassroom`
- **DELETE** `{{baseURL}}/classroom/deleteClassroom`
- **PUT**    `{{baseURL}}/classroom/restoreClassroom`
- **GET**    `{{baseURL}}/classroom/listDeletedClassrooms`
- **DELETE** `{{baseURL}}/classroom/permanentlyDeleteClassroom`

### STUDENT
- **POST**   `{{baseURL}}/student/enrollStudent`
- **GET**    `{{baseURL}}/student/listStudents`
- **GET**    `{{baseURL}}/student/getStudent`
- **PUT**    `{{baseURL}}/student/updateStudent`
- **DELETE** `{{baseURL}}/student/withdrawnStudent`
- **PUT**    `{{baseURL}}/student/restoreStudent`
- **GET**    `{{baseURL}}/student/listWithdrawnStudents`
- **PUT**    `{{baseURL}}/student/transferStudent`

These 27 routes cover the complete set found in the collection.

Let me know if you want them grouped differently (e.g. without `{{baseURL}}`, or in OpenAPI path format, or as a table).