import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 rounded-3xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">
                        AceWeb CRM
                    </h1>
                    <p className="text-muted-foreground">Bem-vindo de volta! Entre na sua conta.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Senha</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full bg-secondary/30 border border-border rounded-2xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-foreground"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 disabled:opacity-70 active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                            <>
                                Entrar no Sistema
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Não tem uma conta? Entre em contato com o administrador.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
