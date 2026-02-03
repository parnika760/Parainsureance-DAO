import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './context/Web3Context';
import { Dashboard } from './pages/Dashboard';
import { Policies } from './pages/Policies';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Web3Provider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/policies" element={<Policies />} />
        </Routes>
      </Web3Provider>
    </BrowserRouter>
  );
}

export default App;
