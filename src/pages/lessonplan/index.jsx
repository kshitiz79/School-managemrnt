import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Topic from './Topic'
import Lesson from './Lesson'
import ManageLessonPlan from './ManageLessonPlan'
import ManageSyllabusStatus from './ManageSyllabusStatus'
import CopyOldLessons from './CopyOldLessons'

const LessonPlanRoutes = () => {
  return (
    <Routes>
      <Route path="topics" element={<Topic />} />
      <Route path="lessons" element={<Lesson />} />
      <Route path="manage" element={<ManageLessonPlan />} />
      <Route path="syllabus-status" element={<ManageSyllabusStatus />} />
      <Route path="copy-old" element={<CopyOldLessons />} />
    </Routes>
  )
}

export default LessonPlanRoutes
