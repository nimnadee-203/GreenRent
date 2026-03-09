import React from "react";
import { Globe, Menu } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo1.png";

const navClassName = ({ isActive }) =>
    `cursor-pointer pb-1 ${isActive ? "border-b-2 border-[#007B78] text-[#007B78]" : "hover:text-[#007B78]"}`;

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-8 py-4 shadow-sm bg-white">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-[#007B78]">
                <img src={logo} alt="GreenRent logo" className="h-10 w-10 object-contain" />
                <span>GreenRent</span>
            </Link>

            {/* Center Links */}
            <div className="hidden md:flex gap-8 text-gray-600 font-medium">
                
                <NavLink to="/" className={navClassName} end>Home</NavLink>
                <NavLink to="/properties" className={navClassName}>Properties</NavLink>
                <NavLink to="/add-apartment" className={navClassName}>Add Apartment</NavLink>
                <NavLink to="/my-listings" className={navClassName}>My Listings</NavLink>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <Link to="/login" className="hidden md:block cursor-pointer font-medium hover:text-black">
                    Login
                </Link>
                <Globe size={20} className="cursor-pointer" />
                <Menu size={24} className="cursor-pointer" />
            </div>
        </nav>
    );
};

export default Navbar;
