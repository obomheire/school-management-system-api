#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:5111/api}"
STAMP="$(date +%s)"
OUT="/tmp/api_qa_retest_failed_blocked_${STAMP}.log"

case_log() {
  local name="$1"
  local method="$2"
  local url="$3"
  local token="${4:-}"
  local body="${5:-}"
  local resp
  local curl_exit=0

  set +e
  if [[ -n "$token" && -n "$body" ]]; then
    resp="$(curl -s --max-time 20 -X "$method" "$url" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$body" -w $'\nHTTP_STATUS:%{http_code}')"
    curl_exit=$?
  elif [[ -n "$token" ]]; then
    resp="$(curl -s --max-time 20 -X "$method" "$url" -H "Authorization: Bearer $token" -w $'\nHTTP_STATUS:%{http_code}')"
    curl_exit=$?
  elif [[ -n "$body" ]]; then
    resp="$(curl -s --max-time 20 -X "$method" "$url" -H "Content-Type: application/json" -d "$body" -w $'\nHTTP_STATUS:%{http_code}')"
    curl_exit=$?
  else
    resp="$(curl -s --max-time 20 -X "$method" "$url" -w $'\nHTTP_STATUS:%{http_code}')"
    curl_exit=$?
  fi
  set -e

  if [[ $curl_exit -ne 0 ]]; then
    {
      echo "=== ${name} ==="
      echo "HTTP CURL_ERROR_${curl_exit}"
      echo "{\"ok\":false,\"errors\":[\"curl failed\"],\"message\":\"request timeout or connection failure\"}"
      echo
    } >> "$OUT"
    return 0
  fi

  local code
  code="$(printf '%s\n' "$resp" | sed -n 's/^HTTP_STATUS://p')"
  local payload
  payload="$(printf '%s\n' "$resp" | sed '/^HTTP_STATUS:/d')"

  {
    echo "=== ${name} ==="
    echo "HTTP ${code}"
    echo "${payload}"
    echo
  } >> "$OUT"
}

json_get() {
  local section="$1"
  local expr="$2"
  awk -v s="$section" '
    $0=="=== " s " ===" {on=1; next}
    /^=== / && on {on=0}
    on {print}
  ' "$OUT" | sed '/^HTTP /d' | node -e "const fs=require('fs');const t=fs.readFileSync(0,'utf8').trim();if(!t)process.exit(0);const j=JSON.parse(t);const v=(function(){return ${expr};})();if(v!==undefined&&v!==null)process.stdout.write(String(v));"
}

case_log "Login Superadmin" POST "$BASE_URL/auth/login" "" '{"email":"superadmin1@school-system.com","password":"Superadmin1@123"}'
SA_LONG="$(json_get "Login Superadmin" "j.data && j.data.longToken")"
case_log "Create Superadmin Short Token" POST "$BASE_URL/token/v1_createShortToken" "$SA_LONG"
SA_SHORT="$(json_get "Create Superadmin Short Token" "j.data && j.data.shortToken")"

ADMIN_EMAIL="retest_admin_${STAMP}@example.com"
ADMIN_USERNAME="rtadm${STAMP: -8}"
case_log "Register SchoolAdmin (no assignedSchool)" POST "$BASE_URL/auth/register" "" "{\"username\":\"${ADMIN_USERNAME}\",\"email\":\"${ADMIN_EMAIL}\",\"password\":\"Test@123\",\"role\":\"school_admin\"}"
ADMIN_ID="$(json_get "Register SchoolAdmin (no assignedSchool)" "j.data && j.data.user && j.data.user._id")"

case_log "Login New SchoolAdmin" POST "$BASE_URL/auth/login" "" "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"Test@123\"}"
ADMIN_LONG="$(json_get "Login New SchoolAdmin" "j.data && j.data.longToken")"
case_log "Create SchoolAdmin Short Token" POST "$BASE_URL/token/v1_createShortToken" "$ADMIN_LONG"
ADMIN_SHORT="$(json_get "Create SchoolAdmin Short Token" "j.data && j.data.shortToken")"

case_log "Create School A" POST "$BASE_URL/school/createSchool" "$SA_SHORT" "{\"name\":\"RetestSchoolA${STAMP}\",\"address\":{\"street\":\"1 Main St\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"73301\",\"country\":\"USA\"},\"contactInfo\":{\"phone\":\"+1-555-101-1010\",\"email\":\"retest-a-${STAMP}@school.test\",\"website\":\"https://retest-a.test\"}}"
SCHOOL_A="$(json_get "Create School A" "j.data && j.data.school && j.data.school._id")"
case_log "Create School B" POST "$BASE_URL/school/createSchool" "$SA_SHORT" "{\"name\":\"RetestSchoolB${STAMP}\",\"address\":{\"street\":\"2 Main St\",\"city\":\"Dallas\",\"state\":\"TX\",\"zipCode\":\"75001\",\"country\":\"USA\"},\"contactInfo\":{\"phone\":\"+1-555-202-2020\",\"email\":\"retest-b-${STAMP}@school.test\",\"website\":\"https://retest-b.test\"}}"
SCHOOL_B="$(json_get "Create School B" "j.data && j.data.school && j.data.school._id")"

# Previously failed route
case_log "Assign Administrator to School A (retest failed route)" PUT "$BASE_URL/school/assignAdministrator?schoolId=${SCHOOL_A}&adminId=${ADMIN_ID}" "$SA_SHORT"
case_log "Assign Administrator to School B (retest failed route)" PUT "$BASE_URL/school/assignAdministrator?schoolId=${SCHOOL_B}&adminId=${ADMIN_ID}" "$SA_SHORT"

