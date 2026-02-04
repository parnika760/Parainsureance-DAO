import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Dashboard } from './pages/Dashboard';
import { Policies } from './pages/Policies';
import { Docs } from './pages/Docs';
import GovernancePage from './pages/GovernancePage';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/governance" element={<GovernancePage />} />
        </Routes>
      </Web3Provider>
    </BrowserRouter>
  );
}

export default App;
