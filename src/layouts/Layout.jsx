import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/30">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 relative min-h-screen">
                {/* Background Gradients */}
                <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
                </div>

                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
