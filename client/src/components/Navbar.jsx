import React from "react";
import { Globe, Menu } from "lucide-react";

const Navbar = () => {
    return (
        <nav className="flex items-center justify-between px-8 py-4 shadow-sm bg-white">

            {/* Logo */}
            <div className="text-2xl font-bold text-red-500">
                GreenRent
            </div>

            {/* Center Links */}
            <div className="hidden md:flex gap-8 text-gray-600 font-medium">
                <span className="border-b-2 border-black pb-1 cursor-pointer">Homes</span>
                <span className="hover:text-black cursor-pointer">Experiences</span>
                <span className="hover:text-black cursor-pointer">
                    Services
                </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                <span className="hidden md:block cursor-pointer">
                    Become a seller
                </span>
                <Globe size={20} className="cursor-pointer" />
                <Menu size={24} className="cursor-pointer" />
            </div>
        </nav>
    );
};

export default Navbar;
