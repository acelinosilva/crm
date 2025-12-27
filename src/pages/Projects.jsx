import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, DollarSign, User, LayoutGrid, Kanban, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCard = ({ project }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-all group relative flex flex-col justify-between h-full"
    >
        <div>
            <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg leading-tight text-white">{project.name}</h3>
                <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                    {project.status === 'pending' ? 'Pendente' : project.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description || 'Sem descrição.'}</p>
        </div>

        <div className="space-y-3 pt-4 border-t border-border/50">
            {project.clients && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-medium text-white/80">{project.clients.name}</span>
                </div>
            )}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Sem prazo'}</span>
                </div>
                <div className="font-bold text-white">
                    R$ {Number(project.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
            </div>
        </div>
    </motion.div>
);

const KanbanColumn = ({ title, status, projects, onStatusChange }) => (
    <div className="bg-secondary/10 rounded-3xl p-4 min-h-[500px] border border-border/30">
        <div className="flex justify-between items-center mb-6 px-2">
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{title}</h4>
            <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-white">{projects.length}</span>
        </div>
        <div className="space-y-4">
            <AnimatePresence>
                {projects.map(project => (
                    <div key={project.id} className="relative group cursor-grab active:cursor-grabbing">
                        <ProjectCard project={project} />
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {status !== 'completed' && (
                                <button
                                    onClick={() => onStatusChange(project.id, status === 'pending' ? 'in_progress' : 'completed')}
                                    className="p-1 px-2 bg-primary/20 text-primary rounded-md text-[10px] font-bold"
                                >
                                    Mover
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </AnimatePresence>
            {projects.length === 0 && (
                <div className="h-32 rounded-2xl border-2 border-dashed border-border/20 flex items-center justify-center text-xs text-muted-foreground italic">
                    Arraste ou crie aqui
                </div>
            )}
        </div>
    </div>
);

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban'); // 'grid' or 'kanban'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', value: '', deadline: '', client_id: '', status: 'pending' });

    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase.from('projects').select('*, clients(name)').order('created_at', { ascending: false });
            if (error) throw error;
            setProjects(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        const { data } = await supabase.from('clients').select('id, name');
        if (data) setClients(data);
    };

    const handleStatusChange = async (id, newStatus) => {
        const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setProjects(projects.map(p => p.id === id ? { ...p, status: newStatus } : p));
            fetchProjects(); // Refresh to ensure data consistency
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.from('projects').insert([newProject]).select();
        if (!error) {
            fetchProjects();
            setIsModalOpen(false);
            setNewProject({ name: '', description: '', value: '', deadline: '', client_id: '', status: 'pending' });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Projetos</h2>
                    <p className="text-muted-foreground mt-1">Gerencie a produção da AceWeb.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-secondary/30 p-1 rounded-xl border border-border flex gap-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('kanban')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`}
                        >
                            <Kanban className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Projeto
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <KanbanColumn
                        title="Pendente"
                        status="pending"
                        projects={projects.filter(p => p.status === 'pending')}
                        onStatusChange={handleStatusChange}
                    />
                    <KanbanColumn
                        title="Em Andamento"
                        status="in_progress"
                        projects={projects.filter(p => p.status === 'in_progress')}
                        onStatusChange={handleStatusChange}
                    />
                    <KanbanColumn
                        title="Concluído"
                        status="completed"
                        projects={projects.filter(p => p.status === 'completed')}
                        onStatusChange={handleStatusChange}
                    />
                </div>
            )}

            {/* Modal Projeto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-2xl relative z-10"
                    >
                        <h3 className="text-2xl font-bold mb-6 text-white">Criar Novo Projeto</h3>
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Título do Projeto</label>
                                <input
                                    type="text" required
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                                <select
                                    required
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newProject.client_id}
                                    onChange={e => setNewProject({ ...newProject, client_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProject.value}
                                        onChange={e => setNewProject({ ...newProject, value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Data de Entrega</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProject.deadline}
                                        onChange={e => setNewProject({ ...newProject, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl hover:bg-white/5 transition-colors">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold shadow-lg shadow-primary/20">Lançar Projeto</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Projects;
