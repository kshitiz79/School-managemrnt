// Import all API modules
import { studentsApi } from './students'
import { staffApi } from './staff'
import { classesApi } from './classes'
import { sectionsApi } from './sections'
import { subjectsApi } from './subjects'
import { subjectGroupsApi } from './subjectGroups'
import { attendanceApi } from './attendance'
import { feesApi } from './fees'
import { noticesApi } from './notices'
import { examApi } from './exams'
import { classTeacherApi } from './classTeacher'
import { promotionApi } from './promotion'
import { timetableApi } from './timetable'
import { onlineAdmissionApi } from './onlineAdmission'
import { studentHousesApi } from './studentHouses'
import { studentCategoriesApi } from './studentCategories'
import { multiClassStudentApi } from './multiClassStudent'
import { auditLogApi } from './auditLog'
import { disabledStudentsApi } from './disabledStudents'
import { authApi } from './auth'
import { admissionEnquiryApi } from './admissionEnquiry'
import { visitorBookApi } from './visitorBook'
import { phoneCallLogApi } from './phoneCallLog'
import { postalDispatchApi } from './postalDispatch'
import { postalReceiveApi } from './postalReceive'
import { complainApi } from './complain'
import { financeApi } from './finance'
import { homeworkApi } from './homework'
import { lessonPlanApi } from './lessonPlan'
import { communicationApi } from './communication'

// Export individual APIs
export {
  studentsApi,
  staffApi,
  classesApi,
  sectionsApi,
  subjectsApi,
  subjectGroupsApi,
  attendanceApi,
  feesApi,
  noticesApi,
  examApi,
  classTeacherApi,
  promotionApi,
  timetableApi,
  onlineAdmissionApi,
  studentHousesApi,
  studentCategoriesApi,
  multiClassStudentApi,
  auditLogApi,
  disabledStudentsApi,
  authApi,
  admissionEnquiryApi,
  visitorBookApi,
  phoneCallLogApi,
  postalDispatchApi,
  postalReceiveApi,
  complainApi,
  financeApi,
  homeworkApi,
  lessonPlanApi,
  communicationApi,
}

// Combined API object
export const api = {
  students: studentsApi,
  staff: staffApi,
  classes: classesApi,
  sections: sectionsApi,
  subjects: subjectsApi,
  subjectGroups: subjectGroupsApi,
  attendance: attendanceApi,
  fees: feesApi,
  notices: noticesApi,
  exams: examApi,
  classTeacher: classTeacherApi,
  promotion: promotionApi,
  timetable: timetableApi,
  onlineAdmission: onlineAdmissionApi,
  studentHouses: studentHousesApi,
  studentCategories: studentCategoriesApi,
  multiClassStudent: multiClassStudentApi,
  auditLog: auditLogApi,
  disabledStudents: disabledStudentsApi,
  auth: authApi,
  admissionEnquiry: admissionEnquiryApi,
  visitorBook: visitorBookApi,
  phoneCallLog: phoneCallLogApi,
  postalDispatch: postalDispatchApi,
  postalReceive: postalReceiveApi,
  complain: complainApi,
  finance: financeApi,
  homework: homeworkApi,
  lessonPlan: lessonPlanApi,
  communication: communicationApi,
}

export default api
