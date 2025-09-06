import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Term from './Term'
import Observation from './Observation'
import ObservationParameter from './ObservationParameter'
import AssignObservation from './AssignObservation'
import DisableReason from './DisableReason'
import Template from './Template'
import Reports from './Reports'

const TermRoutes = () => {
  return (
    <Routes>
      <Route path="manage" element={<Term />} />
      <Route path="observation" element={<Observation />} />
      <Route path="observation-parameter" element={<ObservationParameter />} />
      <Route path="assign-observation" element={<AssignObservation />} />
      <Route path="disable-reason" element={<DisableReason />} />
      <Route path="template" element={<Template />} />
      <Route path="reports" element={<Reports />} />
    </Routes>
  )
}

export default TermRoutes
