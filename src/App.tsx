import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import { ZRLRealityProvider } from './services/ZRLRealityProvider';

/* =========================
   🔹 PUBLIC (caricati subito)
========================= */
const Welcome = lazy(() => import('./pages/Welcome'));
const Guest = lazy(() => import('./pages/Guest'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

/* =========================
   🔹 CORE APP
========================= */
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Racing = lazy(() => import('./pages/Racing'));
const Teams = lazy(() => import('./pages/Teams'));
const Ranking = lazy(() => import('./pages/Ranking'));
const Events = lazy(() => import('./pages/Events'));
const Availability = lazy(() => import('./pages/Availability'));
const RosterBuilder = lazy(() => import('./pages/RosterBuilder'));

/* =========================
   🔹 ZRL MODULES (HEAVY)
========================= */
const ZRLDivisionResults = lazy(() => import('./pages/ZRLDivisionResults'));
const ZRLAnalytics = lazy(() => import('./pages/ZRLAnalytics'));
const ZRLSeasonStats = lazy(() => import('./pages/ZRLSeasonStats'));
const ZRLOperations = lazy(() => import('./pages/admin/ZRLOperations'));
const ZRLOperationsDashboard = lazy(() => import('./pages/ZRLOperationsDashboard'));
const SeasonInitialization = lazy(() => import('./pages/admin/SeasonInitialization'));

/* =========================
   🔹 WINTER TOUR
========================= */
const WinterTourManagement = lazy(() => import('./pages/WinterTourManagement'));

/* =========================
   🔹 ADMIN
========================= */
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const EventManagement = lazy(() => import('./pages/admin/EventManagement'));
const AvailabilityManagement = lazy(() => import('./pages/admin/AvailabilityManagement'));
const RosterSuggestions = lazy(() => import('./pages/admin/RosterSuggestions'));

/* =========================
   🔹 INTEGRATIONS
========================= */
const StravaCallback = lazy(() => import('./pages/StravaCallback'));

/* =========================
   🔹 LOADING UI
========================= */
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}

/* =========================
   🔹 APP
========================= */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>

          {/* =====================
              PUBLIC ROUTES
          ===================== */}
          <Route path="/" element={<Welcome />} />
          <Route path="/guest" element={<Guest />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registrazione" element={<Navigate to="/register" replace />} />

          {/* =====================
              PROTECTED APP
          ===================== */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={['user', 'athlete', 'captain', 'moderator', 'admin', 'guest']}
              >
                <ZRLRealityProvider>
                  <MainLayout />
                </ZRLRealityProvider>
              </ProtectedRoute>
            }
          >

            {/* CORE */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="admin" element={<Navigate to="/dashboard" replace />} />

            <Route path="racing" element={<Racing />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="events" element={<Events />} />
            <Route path="teams" element={<Teams />} />
            <Route path="availability" element={<Availability />} />
            <Route path="roster" element={<RosterBuilder />} />

            {/* ZRL */}
            <Route path="zrl-results" element={<ZRLDivisionResults />} />
            <Route path="zrl-analytics" element={<ZRLAnalytics />} />
            <Route path="zrl-season-stats" element={<ZRLSeasonStats />} />
            <Route path="zrl-operations" element={<ZRLOperations />} />
            <Route path="zrl-round-manager" element={<ZRLOperationsDashboard />} />
            <Route path="admin/season-init" element={<SeasonInitialization />} />

            {/* WINTER TOUR */}
            <Route path="winter-tour-management" element={<WinterTourManagement />} />

            {/* ADMIN */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/events" element={<EventManagement />} />
            <Route path="admin/availability" element={<AvailabilityManagement />} />
            <Route path="admin/optimizer" element={<RosterSuggestions />} />

            {/* INTEGRATIONS */}
            <Route path="strava-callback" element={<StravaCallback />} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;