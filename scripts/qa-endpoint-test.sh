#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:5111/api}"
STAMP="$(date +%s)"
REPORT_FILE="/tmp/api_qa_report_${STAMP}.log"

run_case() {
  local name="$1"
  local method="$2"
  local url="$3"
  local token="${4:-}"
  local body="${5:-}"

  local response
  if [[ -n "$token" && -n "$body" ]]; then
    response="$(curl -s -X "$method" "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$body" -w $'\nHTTP_STATUS:%{http_code}')"
  elif [[ -n "$token" ]]; then
    response="$(curl -s -X "$method" "$url" -H "Authorization: Bearer $token" -w $'\nHTTP_STATUS:%{http_code}')"
  elif [[ -n "$body" ]]; then
    response="$(curl -s -X "$method" "$url" -H "Content-Type: application/json" -d "$body" -w $'\nHTTP_STATUS:%{http_code}')"
  else
    response="$(curl -s -X "$method" "$url" -w $'\nHTTP_STATUS:%{http_code}')"
  fi

  local code
  code="$(printf '%s\n' "$response" | sed -n 's/^HTTP_STATUS://p')"
  local payload
  payload="$(printf '%s\n' "$response" | sed '/^HTTP_STATUS:/d')"

  {
    echo "=== ${name} ==="
    echo "HTTP ${code}"
    echo "${payload}"
    echo
  } >> "$REPORT_FILE"
}

extract_json() {
  local section="$1"
  local expr="$2"
  awk -v s="$section" '
    $0=="=== " s " ===" {on=1; next}
    /^=== / && on {on=0}
    on {print}
  ' "$REPORT_FILE" | sed '/^HTTP /d' | node -e "const fs=require('fs'); const t=fs.readFileSync(0,'utf8').trim(); if(!t){process.exit(0)}; const j=JSON.parse(t); const v=(function(){ return ${expr}; })(); if(v!==undefined && v!==null) process.stdout.write(String(v));"
}

run_case "Health Check" GET "$BASE_URL"

run_case "Auth Login Superadmin" POST "$BASE_URL/auth/login" "" '{"email":"superadmin1@school-system.com","password":"Superadmin1@123"}'
SA_LONG="$(extract_json "Auth Login Superadmin" "j.data && j.data.longToken")"
run_case "Token Create Short Superadmin" POST "$BASE_URL/token/v1_createShortToken" "$SA_LONG"
SA_SHORT="$(extract_json "Token Create Short Superadmin" "j.data && j.data.shortToken")"

QA_ADMIN_EMAIL="qa_admin_${STAMP}@example.com"
QA_ADMIN_USERNAME="qa_admin_${STAMP}"
run_case "Auth Register SchoolAdmin Without AssignedSchool" POST "$BASE_URL/auth/register" "" "{\"username\":\"${QA_ADMIN_USERNAME}\",\"email\":\"${QA_ADMIN_EMAIL}\",\"password\":\"Test@123\",\"role\":\"school_admin\"}"
QA_ADMIN_ID="$(extract_json "Auth Register SchoolAdmin Without AssignedSchool" "j.data && j.data.user && j.data.user._id")"
run_case "Auth Login New SchoolAdmin" POST "$BASE_URL/auth/login" "" "{\"email\":\"${QA_ADMIN_EMAIL}\",\"password\":\"Test@123\"}"
QA_LONG="$(extract_json "Auth Login New SchoolAdmin" "j.data && j.data.longToken")"
run_case "Token Create Short SchoolAdmin" POST "$BASE_URL/token/v1_createShortToken" "$QA_LONG"
QA_SHORT="$(extract_json "Token Create Short SchoolAdmin" "j.data && j.data.shortToken")"

run_case "Auth GetProfile Unauthorized" GET "$BASE_URL/auth/getProfile"
run_case "Auth GetProfile Authorized" GET "$BASE_URL/auth/getProfile" "$SA_SHORT"
run_case "School List as SchoolAdmin (expect denied)" GET "$BASE_URL/school/listSchools?page=1&limit=5" "$QA_SHORT"

