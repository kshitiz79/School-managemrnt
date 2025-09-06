import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentAdmission from './StudentAdmission'
import OnlineAdmission from './OnlineAdmission'
import StudentDetails from './StudentDetails'
import StudentProfileUpdate from './StudentProfileUpdate'
import StudentCategories from './StudentCategories'
import StudentHouse from './StudentHouse'
import DisabledStudents from './DisabledStudents'
import MultiClassStudent from './MultiClassStudent'
import BulkDelete from './BulkDelete'

const StudentsRoutes = () => {
  return (
    <Routes>
      <Route path="admission" element={<StudentAdmission />} />
      <Route path="online-admission" element={<OnlineAdmission />} />
      <Route path="details" element={<StudentDetails />} />
      <Route path="profile-update" element={<StudentProfileUpdate />} />
      <Route path="categories" element={<StudentCategories />} />
      <Route path="houses" element={<StudentHouse />} />
      <Route path="disabled" element={<DisabledStudents />} />
      <Route path="multi-class" element={<MultiClassStudent />} />
      <Route path="bulk-delete" element={<BulkDelete />} />
    </Routes>
  )
}

export default StudentsRoutes
