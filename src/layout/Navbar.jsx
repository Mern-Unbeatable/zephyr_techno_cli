import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { FiShoppingCart, FiX, FiMenu, FiLogOut, FiUser } from "react-icons/fi";
import logo from "../assets/logo.webp";
import Container from "./Container";
import { useAuth } from "../context/AuthContext";
import { getRoles } from "../utils/roles";

const Navbar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated, logout } = useAuth();

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const dashboardPath =
    getRoles(role) === "/login" ? "/dashboard/user" : getRoles(role);
  const displayName = user?.firstName || user?.name || user?.email || "Account";

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/products", label: "Products" },
    { to: "/for-businesses", label: "For Businesses" },
    { to: "/about-us", label: "About Us" },
    { to: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleDocClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <Container>
        <div className="navbar px-0!">
          {/* LEFT — hamburger + logo */}
          <div className="navbar-start flex items-center gap-4 lg:gap-0">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="btn btn-ghost btn-circle lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <FiMenu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" className="cursor-pointer">
              <img
                src={logo}
                alt="Logo"
                className="h-8 w-auto object-contain"
              />
            </Link>
          </div>

          {/* CENTER — desktop nav */}
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal gap-1 px-1">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`nav-link text-gray-700 hover:text-custom hover:bg-transparent rounded-none ${
                      isActive(to) ? "nav-link-active" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — cart + buttons */}
          <div className="navbar-end gap-2 lg:gap-3 ml-5">
            <Link
              to="/cart"
              className="btn btn-ghost hover:bg-gray-100 border-none btn-circle"
            >
              <FiShoppingCart size={20} />
            </Link>
            <Link
              to="/sell"
              className="btn-custom border-none text-sm font-medium px-3 sm:px-4 flex"
            >
              <span className="sm:hidden">Sell Your Phone</span>
              <span className="hidden sm:inline">Sell Your Phone</span>
            </Link>
            {isAuthenticated ? (
              <div
                className="dropdown dropdown-end"
                style={{ position: "relative" }}
                ref={userMenuRef}
              >
                <button
                  type="button"
                  className="btn btn-ghost hover:bg-gray-100 border-none btn-circle relative"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  aria-label="Open user menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2E395B] text-white shadow-sm">
                    <FiUser size={18} />
                  </span>
                </button>

                <div
                  className={`absolute right-0 top-full z-50 mt-2 w-48 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl transition-all duration-150 ${
                    userMenuOpen
                      ? "visible opacity-100 translate-y-0"
                      : "invisible opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500">Signed in</p>
                  </div>

                  <Link
                    to={dashboardPath}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-custom"
                  >
                    <FiUser size={16} />
                    Dashboard
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
              <Link
                to="/login"
                className="btn bg-[#2E395B] hover:bg-[#1C253B] text-white border-none text-sm font-medium px-4 hidden sm:flex"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Backdrop */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300
                    ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-white z-50 lg:hidden
                    flex flex-col shadow-2xl
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Link to="/" onClick={() => setSidebarOpen(false)} className="p-0">
              <img
                src={logo}
                alt="Logo"
                className="h-6 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <FiX size={20} />
            </button>
          </div>

          <ul className="flex flex-col px-4 py-6 gap-1 flex-1">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-custom transition-colors ${
                    isActive(to) ? "nav-link-active" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 px-6 py-6 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setSidebarOpen(false)}
                  className="btn bg-[#2E395B] hover:bg-[#1C253B] text-white border-none w-full"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    handleLogout();
                  }}
                  className="btn btn-ghost border border-gray-200 w-full text-gray-700"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setSidebarOpen(false)}
                className="btn bg-[#2E395B] hover:bg-[#1C253B] text-white border-none w-full"
              >
                Log In / Sign Up
              </Link>
            )}
            <Link
              to="/sell"
              onClick={() => setSidebarOpen(false)}
              className="btn-custom text-white border-none w-full"
            >
              Sell Your Phone
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
};

export default Navbar;
