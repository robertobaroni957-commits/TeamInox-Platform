import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import Racing from './pages/Racing';
import Teams from './pages/Teams';
import Login from './pages/Login';
import Register from './pages/Register';
import Ranking from './pages/Ranking';
import Events from './pages/Events';

import Availability from './pages/Availability';
import RosterBuilder from './pages/RosterBuilder';
import UserManagement from './pages/admin/UserManagement';
import EventManagement from './pages/admin/EventManagement';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Welcome) */}
        <Route path="/" element={<Welcome />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registrazione" element={<Navigate to="/register" replace />} />

        {/* Main Platform (Nested in Layout) */}
        {/* The MainLayout itself is protected, meaning a user must be logged in to see it */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Publicly accessible within layout (if logged in) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="racing" element={<Racing />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="events" element={<Events />} />
          <Route path="teams" element={<Teams />} />
          <Route path="availability" element={<Availability />} />
          
          {/* Routes protected by role */}
          <Route path="roster" element={
            <ProtectedRoute allowedRoles={['captain', 'admin']}>
              <RosterBuilder />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/events" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EventManagement />
            </ProtectedRoute>
          } />

          {/* Fallback route for any unmatched paths within the layout */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
