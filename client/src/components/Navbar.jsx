import React from "react";
import { Leaf, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const navClassName = ({ isActive }) =>
    `text-base font-medium transition-colors ${
        isActive ? "text-emerald-600" : "text-slate-600 hover:text-emerald-600"
    }`;

const Navbar = () => {
    return (
        <header className="nav-ambient sticky top-0 z-50 border-b border-white/30 backdrop-blur-xl">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <div className="bg-emerald-600 p-1.5 rounded-lg">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl leading-none font-bold text-slate-900">GreenRent</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <NavLink to="/" className={navClassName} end>
                        Home
                    </NavLink>
                    <NavLink to="/properties" className={navClassName}>
                        Apartments
                    </NavLink>
                    <NavLink to="/auxiliary" className={navClassName}>
                        Auxiliary
                    </NavLink>
                    <NavLink to="/about" className={navClassName}>
                        About
                    </NavLink>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <Link to="/login" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
                        Log in
                    </Link>
                    <button className="h-10 px-5 rounded-lg bg-emerald-600 text-white text-base font-semibold hover:bg-emerald-700 transition-colors">
                        Sign up
                    </button>
                </div>

                <button className="md:hidden p-2 text-slate-600">
                    <Menu className="w-6 h-6" />
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
