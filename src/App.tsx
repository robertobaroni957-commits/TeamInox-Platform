import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Welcome from './pages/Welcome';
import Guest from './pages/Guest';
import Dashboard from './pages/Dashboard';
import Racing from './pages/Racing';
import Teams from './pages/Teams';
import Login from './pages/Login';
import Register from './pages/Register';
import Ranking from './pages/Ranking';
import Events from './pages/Events';
import ZRLOperations from './pages/admin/ZRLOperations';
import ZRLRoundManager from './pages/ZRLRoundManager';
import WinterTourManagement from './pages/WinterTourManagement';

import Availability from './pages/Availability';
import RosterBuilder from './pages/RosterBuilder';
import UserManagement from './pages/admin/UserManagement';
import EventManagement from './pages/admin/EventManagement';
import AvailabilityManagement from './pages/admin/AvailabilityManagement';
import RosterSuggestions from './pages/admin/RosterSuggestions';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page (Welcome Gate) */}
        <Route path="/" element={<Welcome />} />
        <Route path="/guest" element={<Guest />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/registrazione" element={<Navigate to="/register" replace />} />

        {/* Main Platform (Nested in Layout) */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'captain', 'moderator', 'admin', 'guest']}><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="racing" element={<Racing />} />
          <Route path="ranking" element={<Ranking />} />
          <Route path="events" element={<Events />} />
          <Route path="zrl-operations" element={
            <ProtectedRoute allowedRoles={['captain', 'moderator', 'admin']}>
              <ZRLOperations />
            </ProtectedRoute>
          } />
          <Route path="zrl-round-manager" element={
            <ProtectedRoute allowedRoles={['moderator', 'admin']}>
              <ZRLRoundManager />
            </ProtectedRoute>
          } />
          <Route path="winter-tour-management" element={
            <ProtectedRoute allowedRoles={['moderator', 'admin']}>
              <WinterTourManagement />
            </ProtectedRoute>
          } />
          
          {/* Routes restricted from Guests */}
          <Route path="teams" element={
            <ProtectedRoute allowedRoles={['user', 'captain', 'moderator', 'admin']}>
              <Teams />
            </ProtectedRoute>
          } />
          <Route path="availability" element={
            <ProtectedRoute allowedRoles={['user', 'captain', 'moderator', 'admin']}>
              <Availability />
            </ProtectedRoute>
          } />
          
          {/* Roles specifically for staff/captains */}
          <Route path="roster" element={
            <ProtectedRoute allowedRoles={['captain', 'moderator', 'admin']}>
              <RosterBuilder />
            </ProtectedRoute>
          } />
          
          {/* Admin/Moderator Routes */}
          <Route path="admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/events" element={
            <ProtectedRoute allowedRoles={['admin', 'moderator']}>
              <EventManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/availability" element={
            <ProtectedRoute allowedRoles={['admin', 'moderator']}>
              <AvailabilityManagement />
            </ProtectedRoute>
          } />
          <Route path="admin/optimizer" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RosterSuggestions />
            </ProtectedRoute>
          } />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
