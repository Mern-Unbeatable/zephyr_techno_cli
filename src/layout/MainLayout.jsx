
import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router';
import Footer from './Footer';
import ScrollToTop from '../components/ScrollToTop';
import MobileBottomNav from '../components/MobileBottomNav';

const MainLayout = () => {
    return (
        <>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
                <div className="sticky top-0 z-50 bg-white shadow-sm">
                    <Navbar/>
                </div>
                <main className="flex-1">
                    <Outlet/>
                </main>
                <Footer/>
                <MobileBottomNav />
            </div>
        </>
    );
};

export default MainLayout;