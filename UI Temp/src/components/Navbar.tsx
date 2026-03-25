import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu } from 'lucide-react';
import { Button } from './ui/Button';
export function Navbar() {
  const location = useLocation();
  const isLandlord = location.pathname.includes('/dashboard');
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              GreenRent
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {!isLandlord ?
            <>
                <Link
                to="/properties"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                
                  Find a Home
                </Link>
                <Link
                to="/how-it-works"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                
                  How it Works
                </Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                
                  For Landlords
                </Link>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                  <Button variant="primary" size="sm">
                    Sign up
                  </Button>
                </div>
              </> :

            <>
                <Link
                to="/dashboard"
                className="text-sm font-medium text-slate-900">
                
                  Dashboard
                </Link>
                <Link
                to="/dashboard/listings"
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                
                  My Listings
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    JD
                  </div>
                </div>
              </>
            }
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-slate-600">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>);

}