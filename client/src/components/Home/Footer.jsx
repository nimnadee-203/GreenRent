import React from "react";
import { Leaf, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-3xl leading-none font-bold text-slate-900">GreenRent</span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Making eco-friendly living accessible and transparent for everyone.
              Find your next sustainable home today.
            </p>
            <div className="flex gap-4 text-slate-400">
              <a href="#" className="hover:text-emerald-600 transition-colors" aria-label="Twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-emerald-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-emerald-600 transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">For Renters</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/properties" className="hover:text-emerald-600 transition-colors">Browse Properties</Link></li>
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Smart Recommendations</Link></li>
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Renter Guide</Link></li>
              <li><Link to="/eco-score-explained" className="hover:text-emerald-600 transition-colors">Eco Score Explained</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">For Landlords</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/add-apartment" className="hover:text-emerald-600 transition-colors">List a Property</Link></li>
              <li><Link to="/my-listings" className="hover:text-emerald-600 transition-colors">Landlord Dashboard</Link></li>
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Improve Your Score</Link></li>
              <li><Link to="/" className="hover:text-emerald-600 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link to="/about" className="hover:text-emerald-600 transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-emerald-600 transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition-colors">Contact</Link></li>
              <li><Link to="/press" className="hover:text-emerald-600 transition-colors">Press</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 GreenRent. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;