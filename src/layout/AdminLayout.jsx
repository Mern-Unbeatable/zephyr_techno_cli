import { useState } from 'react';
import { Outlet } from 'react-router';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
            <DashboardHeader
                userName="Atik Adnan"
                role="Admin"
                onMenuToggle={toggleSidebar}
                isSidebarOpen={sidebarOpen}
            />
            <div className="flex flex-1 overflow-hidden">
                <DashboardSidebar role="admin" isOpen={sidebarOpen} onClose={closeSidebar} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

