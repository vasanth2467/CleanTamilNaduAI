import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CitizenReportPage from './pages/CitizenReportPage';
import HotspotMapPage from './pages/HotspotMapPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PriorityBreakdownModal from './components/PriorityBreakdownModal';
import StatusUpdateModal from './components/StatusUpdateModal';
import { fetchHealth, fetchStats, fetchReports, fetchHotspots, fetchSensitiveZones } from './api';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [sensitiveZones, setSensitiveZones] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [priorityModalReport, setPriorityModalReport] = useState(null);
  const [statusModalReport, setStatusModalReport] = useState(null);

  const loadData = async () => {
    try {
      const [hData, sData, rData, hsData, szData] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchStats().catch(() => null),
        fetchReports({ limit: 100 }).catch(() => []),
        fetchHotspots().catch(() => []),
        fetchSensitiveZones().catch(() => [])
      ]);

      if (hData) setHealth(hData);
      if (sData) setStats(sData);
      if (rData) setReports(rData);
      if (hsData) setHotspots(hsData);
      if (szData) setSensitiveZones(szData);
    } catch (err) {
      console.error("Failed to load CleanTamil Nadu AI state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReportCreated = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    loadData(); // refresh stats and hotspots
  };

  const handleReportUpdated = (updatedReport) => {
    setReports((prev) => prev.map((r) => r.id === updatedReport.id ? updatedReport : r));
    loadData();
  };

  const handleViewOnMap = (target) => {
    setActivePage('map');
  };

  return (
    <div className="app-container">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        aiModeInfo={health}
      />

      <main className="main-content">
        {activePage === 'home' && (
          <HomePage
            stats={stats}
            reports={reports}
            hotspots={hotspots}
            setActivePage={setActivePage}
            onOpenBreakdown={(rep) => setPriorityModalReport(rep)}
            onOpenStatusUpdate={(rep) => setStatusModalReport(rep)}
            onViewOnMap={handleViewOnMap}
          />
        )}

        {activePage === 'report' && (
          <CitizenReportPage
            onReportCreated={handleReportCreated}
            setActivePage={setActivePage}
          />
        )}

        {activePage === 'map' && (
          <HotspotMapPage
            reports={reports}
            hotspots={hotspots}
            sensitiveZones={sensitiveZones}
            onOpenBreakdown={(rep) => setPriorityModalReport(rep)}
            onOpenStatusUpdate={(rep) => setStatusModalReport(rep)}
          />
        )}

        {activePage === 'admin' && (
          <AdminDashboardPage
            reports={reports}
            stats={stats}
            onOpenBreakdown={(rep) => setPriorityModalReport(rep)}
            onOpenStatusUpdate={(rep) => setStatusModalReport(rep)}
            onRefresh={loadData}
          />
        )}
      </main>

      <Footer onReseedComplete={loadData} />

      {/* Priority Scoring Formula Modal */}
      {priorityModalReport && (
        <PriorityBreakdownModal
          report={priorityModalReport}
          onClose={() => setPriorityModalReport(null)}
        />
      )}

      {/* Admin Status & Before/After Verification Modal */}
      {statusModalReport && (
        <StatusUpdateModal
          report={statusModalReport}
          onClose={() => setStatusModalReport(null)}
          onUpdated={handleReportUpdated}
        />
      )}
    </div>
  );
}
