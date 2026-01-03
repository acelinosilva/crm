import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
        >
            <div className="relative w-5 h-5">
                <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'dark' ? 0 : 180, scale: theme === 'dark' ? 1 : 0, opacity: theme === 'dark' ? 1 : 0 }}
                    className="absolute inset-0"
                >
                    <Moon className="w-5 h-5" />
                </motion.div>
                <motion.div
                    initial={false}
                    animate={{ rotate: theme === 'light' ? 0 : -180, scale: theme === 'light' ? 1 : 0, opacity: theme === 'light' ? 1 : 0 }}
                    className="absolute inset-0"
                >
                    <Sun className="w-5 h-5" />
                </motion.div>
            </div>
            <span className="font-medium">{theme === 'dark' ? 'Modo Escuro' : 'Modo Claro'}</span>
        </button>
    );
};

export default ThemeToggle;
