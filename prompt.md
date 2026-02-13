In the students collection, there is a confution between the studentId (SE-2024-104) and the mongodb object id for student. Both are been refered to as studenId. For example, in the {{baseURL}}/student/updateStudent?schoolId=698f8d58ab9aaf20f460cac0&studentId=698fa0b2d3571f6ceff0cb24, I got the error below:

Update student error: CastError: Cast to ObjectId failed for value "SE-2024-104" (type string) at path "_id" for model "Student"
    at ObjectId.cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schema/objectid.js:250:11)
    at SchemaType.applySetters (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schematype.js:1219:12)
    at SchemaType.castForQuery (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schematype.js:1633:15)
    at cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/cast.js:389:32)
    at Query.cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:4927:12)
    at Query._castConditions (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:2237:10)
    at model.Query._findOne (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:2533:8)
    at model.Query.exec (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:4447:28)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async StudentManager.updateStudent (/Users/zackoverflow/Documents/Personal/school-management-system-api/managers/entities/student/Student.manager.js:207:29) {
  stringValue: '"SE-2024-104"',
  messageFormat: undefined,
  kind: 'ObjectId',
  value: 'SE-2024-104',
  path: '_id',
  reason: BSONError: Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer
      at new ObjectId (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/bson/lib/bson.cjs:2055:23)
      at castObjectId (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/cast/objectid.js:25:12)
      at ObjectId.cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schema/objectid.js:248:12)
      at SchemaType.applySetters (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schematype.js:1219:12)
      at SchemaType.castForQuery (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/schematype.js:1633:15)
      at cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/cast.js:389:32)
      at Query.cast (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:4927:12)
      at Query._castConditions (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:2237:10)
      at model.Query._findOne (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:2533:8)
      at model.Query.exec (/Users/zackoverflow/Documents/Personal/school-management-system-api/node_modules/mongoose/lib/query.js:4447:28),
  valueType: 'string',
  model: Model { Student }
}
