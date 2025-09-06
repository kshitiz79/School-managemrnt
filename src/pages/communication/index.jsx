import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NoticeBoard from './NoticeBoard'
import SendMessage from './SendMessage'
import TemplateWA from './TemplateWA'
import TemplateSMS from './TemplateSMS'
import TemplateEmail from './TemplateEmail'
import Log from './Log'
import ScheduleLog from './ScheduleLog'
import SendLoginCredentials from './SendLoginCredentials'

const CommunicationRoutes = () => {
  return (
    <Routes>
      <Route path="notice-board" element={<NoticeBoard />} />
      <Route path="send-message" element={<SendMessage />} />
      <Route path="template-whatsapp" element={<TemplateWA />} />
      <Route path="template-sms" element={<TemplateSMS />} />
      <Route path="template-email" element={<TemplateEmail />} />
      <Route path="log" element={<Log />} />
      <Route path="schedule-log" element={<ScheduleLog />} />
      <Route path="send-credentials" element={<SendLoginCredentials />} />
    </Routes>
  )
}

export default CommunicationRoutes