run_case "School Create A" POST "$BASE_URL/school/createSchool" "$SA_SHORT" "{\"name\":\"QASchoolA${STAMP}\",\"address\":{\"street\":\"1 Main St\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"73301\",\"country\":\"USA\"},\"contactInfo\":{\"phone\":\"+1-555-111-2222\",\"email\":\"qa-a-${STAMP}@school.test\",\"website\":\"https://qa-a.test\"}}"
SCHOOL_A_ID="$(extract_json "School Create A" "j.data && j.data.school && j.data.school._id")"
run_case "School Create B" POST "$BASE_URL/school/createSchool" "$SA_SHORT" "{\"name\":\"QASchoolB${STAMP}\",\"address\":{\"street\":\"2 Main St\",\"city\":\"Dallas\",\"state\":\"TX\",\"zipCode\":\"75001\",\"country\":\"USA\"},\"contactInfo\":{\"phone\":\"+1-555-333-4444\",\"email\":\"qa-b-${STAMP}@school.test\",\"website\":\"https://qa-b.test\"}}"
SCHOOL_B_ID="$(extract_json "School Create B" "j.data && j.data.school && j.data.school._id")"

run_case "School Assign Admin A" PUT "$BASE_URL/school/assignAdministrator?schoolId=${SCHOOL_A_ID}&adminId=${QA_ADMIN_ID}" "$SA_SHORT"
run_case "School Assign Admin B" PUT "$BASE_URL/school/assignAdministrator?schoolId=${SCHOOL_B_ID}&adminId=${QA_ADMIN_ID}" "$SA_SHORT"
run_case "School List Superadmin" GET "$BASE_URL/school/listSchools?page=1&limit=5" "$SA_SHORT"
run_case "School Get A" GET "$BASE_URL/school/getSchool?schoolId=${SCHOOL_A_ID}" "$SA_SHORT"
run_case "School Update A" PUT "$BASE_URL/school/updateSchool?schoolId=${SCHOOL_A_ID}" "$SA_SHORT" "{\"name\":\"QASchoolAUpdated${STAMP}\"}"
run_case "School Delete B (soft)" DELETE "$BASE_URL/school/deleteSchool?schoolId=${SCHOOL_B_ID}" "$SA_SHORT"
run_case "School List Deleted" GET "$BASE_URL/school/listDeletedSchools?page=1&limit=5" "$SA_SHORT"
run_case "School Restore B" PUT "$BASE_URL/school/restoreSchool?schoolId=${SCHOOL_B_ID}" "$SA_SHORT"
run_case "School Permanent Delete Active B (expect error)" DELETE "$BASE_URL/school/permanentlyDeleteSchool?schoolId=${SCHOOL_B_ID}" "$SA_SHORT"

run_case "Classroom Create A1" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_A_ID}" "$QA_SHORT" '{"name":"QA Class 1","roomNumber":"C-101","gradeLevel":"8th Grade","capacity":30,"resources":["Projector","Whiteboard"]}'
CLASS_A1_ID="$(extract_json "Classroom Create A1" "j.data && j.data.classroom && j.data.classroom._id")"
run_case "Classroom List A" GET "$BASE_URL/classroom/listClassrooms?schoolId=${SCHOOL_A_ID}&page=1&limit=10" "$QA_SHORT"
run_case "Classroom Get A1" GET "$BASE_URL/classroom/getClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_A1_ID}" "$QA_SHORT"
run_case "Classroom Update A1" PUT "$BASE_URL/classroom/updateClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_A1_ID}" "$QA_SHORT" '{"name":"QA Class 1 Updated","capacity":35,"resources":["Projector"]}'

run_case "Classroom Create B1" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_B_ID}" "$QA_SHORT" '{"name":"QA Class B1","roomNumber":"B-201","gradeLevel":"8th Grade","capacity":30,"resources":["Lab"]}'
CLASS_B1_ID="$(extract_json "Classroom Create B1" "j.data && j.data.classroom && j.data.classroom._id")"

