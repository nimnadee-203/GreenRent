import React, { Fragment } from "react";
import { Leaf, Menu as MenuIcon, User, LogOut, LayoutDashboard, Home } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from "../../context/AuthContext";

const navClassName = ({ isActive }) =>
    `text-base font-medium transition-colors ${
        isActive ? "text-emerald-600" : "text-slate-600 hover:text-emerald-600" 
    }`;

const Navbar = () => {
    const { currentUser, backendUser, logout } = useAuth();
    const navigate = useNavigate();
    const sessionUser = currentUser || backendUser;

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

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
                    {sessionUser ? (
                        <Menu as="div" className="relative inline-block text-left">
                            <div>
                                <Menu.Button className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition ring-2 ring-transparent focus:ring-emerald-500">
                                    {currentUser?.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </Menu.Button>
                            </div>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-slate-100 rounded-2xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="px-4 py-3">
                                        <p className="text-sm">Signed in as</p>
                                        <p className="truncate text-sm font-semibold text-slate-900">
                                            {currentUser?.displayName || currentUser?.email || backendUser?.name || backendUser?.email}
                                        </p>
                                    </div>
                                    <div className="p-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <Link
                                                    to="/dashboard"
                                                    className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'} group flex w-full items-center rounded-xl px-3 py-2 text-sm transition-colors`}
                                                >
                                                    <LayoutDashboard className="mr-3 h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                            )}
                                        </Menu.Item>
                                        
                                        {(backendUser?.role === 'seller' || backendUser?.role === 'admin') && (
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <Link
                                                        to="/my-listings"
                                                        className={`${active ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'} group flex w-full items-center rounded-xl px-3 py-2 text-sm transition-colors`}
                                                    >
                                                        <Home className="mr-3 h-4 w-4" />
                                                        My Listings
                                                    </Link>
                                                )}
                                            </Menu.Item>
                                        )}
                                    </div>
                                    <div className="p-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={handleLogout}
                                                    className={`${active ? 'bg-red-50 text-red-600' : 'text-red-500'} group flex w-full items-center rounded-xl px-3 py-2 text-sm transition-colors`}
                                                >
                                                    <LogOut className="mr-3 h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    ) : (
                        <>
                            <Link to="/login" className="text-base font-medium text-slate-700 hover:text-slate-900 transition-colors">
                                Log in
                            </Link>
                            <Link to="/login" className="flex items-center justify-center h-10 px-5 rounded-lg bg-emerald-600 text-white text-base font-semibold hover:bg-emerald-700 transition-colors">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                <button className="md:hidden p-2 text-slate-600">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </nav>
        </header>
    );
};

export default Navbar;
