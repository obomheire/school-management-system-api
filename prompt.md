Here is the list of routes from the api that do not follow standard API best practices for HTTP methods (e.g., updates typically use PUT or PATCH, deletes use DELETE, but these are using POST for modifications or deletions). I've identified them based on the route names and purposes, suggesting the appropriate method while keeping the path the same:

- POST {{baseURL}}/school/updateSchool should be PUT {{baseURL}}/school/updateSchool
- POST {{baseURL}}/school/assignAdministrator should be PUT {{baseURL}}/school/assignAdministrator
- POST {{baseURL}}/school/deleteSchool should be DELETE {{baseURL}}/school/deleteSchool
- POST {{baseURL}}/school/restoreSchool should be PUT {{baseURL}}/school/restoreSchool
- POST {{baseURL}}/school/permanentlyDeleteSchool should be DELETE {{baseURL}}/school/permanentlyDeleteSchool
- POST {{baseURL}}/classroom/updateClassroom should be PUT {{baseURL}}/classroom/updateClassroom
- POST {{baseURL}}/classroom/deleteClassroom should be DELETE {{baseURL}}/classroom/deleteClassroom
- POST {{baseURL}}/classroom/restoreClassroom should be PUT {{baseURL}}/classroom/restoreClassroom
- POST {{baseURL}}/classroom/permanentlyDeleteClassroom should be DELETE {{baseURL}}/classroom/permanentlyDeleteClassroom
- POST {{baseURL}}/student/updateStudent should be PUT {{baseURL}}/student/updateStudent
- POST {{baseURL}}/student/withdrawnStudent should be DELETE {{baseURL}}/student/withdrawnStudent
- POST {{baseURL}}/student/restoreStudent should be PUT {{baseURL}}/student/restoreStudent
- POST {{baseURL}}/student/transferStudent should be PUT {{baseURL}}/student/transferStudent

Lets fix these routes to follow standard API best practices. Ensuere that the routes are properly named and that they are using the correct HTTP methods. Ensure that the changes do not break existing functionality.