run_case "Student Enroll A1" POST "$BASE_URL/student/enrollStudent?schoolId=${SCHOOL_A_ID}" "$QA_SHORT" "{\"firstName\":\"QA\",\"lastName\":\"Student\",\"dateOfBirth\":\"2012-05-10\",\"studentId\":\"QA-STU-${STAMP}\",\"classroomId\":\"${CLASS_A1_ID}\",\"guardianInfo\":{\"guardianName\":\"Parent QA\",\"relationship\":\"Mother\",\"phone\":\"+1-555-777-8888\",\"email\":\"parent-${STAMP}@mail.test\",\"address\":{\"street\":\"10 Parent St\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"73301\"}}}"
STUDENT_ID="$(extract_json "Student Enroll A1" "j.data && j.data.student && j.data.student._id")"

run_case "Student List Active" GET "$BASE_URL/student/listStudents?schoolId=${SCHOOL_A_ID}&page=1&limit=10" "$QA_SHORT"
run_case "Student Get" GET "$BASE_URL/student/getStudent?schoolId=${SCHOOL_A_ID}&studentId=${STUDENT_ID}" "$QA_SHORT"
run_case "Student Update" PUT "$BASE_URL/student/updateStudent?schoolId=${SCHOOL_A_ID}&studentId=${STUDENT_ID}" "$QA_SHORT" '{"firstName":"QAUpdated"}'
run_case "Student Transfer A->B" PUT "$BASE_URL/student/transferStudent?schoolId=${SCHOOL_A_ID}&studentId=${STUDENT_ID}" "$QA_SHORT" "{\"targetSchoolId\":\"${SCHOOL_B_ID}\",\"targetClassroomId\":\"${CLASS_B1_ID}\",\"reason\":\"QA transfer\"}"
run_case "Student Withdrawn (in B)" DELETE "$BASE_URL/student/withdrawnStudent?schoolId=${SCHOOL_B_ID}&studentId=${STUDENT_ID}" "$QA_SHORT"
run_case "Student List Withdrawn" GET "$BASE_URL/student/listWithdrawnStudents?schoolId=${SCHOOL_B_ID}&page=1&limit=10" "$QA_SHORT"
run_case "Student Get Withdrawn" GET "$BASE_URL/student/getWithdrawnStudent?schoolId=${SCHOOL_B_ID}&studentId=${STUDENT_ID}" "$QA_SHORT"
run_case "Student Restore" PUT "$BASE_URL/student/restoreStudent?schoolId=${SCHOOL_B_ID}&studentId=${STUDENT_ID}" "$QA_SHORT"

run_case "Classroom Delete A1" DELETE "$BASE_URL/classroom/deleteClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_A1_ID}" "$QA_SHORT"
run_case "Classroom List Deleted A" GET "$BASE_URL/classroom/listDeletedClassrooms?schoolId=${SCHOOL_A_ID}&page=1&limit=10" "$QA_SHORT"
run_case "Classroom Restore A1" PUT "$BASE_URL/classroom/restoreClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_A1_ID}" "$QA_SHORT"
run_case "Classroom Create Temp" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_A_ID}" "$QA_SHORT" '{"name":"QA Temp Class","roomNumber":"TMP-1","gradeLevel":"7th Grade","capacity":20}'
CLASS_TMP_ID="$(extract_json "Classroom Create Temp" "j.data && j.data.classroom && j.data.classroom._id")"
run_case "Classroom Delete Temp" DELETE "$BASE_URL/classroom/deleteClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_TMP_ID}" "$QA_SHORT"
run_case "Classroom Permanently Delete Temp" DELETE "$BASE_URL/classroom/permanentlyDeleteClassroom?schoolId=${SCHOOL_A_ID}&classroomId=${CLASS_TMP_ID}" "$QA_SHORT"

echo "$REPORT_FILE"
