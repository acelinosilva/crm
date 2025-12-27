import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Wallet,
    Settings,
    LogOut,
    MessageSquare // Added MessageSquare import
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const Sidebar = () => {
    const links = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/leads', icon: MessageSquare, label: 'Leads' }, // Added Leads link
        { to: '/clients', icon: Users, label: 'Clientes' },
        { to: '/projects', icon: Briefcase, label: 'Projetos' },
        { to: '/financial', icon: Wallet, label: 'Financeiro' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 z-50">
            <div className="h-16 flex items-center justify-center border-b border-border/50">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                    AceWeb CRM
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group overflow-hidden ${isActive
                                ? 'text-white bg-primary/20 border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute inset-0 bg-primary/10 rounded-lg"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <link.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                <span className="font-medium">{link.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-border/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
