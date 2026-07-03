import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome } from 'react-icons/fi';
import logo from '../assets/logo.webp';
import { useAuth } from '../context/AuthContext';

const DashboardHeader = ({ userName = 'Atik Adnan', role = 'Admin', onMenuToggle, isSidebarOpen }) => {
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const navigate = useNavigate();
    const { user, role: authRole, isAuthenticated, logout } = useAuth();

    const displayName = user?.firstName || user?.name || userName || 'Account';

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/login');
    };

    useEffect(() => {
        const handleDocClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleDocClick);
        return () => document.removeEventListener('mousedown', handleDocClick);
    }, []);

    return (
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="btn btn-ghost btn-circle btn-sm lg:hidden"
                    aria-label="Toggle menu"
                >
                    {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
                </button>
                <Link to="/">
                    <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                </Link>
            </div>
            {isAuthenticated ? (
                <div
                    className="relative"
                    ref={userMenuRef}
                >
                    <button
                        type="button"
                        className="flex h-8 cursor-pointer w-8 items-center justify-center rounded-full bg-[#2E395B] text-white shadow-sm"
                        onClick={() => setUserMenuOpen((prev) => !prev)}
                        aria-label="Open dashboard user menu"
                    >
                        <FiUser size={18} />
                    </button>

                    <div
                        className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl transition-all duration-150 ${
                            userMenuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-1 pointer-events-none'
                        }`}
                    >
                        <div className="px-3 py-2 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                            <p className="text-xs text-gray-500 capitalize">{authRole || role}</p>
                        </div>

                        <Link
                            to="/"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-custom"
                        >
                            <FiHome size={16} />
                            Home
                        </Link>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <FiLogOut size={16} />
                            Log Out
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{userName}</p>
                    <p className="text-xs capitalize text-gray-400">{role}</p>
                </div>
            )}
        </header>
    );
};

export default DashboardHeader;
