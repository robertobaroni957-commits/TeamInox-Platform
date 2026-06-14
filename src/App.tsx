import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

import { ZRLRealityProvider } from './services/ZRLRealityProvider';
import { ActiveRoundProvider } from './context/ActiveRoundContext';
import { RoundControlProvider } from './pages/admin/RoundControlContext';
import { lazyWithRetry } from './utils/lazyWithRetry';

/* =========================
   🔹 PUBLIC (caricati subito)
========================= */
const Welcome = lazyWithRetry(() => import('./pages/Welcome'));
const Guest = lazyWithRetry(() => import('./pages/Guest'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));

/* =========================
   🔹 CORE APP
========================= */
const Dashboard = lazyWithRetry(() => import('./pages/Dashboard'));
const Racing = lazyWithRetry(() => import('./pages/Racing'));
const Teams = lazyWithRetry(() => import('./pages/Teams'));
const Ranking = lazyWithRetry(() => import('./pages/Ranking'));
const EventsCenter = lazyWithRetry(() => import('./pages/EventsCenter'));
const NarrativePage = lazyWithRetry(() => import('./pages/NarrativePage'));
const Availability = lazyWithRetry(() => import('./pages/Availability'));
const LineupBuilder = lazyWithRetry(() => import('./pages/LineupBuilder'));

/* =========================
   🔹 ZRL MODULES (HEAVY)
========================= */
const ZRLDivisionResults = lazyWithRetry(() => import('./pages/ZRLDivisionResults'));
const ZRLAnalytics = lazyWithRetry(() => import('./pages/ZRLAnalytics'));
const ZRLSeasonStats = lazyWithRetry(() => import('./pages/ZRLSeasonStats'));
const ZRLStrategy = lazyWithRetry(() => import('./pages/ZRLStrategy'));
const ZRLOperations = lazyWithRetry(() => import('./pages/admin/ZRLOperations'));
const ZRLResultIngestor = lazyWithRetry(() => import('./pages/admin/ZRLResultIngestor'));
const ZRLOperationsDashboard = lazyWithRetry(() => import('./pages/ZRLOperationsDashboard'));
const SeasonInitialization = lazyWithRetry(() => import('./pages/admin/RoundControlCenter'));

/* =========================
   🔹 WINTER TOUR
========================= */
const WinterTourManagement = lazyWithRetry(() => import('./pages/WinterTourManagement'));
const WinterTourRanking = lazyWithRetry(() => import('./pages/Ranking'));

/* =========================
   🔹 ADMIN
========================= */
const UserManagement = lazyWithRetry(() => import('./pages/admin/UserManagement'));
const AvailabilityManagement = lazyWithRetry(() => import('./pages/admin/AvailabilityManagement'));
const RosterSuggestions = lazyWithRetry(() => import('./pages/admin/RosterSuggestions'));

/* =========================
   🔹 INTEGRATIONS
========================= */
const StravaCallback = lazyWithRetry(() => import('./pages/StravaCallback'));

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
    <ActiveRoundProvider>
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
                    <RoundControlProvider>
                      <MainLayout />
                    </RoundControlProvider>
                  </ZRLRealityProvider>
                </ProtectedRoute>
              }
            >

              {/* CORE */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admin" element={<Navigate to="/dashboard" replace />} />

              <Route path="racing" element={<Racing />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="events" element={<EventsCenter />} />
              <Route path="ai/narrative" element={<NarrativePage />} />
              <Route path="teams" element={<Teams />} />
              <Route path="availability" element={<Availability />} />
              <Route path="lineup" element={<LineupBuilder />} />

              {/* ZRL */}
              <Route path="zrl-results" element={<ZRLDivisionResults />} />
              <Route path="zrl-ingest" element={<ZRLResultIngestor />} />
              <Route path="zrl-analytics" element={<ZRLAnalytics />} />
              <Route path="zrl-season-stats" element={<ZRLSeasonStats />} />
              <Route path="zrl-strategy" element={<ZRLStrategy />} />
              <Route path="zrl-operations" element={<ZRLOperations />} />
              <Route path="zrl-round-manager" element={<ZRLOperationsDashboard />} />
              <Route path="admin/season-init" element={<SeasonInitialization />} />

              {/* WINTER TOUR */}
              <Route path="winter-tour-management" element={<WinterTourManagement />} />
              <Route path="winter-tour-ranking" element={<WinterTourRanking />} />

              {/* ADMIN */}
              <Route path="admin/users" element={<UserManagement />} />
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
    </ActiveRoundProvider>
  );
};

export default App;

