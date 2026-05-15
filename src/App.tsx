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
import ZRLDivisionResults from './pages/ZRLDivisionResults';
import ZRLAnalytics from './pages/ZRLAnalytics';
import ZRLSeasonStats from './pages/ZRLSeasonStats';
import StravaCallback from './pages/StravaCallback';
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
        <Route element={<ProtectedRoute allowedRoles={['user', 'athlete', 'captain', 'moderator', 'admin', 'guest']}><MainLayout /></ProtectedRoute>}>
          
          {/* Unified Dashboard - Single Entry Point */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Navigate to="/dashboard" replace />} />
          
          {/* Operational Modules */}
          <Route path="racing" element={
            <ProtectedRoute permission="racing.view">
              <Racing />
            </ProtectedRoute>
          } />
          
          <Route path="ranking" element={
            <ProtectedRoute permission="wt.view">
              <Ranking />
            </ProtectedRoute>
          } />
          
          <Route path="events" element={
            <ProtectedRoute permission="events.view">
              <Events />
            </ProtectedRoute>
          } />

          {/* ZRL Modules */}
          <Route path="availability" element={
            <ProtectedRoute permission="questionnaire.view">
              <Availability />
            </ProtectedRoute>
          } />
          
          <Route path="teams" element={
            <ProtectedRoute permission="teams.view">
              <Teams />
            </ProtectedRoute>
          } />

          <Route path="zrl-results" element={
            <ProtectedRoute permission="zrl.results">
              <ZRLDivisionResults />
            </ProtectedRoute>
          } />
          
          <Route path="zrl-analytics" element={
            <ProtectedRoute permission="analytics.view">
              <ZRLAnalytics />
            </ProtectedRoute>
          } />
          
          <Route path="zrl-season-stats" element={
            <ProtectedRoute permission="analytics.view">
              <ZRLSeasonStats />
            </ProtectedRoute>
          } />

          {/* Captain/Staff Tools */}
          <Route path="zrl-operations" element={
            <ProtectedRoute permission="zrl.lineup">
              <ZRLOperations />
            </ProtectedRoute>
          } />
          
          <Route path="roster" element={
            <ProtectedRoute permission="teams.manage">
              <RosterBuilder />
            </ProtectedRoute>
          } />

          {/* Moderator/Admin Tools */}
          <Route path="zrl-round-manager" element={
            <ProtectedRoute permission="zrl.manage">
              <ZRLRoundManager />
            </ProtectedRoute>
          } />
          
          <Route path="winter-tour-management" element={
            <ProtectedRoute permission="wt.manage">
              <WinterTourManagement />
            </ProtectedRoute>
          } />

          {/* Admin System Routes */}
          <Route path="admin/users" element={
            <ProtectedRoute permission="admin.system">
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="admin/events" element={
            <ProtectedRoute permission="events.manage">
              <EventManagement />
            </ProtectedRoute>
          } />
          
          <Route path="admin/availability" element={
            <ProtectedRoute permission="admin.system">
              <AvailabilityManagement />
            </ProtectedRoute>
          } />
          
          <Route path="admin/optimizer" element={
            <ProtectedRoute permission="admin.system">
              <RosterSuggestions />
            </ProtectedRoute>
          } />

          {/* Integrations */}
          <Route path="strava-callback" element={<StravaCallback />} />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
