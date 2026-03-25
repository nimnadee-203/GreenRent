import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { PropertiesFeedPage } from './pages/PropertiesFeedPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddPropertyPage } from './pages/AddPropertyPage';
// Layout wrapper for public/renter pages
const MainLayout = ({ children }: {children: React.ReactNode;}) =>
<div className="min-h-screen flex flex-col">
    <Navbar />
    {children}
    <Footer />
  </div>;

// Layout wrapper for landlord dashboard
const DashboardLayout = ({ children }: {children: React.ReactNode;}) =>
<div className="min-h-screen flex flex-col">
    <Navbar />
    {children}
  </div>;

export function App() {
  return (
    <Router>
      <Routes>
        {/* Public & Renter Routes */}
        <Route
          path="/"
          element={
          <MainLayout>
              <LandingPage />
            </MainLayout>
          } />
        
        <Route
          path="/properties"
          element={
          <MainLayout>
              <PropertiesFeedPage />
            </MainLayout>
          } />
        

        {/* Landlord Routes */}
        <Route
          path="/dashboard"
          element={
          <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          } />
        
        <Route
          path="/dashboard/add-property"
          element={
          <DashboardLayout>
              <AddPropertyPage />
            </DashboardLayout>
          } />
        

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>);

}