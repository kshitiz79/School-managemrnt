import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ClassTimetable from './ClassTimetable'
import TeachersTimetable from './TeachersTimetable'

const TimetableRoutes = () => {
  return (
    <Routes>
      <Route path="class" element={<ClassTimetable />} />
      <Route path="teachers" element={<TeachersTimetable />} />
    </Routes>
  )
}

export default TimetableRoutes
