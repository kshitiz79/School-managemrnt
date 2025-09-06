import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AddHomework from './AddHomework'
import DailyAssignment from './DailyAssignment'

const HomeworkRoutes = () => {
  return (
    <Routes>
      <Route path="add" element={<AddHomework />} />
      <Route path="daily" element={<DailyAssignment />} />
    </Routes>
  )
}

export default HomeworkRoutes