# Previously blocked classroom routes
case_log "Create Classroom A1 (retest blocked route)" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_A}" "$ADMIN_SHORT" '{"name":"Retest Class A1","roomNumber":"RT-101","gradeLevel":"7th Grade","capacity":30,"resources":["Projector"]}'
CLASS_A1="$(json_get "Create Classroom A1 (retest blocked route)" "j.data && j.data.classroom && j.data.classroom._id")"
case_log "List Classrooms A (retest blocked route)" GET "$BASE_URL/classroom/listClassrooms?schoolId=${SCHOOL_A}&page=1&limit=10" "$ADMIN_SHORT"
case_log "Get Classroom A1 (retest blocked route)" GET "$BASE_URL/classroom/getClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_A1}" "$ADMIN_SHORT"
case_log "Update Classroom A1 (retest blocked route)" PUT "$BASE_URL/classroom/updateClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_A1}" "$ADMIN_SHORT" '{"name":"Retest Class A1 Updated","capacity":35,"resources":["Projector","Lab"]}'
case_log "Create Classroom B1 (retest blocked route)" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_B}" "$ADMIN_SHORT" '{"name":"Retest Class B1","roomNumber":"RT-201","gradeLevel":"8th Grade","capacity":30,"resources":["Lab"]}'
CLASS_B1="$(json_get "Create Classroom B1 (retest blocked route)" "j.data && j.data.classroom && j.data.classroom._id")"

# Previously failed + blocked student routes
STUDENT_CODE="RT-STU-${STAMP}"
case_log "Enroll Student A1 (retest failed route)" POST "$BASE_URL/student/enrollStudent?schoolId=${SCHOOL_A}" "$ADMIN_SHORT" "{\"firstName\":\"Retest\",\"lastName\":\"Student\",\"dateOfBirth\":\"2012-05-10\",\"studentId\":\"${STUDENT_CODE}\",\"classroomId\":\"${CLASS_A1}\",\"guardianInfo\":{\"guardianName\":\"Parent Retest\",\"relationship\":\"Mother\",\"phone\":\"+1-555-303-3030\",\"email\":\"retest-parent-${STAMP}@mail.test\",\"address\":{\"street\":\"10 Parent St\",\"city\":\"Austin\",\"state\":\"TX\",\"zipCode\":\"73301\"}}}"
STUDENT_ID="$(json_get "Enroll Student A1 (retest failed route)" "j.data && j.data.student && j.data.student._id")"
case_log "List Students A (retest blocked route)" GET "$BASE_URL/student/listStudents?schoolId=${SCHOOL_A}&page=1&limit=10" "$ADMIN_SHORT"
case_log "Get Student A (retest blocked route)" GET "$BASE_URL/student/getStudent?schoolId=${SCHOOL_A}&studentId=${STUDENT_ID}" "$ADMIN_SHORT"
case_log "Update Student A (retest blocked route)" PUT "$BASE_URL/student/updateStudent?schoolId=${SCHOOL_A}&studentId=${STUDENT_ID}" "$ADMIN_SHORT" '{"firstName":"RetestUpdated"}'
case_log "Transfer Student A->B (retest blocked route)" PUT "$BASE_URL/student/transferStudent?schoolId=${SCHOOL_A}&studentId=${STUDENT_ID}" "$ADMIN_SHORT" "{\"targetSchoolId\":\"${SCHOOL_B}\",\"targetClassroomId\":\"${CLASS_B1}\",\"reason\":\"Retest transfer\"}"
case_log "Withdraw Student B (retest blocked route)" DELETE "$BASE_URL/student/withdrawnStudent?schoolId=${SCHOOL_B}&studentId=${STUDENT_ID}" "$ADMIN_SHORT"
case_log "List Withdrawn Students B (retest blocked route)" GET "$BASE_URL/student/listWithdrawnStudents?schoolId=${SCHOOL_B}&page=1&limit=10" "$ADMIN_SHORT"
case_log "Get Withdrawn Student B (retest blocked route)" GET "$BASE_URL/student/getWithdrawnStudent?schoolId=${SCHOOL_B}&studentId=${STUDENT_ID}" "$ADMIN_SHORT"
case_log "Restore Student B (retest blocked route)" PUT "$BASE_URL/student/restoreStudent?schoolId=${SCHOOL_B}&studentId=${STUDENT_ID}" "$ADMIN_SHORT"

# Remaining blocked classroom lifecycle routes
case_log "Delete Classroom A1 (retest blocked route)" DELETE "$BASE_URL/classroom/deleteClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_A1}" "$ADMIN_SHORT"
case_log "List Deleted Classrooms A (retest blocked route)" GET "$BASE_URL/classroom/listDeletedClassrooms?schoolId=${SCHOOL_A}&page=1&limit=10" "$ADMIN_SHORT"
case_log "Restore Classroom A1 (retest blocked route)" PUT "$BASE_URL/classroom/restoreClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_A1}" "$ADMIN_SHORT"
case_log "Create Classroom Temp (retest blocked route)" POST "$BASE_URL/classroom/createClassroom?schoolId=${SCHOOL_A}" "$ADMIN_SHORT" '{"name":"Retest Temp Class","roomNumber":"RT-TMP-1","gradeLevel":"6th Grade","capacity":20}'
CLASS_TMP="$(json_get "Create Classroom Temp (retest blocked route)" "j.data && j.data.classroom && j.data.classroom._id")"
case_log "Delete Classroom Temp (retest blocked route)" DELETE "$BASE_URL/classroom/deleteClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_TMP}" "$ADMIN_SHORT"
case_log "Permanently Delete Classroom Temp (retest blocked route)" DELETE "$BASE_URL/classroom/permanentlyDeleteClassroom?schoolId=${SCHOOL_A}&classroomId=${CLASS_TMP}" "$ADMIN_SHORT"

echo "$OUT"
