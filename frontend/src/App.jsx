import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AirDashboard from './components/AirDashboard';
import Dashboard from './components/Dashboard';
import WaveBackground from './components/WaveBackground';
import './styles/index.css';

// page: 'landing' | 'air' | 'water'
export default function App() {
  const [page, setPage] = useState('landing');

  return (
    <>
      <WaveBackground />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', isolation: 'isolate' }}>
        {page === 'landing' && (
          <LandingPage
            onEnterAir={() => setPage('air')}
            onEnterWater={() => setPage('water')}
          />
        )}
        {page === 'air' && (
          <AirDashboard onGoHome={() => setPage('landing')} />
        )}
        {page === 'water' && (
          <Dashboard onGoHome={() => setPage('landing')} />
        )}
      </div>
    </>
  );
}
