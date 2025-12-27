import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight, ArrowDownRight, Users, Briefcase,
    DollarSign, Activity, TrendingUp, TrendingDown,
    MessageSquare, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';

const StatCard = ({ title, value, change, isPositive, icon: Icon, delay, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-md hover:border-primary/50 transition-all duration-300 group"
    >
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {change}
                </div>
            )}
        </div>
        <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
        <div className="text-2xl font-bold mt-1 text-white">
            {loading ? <div className="h-8 w-24 bg-secondary animate-pulse rounded" /> : value}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        activeProjects: 0,
        totalClients: 0,
        totalLeads: 0,
    });
    const [chartData, setChartData] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Revenue & Chart Data (Mocking chart data for visual perfection)
            const { data: transactions } = await supabase.from('transactions').select('*');
            const revenue = transactions?.reduce((acc, curr) =>
                curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0) || 0;

            // Mock Chart Data for Area Chart
            const mockChart = [
                { name: 'Jan', value: 4000 },
                { name: 'Fev', value: 3000 },
                { name: 'Mar', value: 5000 },
                { name: 'Abr', value: 2780 },
                { name: 'Mai', value: 1890 },
                { name: 'Jun', value: revenue > 0 ? revenue : 2390 },
            ];

            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'completed');
            const { count: clientCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
            const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });

            const { data: recentProjects } = await supabase.from('projects').select('name, created_at').order('created_at', { ascending: false }).limit(3);
            const { data: recentLeads } = await supabase.from('leads').select('name, created_at').order('created_at', { ascending: false }).limit(3);

            const combined = [
                ...(recentProjects?.map(p => ({ ...p, type: 'project' })) || []),
                ...(recentLeads?.map(l => ({ ...l, type: 'lead' })) || [])
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

            setStats({
                revenue,
                activeProjects: projectCount || 0,
                totalClients: clientCount || 0,
                totalLeads: leadCount || 0,
            });
            setChartData(mockChart);
            setRecentActivities(combined);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
                    <p className="text-muted-foreground mt-1">Sua agência num relance.</p>
                </div>
                <div className="flex gap-4">
                    {/* Quick Actions can go here */}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Receita Acumulada" value={`R$ ${stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} change="+15%" isPositive icon={DollarSign} delay={0.1} loading={loading} />
                <StatCard title="Projetos Ativos" value={stats.activeProjects} change="+2" isPositive icon={Briefcase} delay={0.2} loading={loading} />
                <StatCard title="Novos Leads" value={stats.totalLeads} change="+12" isPositive icon={MessageSquare} delay={0.3} loading={loading} />
                <StatCard title="Total Clientes" value={stats.totalClients} change="+5" isPositive icon={Users} delay={0.4} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2 p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-md"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white">Performance de Vendas</h3>
                            <p className="text-sm text-muted-foreground">Crescimento de faturamento semestral</p>
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-md flex flex-col"
                >
                    <h3 className="text-xl font-bold mb-6 text-white">Feed de Atividade</h3>
                    <div className="flex-1 space-y-6">
                        {recentActivities.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                                {i !== recentActivities.length - 1 && (
                                    <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-border/30" />
                                )}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${item.type === 'project' ? 'bg-primary/20 text-primary' : 'bg-emerald-500/20 text-emerald-500'
                                    }`}>
                                    {item.type === 'project' ? <CheckCircle className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {item.type === 'project' ? 'Projeto Iniciado' : 'Novo Lead Recebido'}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">{item.name}</p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-1 uppercase tracking-tighter">
                                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-3 rounded-2xl bg-secondary/50 text-xs font-bold uppercase tracking-widest hover:bg-secondary transition-all text-muted-foreground hover:text-white">
                        Relatório Completo
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
