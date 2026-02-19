# Backend Developer Technical Challenge

## School Management System API

Dear Candidate,

As part of our evaluation process, we invite you to participate in a technical challenge designed to assess your backend development capabilities. This challenge will help us better understand your approach to system design, code organization, and problem-solving skills.

---

## 📌 Challenge Overview

You are tasked with developing a **School Management System API** using this standard project template (This code base)

> ⚠️ Important:
Please maintain the existing architectural patterns and structure of the template (This code base).

---

## 🏗️ Core Requirements

### System Architecture

* Develop a **RESTful API service** using **JavaScript**
* Implement **Role-Based Access Control (RBAC)**
* Use **MongoDB** for data persistence
* Use ****Redis**** for caching
* Follow the **existing project template structure**

---

## 🧩 Key Entities

### 1. Schools

* Managed by **Superadmins**
* Complete **CRUD operations**
* School profile management

### 2. Classrooms

* Managed by **School Administrators**
* Associated with specific schools
* Capacity and resource management

### 3. Students

* Managed by **School Administrators**
* Enrollment and transfer capabilities
* Student profile management

---

## ⚙️ Technical Requirements

* Implement **comprehensive input validation**
* Include **error handling** and appropriate **HTTP status codes**
* Design and implement proper **database schemas**
* Create **authentication and authorization middleware**
* Follow **RESTful API best practices**
* Include **API rate limiting** and **security measures**

---

## 🔐 Authentication & Authorization

* Implement **JWT-based authentication**
* Role-based permissions:

  * **Superadmin**: Full system access
  * **School Administrator**:

    * School-specific access
    * Limited to their assigned school's resources

---

## 📦 Deliverables

### Required Components

1. Fully functional API implementation
2. Comprehensive API documentation
3. Database schema design
4. Test cases and results
5. Deployment instructions

---

## 📚 Documentation

Your documentation should include:

* API endpoint specifications
* Request/response formats
* Authentication flow
* Error codes and handling
* Database schema diagram

---

## 🧪 Evaluation Criteria

* Code quality and organization
* Security implementation
* API design and documentation
* Database design
* Error handling
* Testing coverage
* Performance considerations

---

## 🚀 Submission Guidelines

1. Host the application on a **public hosting service**
2. Upload code to a **public repository**
3. Include **setup instructions** in `README.md`
4. Complete the submission form with:

   * Repository URL
   * Deployed application URL
   * Any additional notes or considerations

---

## 📝 Notes

* Feel free to make architectural decisions while maintaining the template structure
* Include any assumptions made during development in your documentation
* Consider **scalability and maintainability** in your implementation

---
## ✅ Environment variable
* REDIS_URI: redis://default:fSQGNDQ8ckVrpJob2WRPhxrnB6aNNqjp@redis-16923.c8.us-east-1-4.ec2.redns.redis-cloud.com:16923
* MONGO_URI: mongodb+srv://obomheire:Secret%40123@cluster0.ztwoi.mongodb.net/school-management-db?retryWrites=true&w=majority
* Create other environment variables based on the project scope and needs


