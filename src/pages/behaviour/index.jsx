import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Incidents from './Incidents'
import AssignIncident from './AssignIncident'
import Reports from './Reports'
import Settings from './Settings'

const BehaviourRoutes = () => {
  return (
    <Routes>
      <Route path="incidents" element={<Incidents />} />
      <Route path="assign-incident" element={<AssignIncident />} />
      <Route path="reports" element={<Reports />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  )
}

export default BehaviourRoutes
