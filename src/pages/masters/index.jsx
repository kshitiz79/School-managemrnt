import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Classes from './Classes'
import Sections from './Sections'
import Subjects from './Subjects'
import SubjectGroups from './SubjectGroups'
import AssignClassTeacher from './AssignClassTeacher'
import PromoteStudents from './PromoteStudents'

const MastersRoutes = () => {
  return (
    <Routes>
      <Route path="classes" element={<Classes />} />
      <Route path="sections" element={<Sections />} />
      <Route path="subjects" element={<Subjects />} />
      <Route path="subject-groups" element={<SubjectGroups />} />
      <Route path="assign-class-teacher" element={<AssignClassTeacher />} />
      <Route path="promote-students" element={<PromoteStudents />} />
    </Routes>
  )
}

export default MastersRoutes
