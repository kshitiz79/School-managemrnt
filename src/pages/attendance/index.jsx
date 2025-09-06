import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentAttendance from './StudentAttendance'
import StaffAttendance from './StaffAttendance'
import AttendanceByDate from './AttendanceByDate'
import ApproveLeave from './ApproveLeave'
import QrAttendance from './QrAttendance'

const AttendanceRoutes = () => {
  return (
    <Routes>
      <Route path="student" element={<StudentAttendance />} />
      <Route path="staff" element={<StaffAttendance />} />
      <Route path="by-date" element={<AttendanceByDate />} />
      <Route path="approve-leave" element={<ApproveLeave />} />
      <Route path="qr" element={<QrAttendance />} />
    </Routes>
  )
}

export default AttendanceRoutes
