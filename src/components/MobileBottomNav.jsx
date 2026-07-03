import React from 'react';
// import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Grid, ShoppingCart, Smartphone } from 'lucide-react';
// import { Home, Grid, ShoppingCart, User, Smartphone, MoreHorizontal } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// const submenuItems = [
//   { to: '/for-businesses', label: 'For Business' },
//   { to: '/about-us', label: 'About' },
//   { to: '/contact', label: 'Contact' },
// ];

// const otherPaths = submenuItems.map((item) => item.to);

const MobileBottomNav = () => {
  // const { isAuthenticated } = useAuth();
  // const [submenuOpen, setSubmenuOpen] = useState(false);
  // const navRef = useRef(null);

  // const profilePath = isAuthenticated ? '/dashboard/user' : '/login';

  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/products', label: 'Products', icon: Grid },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
    // { to: profilePath, label: 'Profile', icon: User },
    { to: '/sell', label: 'Sell', icon: Smartphone },
    // { to: 'other', label: 'Other', icon: MoreHorizontal, isSubmenu: true },
  ];

  const { pathname, search } = useLocation();

  // useEffect(() => {
  //   setSubmenuOpen(false);
  // }, [pathname]);

  // useEffect(() => {
  //   const handleOutsideClick = (event) => {
  //     if (navRef.current && !navRef.current.contains(event.target)) {
  //       setSubmenuOpen(false);
  //     }
  //   };

  //   if (submenuOpen) {
  //     document.addEventListener('mousedown', handleOutsideClick);
  //   }

  //   return () => document.removeEventListener('mousedown', handleOutsideClick);
  // }, [submenuOpen]);

  const isActive = (it) => {
    // if (it.isSubmenu) {
    //   return otherPaths.some((path) => pathname.startsWith(path));
    // }

    if (it.to === '/') return pathname === '/';

    if (it.to === '/sell') return pathname === '/sell';

    if (it.to === '/products') {
      return pathname === '/products' && !search.includes('location=');
    }

    return pathname === it.to;
  };

  return (
    <nav className="lg:hidden fixed w-full bottom-0 z-30">
      <div className="rounded-lg bg-white border border-slate-200 border-t-custom shadow-xl shadow-custom/5">
        <ul className="flex items-center justify-between px-2 py-2">
          {items.map((it) => {
            const Icon = it.icon;
            const active = isActive(it);

            // if (it.isSubmenu) {
            //   return (
            //     <li key={it.label} className="relative flex-1">
            //       {submenuOpen && (
            //         <div className="absolute bottom-full right-0 z-40 pb-3">
            //           <div className="w-max min-w-full rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden">
            //             <ul>
            //               {submenuItems.map((item) => {
            //                 const itemActive = pathname.startsWith(item.to);

            //                 return (
            //                   <li key={item.to}>
            //                     <Link
            //                       to={item.to}
            //                       onClick={() => setSubmenuOpen(false)}
            //                       className={`block whitespace-nowrap px-4 py-2 text-xs font-semibold border-b border-slate-100 last:border-b-0 ${
            //                         itemActive
            //                           ? 'text-custom bg-custom/5'
            //                           : 'text-slate-700 hover:text-custom hover:bg-slate-50'
            //                       }`}
            //                     >
            //                       {item.label}
            //                     </Link>
            //                   </li>
            //                 );
            //               })}
            //             </ul>
            //           </div>
            //         </div>
            //       )}

            //       <button
            //         type="button"
            //         onClick={() => setSubmenuOpen((open) => !open)}
            //         className={`flex w-full py-2 flex-col items-center gap-1 text-sm font-semibold cursor-pointer ${
            //           active || submenuOpen ? 'nav-link-active text-custom' : 'text-slate-700 hover:text-custom'
            //         }`}
            //         aria-expanded={submenuOpen}
            //         aria-haspopup="true"
            //       >
            //         <div className="p-1 rounded-md bg-transparent">
            //           <Icon size={23} />
            //         </div>
            //         <span className="text-[10px] tracking-wide">{it.label}</span>
            //       </button>
            //     </li>
            //   );
            // }

            return (
              <li key={it.to} className="flex-1">
                <Link
                  to={it.to}
                  className={`flex py-2 flex-col items-center gap-1 text-sm font-semibold ${
                    active ? 'nav-link-active text-custom' : 'text-slate-700 hover:text-custom'
                  }`}
                >
                  <div className="p-1 rounded-md bg-transparent">
                    <Icon size={23} />
                  </div>
                  <span className="text-[10px] tracking-wide">{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
