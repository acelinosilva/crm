import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    ArrowLeft, Mail, Phone, MapPin, Edit2, Calendar,
    CheckCircle2, Clock, AlertCircle, FileText,
    Plus, DollarSign, TrendingUp, MoreVertical,
    Layout, History as HistoryIcon, Folder
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ClientDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [projects, setProjects] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalInvested: 0,
        activeProjects: 0,
        pendingTasks: 0
    });

    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        fetchClientData();
    }, [id]);

    const fetchClientData = async () => {
        try {
            setLoading(true);

            // Fetch Client Details
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (clientError) throw clientError;
            setClient(clientData);

            // Fetch Projects with Tasks
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select('*, tasks(*)')
                .eq('client_id', id)
                .order('created_at', { ascending: false });

            if (projectsError) throw projectsError;
            setProjects(projectsData);

            // Fetch Transactions for these projects
            const projectIds = projectsData.map(p => p.id);
            let transactionsData = [];
            if (projectIds.length > 0) {
                const { data: transData, error: transError } = await supabase
                    .from('transactions')
                    .select('*')
                    .in('project_id', projectIds)
                    .order('date', { ascending: false });

                if (!transError) transactionsData = transData;
            }
            setTransactions(transactionsData);

            // Calculate Stats
            const totalInvested = projectsData.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
            const activeProjects = projectsData.filter(p => p.status === 'in_progress').length;
            const allTasks = projectsData.flatMap(p => p.tasks || []);
            const pendingTasks = allTasks.filter(t => t.status === 'pending').length;

            setStats({
                totalInvested,
                activeProjects,
                pendingTasks,
                allTasks // Store all tasks for the widget
            });

        } catch (error) {
            console.error('Error fetching data:', error);
            // navigate('/clients'); // Optional: redirect on error
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!client) return null;

    const activeProjectsList = projects.filter(p => p.status === 'in_progress' || p.status === 'pending');

    // Calculate progress for a project based on its tasks
    const getProjectProgress = (project) => {
        if (!project.tasks || project.tasks.length === 0) {
            return project.status === 'completed' ? 100 : (project.status === 'in_progress' ? 10 : 0);
        }
        const completed = project.tasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / project.tasks.length) * 100);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <button onClick={() => navigate('/clients')} className="hover:text-primary transition-colors">Clientes</button>
                <span>/</span>
                <span className="text-foreground font-medium">{client.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Sidebar - Profile */}
                <div className="lg:col-span-4 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-primary/20 mb-4">
                                {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">{client.name}</h2>
                            <p className="text-muted-foreground">Cliente VIP</p> {/* Placeholder for type/sector */}

                            <div className="mt-4 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase rounded-full border border-emerald-500/20">
                                Ativo
                            </div>
                        </div>

                        <div className="mt-8 space-y-4">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Contato Principal</h3>
                            {/* Assuming name is the contact name for now, or use a placeholder if no specific contact person field */}
                            <div>
                                <p className="font-bold text-foreground">Responsável</p>
                                <p className="text-sm text-muted-foreground">Diretor(a)</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border/50">
                                {client.email && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 text-emerald-500" />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-rose-500" />
                                    <span>São Paulo, SP</span> {/* Placeholder location */}
                                </div>
                            </div>
                        </div>

                        <button className="w-full mt-6 bg-primary text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <Edit2 className="w-4 h-4" />
                            Editar Perfil
                        </button>
                    </motion.div>

                    {/* Key Metrics Widget */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
                        <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Métricas Chave
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Total Investido</span>
                                    <span className="font-bold text-foreground">R$ {stats.totalInvested.toLocaleString('pt-BR')}</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-3/4 rounded-full" />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Projetos Ativos</span>
                                    <span className="font-bold text-foreground">{stats.activeProjects}</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-1/2 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Header Card */}
                    <div className="bg-card border border-border/50 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                ID: #{client.id.substring(0, 8)} • Cliente desde {new Date(client.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Nota
                            </button>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Novo Projeto
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-border/50">
                        <div className="flex gap-6 overflow-x-auto">
                            {[
                                { id: 'overview', label: 'Visão Geral', icon: Layout },
                                { id: 'projects', label: 'Projetos', count: projects.length, icon: Folder },
                                { id: 'history', label: 'Histórico', icon: HistoryIcon },
                                { id: 'financial', label: 'Faturamento', icon: DollarSign },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-4 text-sm font-medium flex items-center gap-2 transition-all relative ${activeTab === tab.id
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                    {tab.count !== undefined && (
                                        <span className="bg-secondary px-1.5 rounded-md text-xs">{tab.count}</span>
                                    )}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                {/* Active Projects */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-lg text-foreground">Projetos Ativos</h3>
                                        <button className="text-primary text-sm font-medium hover:underline">Ver todos</button>
                                    </div>

                                    <div className="grid gap-4">
                                        {activeProjectsList.length > 0 ? activeProjectsList.map(project => (
                                            <div key={project.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all group">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                            <Folder className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-foreground">{project.name}</h4>
                                                            <p className="text-xs text-muted-foreground">Entrega: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'A definir'}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {project.status === 'in_progress' ? 'Em Desenvolvimento' : 'Pendente'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs font-medium text-muted-foreground">
                                                        <span>Progresso</span>
                                                        <span>{getProjectProgress(project)}%</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${getProjectProgress(project)}%` }}
                                                            className={`h-full rounded-full ${getProjectProgress(project) === 100 ? 'bg-emerald-500' : 'bg-primary'
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8 bg-secondary/20 rounded-xl border border-dashed border-border/50 text-muted-foreground text-sm">
                                                Nenhum projeto ativo no momento.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Recent History (Mocked for UI) */}
                                    <div className="bg-card border border-border/50 rounded-2xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="font-bold text-foreground">Histórico Recente</h3>
                                            <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">Filtrar</span>
                                        </div>

                                        <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/50">
                                            <div className="relative pl-6">
                                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-primary border-4 border-card box-content shadow-sm"></div>
                                                <h4 className="font-medium text-foreground text-sm">Reunião de Alinhamento</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 mb-2">Hoje, 14:30</p>
                                                <p className="text-xs text-muted-foreground line-clamp-2">Call com João sobre as novas funcionalidades do carrinho de compras.</p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className="text-[10px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-bold uppercase">ZOOM</span>
                                                    <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-bold uppercase">45 MIN</span>
                                                </div>
                                            </div>

                                            <div className="relative pl-6">
                                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-blue-400 border-4 border-card box-content shadow-sm"></div>
                                                <h4 className="font-medium text-foreground text-sm">Proposta Comercial Enviada</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 mb-2">Ontem, 09:15</p>
                                                <p className="text-xs text-muted-foreground">Proposta para campanha de Black Friday.</p>
                                                <a href="#" className="flex items-center gap-1 text-[10px] text-primary mt-1 hover:underline">
                                                    <FileText className="w-3 h-3" /> proposta_bf_v1.pdf
                                                </a>
                                            </div>

                                            <div className="relative pl-6">
                                                <div className="absolute left-0 top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-card box-content shadow-sm"></div>
                                                <h4 className="font-medium text-foreground text-sm">Pagamento Confirmado</h4>
                                                <p className="text-xs text-muted-foreground mt-0.5 mb-2">10 Set, 11:00</p>
                                                <p className="text-xs text-muted-foreground">Fatura #4022 paga via PIX.</p>
                                            </div>
                                        </div>

                                        <button className="w-full mt-6 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-secondary/50 transition-colors uppercase tracking-wider">
                                            Carregar mais atividades
                                        </button>
                                    </div>

                                    {/* Task & Billing Column */}
                                    <div className="space-y-6">

                                        {/* Pending Tasks */}
                                        <div className="bg-card border border-border/50 rounded-2xl p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="font-bold text-foreground">Tarefas Pendentes</h3>
                                                <button className="p-1 hover:bg-secondary rounded text-primary"><Plus className="w-4 h-4" /></button>
                                            </div>

                                            <div className="space-y-3">
                                                {stats.allTasks && stats.allTasks.filter(t => t.status === 'pending').slice(0, 5).length > 0 ? (
                                                    stats.allTasks.filter(t => t.status === 'pending').slice(0, 5).map(task => (
                                                        <div key={task.id} className="flex items-center gap-3 group">
                                                            <div className="w-4 h-4 rounded border border-primary/50 flex items-center justify-center">
                                                                <div className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">{task.title}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">Nenhuma tarefa pendente.</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Billing Summary */}
                                        <div className="bg-card border border-border/50 rounded-2xl p-6">
                                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                                <DollarSign className="w-5 h-5 text-emerald-500" />
                                                Faturamento
                                            </h3>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-secondary/20 rounded-xl p-3 border border-border/50">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Pendente</p>
                                                    <p className="text-lg font-black text-foreground">
                                                        R$ {transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </p>
                                                </div>
                                                <div className="bg-secondary/20 rounded-xl p-3 border border-border/50">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Última Fatura</p>
                                                    <p className="text-lg font-black text-foreground">
                                                        R$ {transactions.filter(t => t.type === 'income').length > 0
                                                            ? Number(transactions.filter(t => t.type === 'income')[0].amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                                                            : '0,00'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 flex justify-between items-center border border-blue-100 dark:border-blue-500/20">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-blue-500" />
                                                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Próxima Fatura:</span>
                                                </div>
                                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                                    {transactions.find(t => t.type === 'income' && t.status === 'pending')
                                                        ? new Date(transactions.find(t => t.type === 'income' && t.status === 'pending').date).toLocaleDateString()
                                                        : '-'}
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'projects' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="text-center py-12 text-muted-foreground">
                                    Lista completa de projetos aqui...
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
};

export default ClientDetails;
