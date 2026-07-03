import { NavLink, Link, useLocation, useNavigate } from 'react-router';
import {
    LayoutDashboard,
    List,
    ShoppingCart,
    Smartphone,
    Tag,
    Users,
    Settings,
    User,
    Star,
    LogOut,
    Mail,
} from 'lucide-react';
import logo from '../assets/logo.webp';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV_ITEMS = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/admin', end: true },
    {
        label: 'Listing',
        icon: List,
        path: '/dashboard/admin/listing',
        activePatterns: ['/dashboard/admin/listing', '/dashboard/admin/add-listing'],
    },
    { label: 'Order', icon: ShoppingCart, path: '/dashboard/admin/order' },
    { label: 'Sell Phone', icon: Smartphone, path: '/dashboard/admin/cell-phone' },
    {
        label: 'Promo Code',
        icon: Tag,
        path: '/dashboard/admin/promo-code',
        activePatterns: ['/dashboard/admin/promo-code', '/dashboard/admin/create-promo'],
    },
    { label: 'User Management', icon: Users, path: '/dashboard/admin/user-management' },
    { label: 'Business Queries', icon: Star, path: '/dashboard/admin/business-queries' },
    { label: 'Contact Management', icon: Mail, path: '/dashboard/admin/contact-management' },
    { label: 'Settings', icon: Settings, path: '/dashboard/admin/settings' },
    { label: 'Profile', icon: User, path: '/dashboard/admin/profile' },
];

const USER_NAV_ITEMS = [
    { label: 'Order', icon: ShoppingCart, path: '/dashboard/user', end: true },
    { label: 'Account', icon: User, path: '/dashboard/user/account' },
];

const linkClasses = (active) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
        active
            ? 'bg-cyan-50 text-cyan-600'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`;

const SidebarLink = ({ item, pathname, onClose }) => {
    const { label, icon: Icon, path, end, activePatterns } = item;
    const matchedByPattern = activePatterns?.some((p) => pathname.startsWith(p));

    return (
        <NavLink
            to={path}
            end={end}
            onClick={onClose}
            className={({ isActive }) => linkClasses(activePatterns ? matchedByPattern : isActive)}
        >
            <Icon size={17} />
            {label}
        </NavLink>
    );
};

const DashboardSidebar = ({ role, isOpen, onClose }) => {
    const navItems = role === 'admin' ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS;
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        onClose?.();
        navigate('/login');
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed bottom-0 left-0 top-0 z-40 flex w-52 md:w-56 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-14 items-center border-b border-gray-200 px-4 lg:hidden">
                    <Link to="/" onClick={onClose}>
                        <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
                    </Link>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden">
                    <nav className="flex-1 flex flex-col gap-0.5 overflow-y-auto px-3 py-6">
                        {navItems.map((item) => (
                            <SidebarLink
                                key={item.path}
                                item={item}
                                pathname={pathname}
                                onClose={onClose}
                            />
                        ))}
                    </nav>

                    <div className="border-t border-gray-200 p-3">
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                        >
                            <LogOut size={17} />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default DashboardSidebar;
