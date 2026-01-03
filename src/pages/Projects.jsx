import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Calendar, DollarSign, User, LayoutGrid, Kanban, MoreVertical, CheckCircle, Clock, Edit2, Trash2, ClipboardList, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectCard = ({ project, onEdit, onDelete, onManageTasks }) => {
    const getProgress = (status) => {
        if (status === 'completed') return 100;
        if (status === 'in_progress') return 45; // Em andamento - representativo
        return 10; // Pendente
    };

    const progress = getProgress(project.status);
    const taskCompletion = project.tasks && project.tasks.length > 0
        ? Math.round((project.tasks.filter(t => t.status === 'completed').length / project.tasks.length) * 100)
        : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-all group relative flex flex-col justify-between h-full"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                <button
                    onClick={(e) => { e.stopPropagation(); onManageTasks(project); }}
                    className="p-1.5 hover:bg-indigo-500/20 rounded-lg text-muted-foreground hover:text-indigo-500 transition-colors bg-card/80"
                    title="Subtarefas"
                >
                    <ClipboardList className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(project); }}
                    className="p-1.5 hover:bg-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors bg-card/80"
                    title="Editar"
                >
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja excluir este projeto definitivamente?')) {
                            onDelete(project.id);
                        }
                    }}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors bg-card/80"
                    title="Excluir"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors pr-12">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border shrink-0 ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        project.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                            'bg-blue-500/10 text-blue-500 border-blue-500/20'
                        }`}>
                        {project.status === 'pending' ? 'Pendente' : project.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{project.description || 'Nenhuma descrição detalhada fornecida.'}</p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <span>Progresso Geral</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className={`h-full rounded-full ${project.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                project.status === 'in_progress' ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]' :
                                    'bg-yellow-500'
                                }`}
                        />
                    </div>
                </div>

                {/* Tasks Progress */}
                {project.tasks && project.tasks.length > 0 && (
                    <div className="space-y-2 mb-6 p-3 rounded-xl bg-secondary/20 border border-border/50">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            <span className="flex items-center gap-1"><ClipboardList className="w-3 h-3" /> Tarefas</span>
                            <span>{project.tasks.filter(t => t.status === 'completed').length}/{project.tasks.length}</span>
                        </div>
                        <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${taskCompletion}%` }}
                                className="h-full bg-indigo-500 rounded-full"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between">
                    {project.clients && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                                {project.clients.name.substring(0, 1).toUpperCase()}
                            </div>
                            <span className="font-medium text-foreground/80">{project.clients.name}</span>
                        </div>
                    )}
                    <div className="font-bold text-foreground text-sm">
                        R$ {Number(project.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-secondary/30 px-2 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Sem prazo'}</span>
                    </div>
                    {project.status === 'completed' ? (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                            <CheckCircle className="w-3.5 h-3.5" /> Entregue
                        </div>
                    ) : (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase">
                            <Clock className="w-3.5 h-3.5 animate-pulse" /> Ativo
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const KanbanColumn = ({ title, status, projects, onStatusChange, onEdit, onDelete, onManageTasks }) => (
    <div className="bg-secondary/10 rounded-3xl p-4 min-h-[500px] border border-border/30">
        <div className="flex justify-between items-center mb-6 px-2">
            <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{title}</h4>
            <span className="bg-secondary px-2 py-0.5 rounded text-[10px] font-bold text-foreground">{projects.length}</span>
        </div>
        <div className="space-y-4">
            <AnimatePresence>
                {projects.map(project => (
                    <div key={project.id} className="relative group">
                        <ProjectCard
                            project={project}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onManageTasks={onManageTasks}
                        />
                        <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            {status !== 'completed' && (
                                <button
                                    onClick={() => onStatusChange(project.id, status === 'pending' ? 'in_progress' : 'completed')}
                                    className="p-1 px-2 bg-primary/80 text-white rounded-md text-[10px] font-bold backdrop-blur-sm"
                                >
                                    Mover
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </AnimatePresence>
            {projects.length === 0 && (
                <div className="h-32 rounded-2xl border-2 border-dashed border-border/20 flex items-center justify-center text-xs text-muted-foreground italic text-center px-4">
                    Nenhum projeto {title.toLowerCase()}
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
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [projectForm, setProjectForm] = useState({ name: '', description: '', value: '', deadline: '', client_id: '', status: 'pending' });
    const [editingId, setEditingId] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase.from('projects').select('*, clients(name), tasks(*)').order('created_at', { ascending: false });
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
            fetchProjects();
        }
    };

    const handleDeleteProject = async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (!error) {
            setProjects(projects.filter(p => p.id !== id));
        } else {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const handleEditProject = (project) => {
        setProjectForm({
            name: project.name,
            description: project.description || '',
            value: project.value,
            deadline: project.deadline ? project.deadline.split('T')[0] : '',
            client_id: project.client_id,
            status: project.status
        });
        setEditingId(project.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setProjectForm({ name: '', description: '', value: '', deadline: '', client_id: '', status: 'pending' });
        setEditMode(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                const { error } = await supabase.from('projects').update(projectForm).eq('id', editingId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('projects').insert([projectForm]).select();
                if (error) throw error;
            }
            fetchProjects();
            setIsModalOpen(false);
        } catch (error) {
            alert('Erro ao processar: ' + error.message);
        }
    };

    const handleManageTasks = (project) => {
        setSelectedProject(project);
        setIsTasksModalOpen(true);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        const { data, error } = await supabase.from('tasks').insert([{
            title: newTaskTitle,
            project_id: selectedProject.id,
            status: 'pending'
        }]).select();

        if (!error) {
            const updatedProject = {
                ...selectedProject,
                tasks: [...(selectedProject.tasks || []), data[0]]
            };
            setSelectedProject(updatedProject);
            setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
            setNewTaskTitle('');
        }
    };

    const toggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id);

        if (!error) {
            const updatedTasks = selectedProject.tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
            const updatedProject = { ...selectedProject, tasks: updatedTasks };
            setSelectedProject(updatedProject);
            setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        }
    };

    const deleteTask = async (taskId) => {
        const { error } = await supabase.from('tasks').delete().eq('id', taskId);
        if (!error) {
            const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId);
            const updatedProject = { ...selectedProject, tasks: updatedTasks };
            setSelectedProject(updatedProject);
            setProjects(projects.map(p => p.id === selectedProject.id ? updatedProject : p));
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Projetos</h2>
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
                        onClick={handleOpenCreate}
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
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={handleEditProject}
                            onDelete={handleDeleteProject}
                            onManageTasks={handleManageTasks}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <KanbanColumn
                        title="Pendente"
                        status="pending"
                        projects={projects.filter(p => p.status === 'pending')}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onManageTasks={handleManageTasks}
                    />
                    <KanbanColumn
                        title="Em Andamento"
                        status="in_progress"
                        projects={projects.filter(p => p.status === 'in_progress')}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onManageTasks={handleManageTasks}
                    />
                    <KanbanColumn
                        title="Concluído"
                        status="completed"
                        projects={projects.filter(p => p.status === 'completed')}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEditProject}
                        onDelete={handleDeleteProject}
                        onManageTasks={handleManageTasks}
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
                        <h3 className="text-2xl font-bold mb-6 text-foreground">{editMode ? 'Editar Projeto' : 'Criar Novo Projeto'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Título do Projeto</label>
                                <input
                                    type="text" required
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={projectForm.name}
                                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                                <select
                                    required
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={projectForm.client_id}
                                    onChange={e => setProjectForm({ ...projectForm, client_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(c => <option key={c.id} value={c.id} className="bg-card text-foreground">{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Valor Estimado</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={projectForm.value}
                                        onChange={e => setProjectForm({ ...projectForm, value: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Data de Entrega</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={projectForm.deadline}
                                        onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-xl font-bold shadow-lg shadow-primary/20">
                                    {editMode ? 'Salvar Alterações' : 'Lançar Projeto'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Modal Subtarefas */}
            {isTasksModalOpen && selectedProject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTasksModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-card w-full max-w-xl p-8 rounded-3xl border border-border shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
                    >
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-foreground">Tarefas: {selectedProject.name}</h3>
                            <p className="text-muted-foreground">Gerencie o checklist do projeto.</p>
                        </div>

                        <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Nova tarefa..."
                                className="flex-1 bg-secondary/30 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                            />
                            <button type="submit" className="bg-primary text-white p-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg">
                                <Plus className="w-6 h-6" />
                            </button>
                        </form>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {selectedProject.tasks && selectedProject.tasks.length > 0 ? (
                                selectedProject.tasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border/50 group/task hover:bg-secondary/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => toggleTaskStatus(task)} className={`transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-muted-foreground hover:text-primary'}`}>
                                                {task.status === 'completed' ? <CheckSquare className="w-6 h-6" /> : <Square className="w-6 h-6" />}
                                            </button>
                                            <span className={`text-sm font-medium ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                                {task.title}
                                            </span>
                                        </div>
                                        <button onClick={() => deleteTask(task.id)} className="p-2 opacity-0 group-hover/task:opacity-100 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed border-border/20 rounded-2xl">
                                    Nenhuma tarefa criada. Comece adicionando uma acima!
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center">
                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                {selectedProject.tasks ? selectedProject.tasks.filter(t => t.status === 'completed').length : 0} de {selectedProject.tasks ? selectedProject.tasks.length : 0} concluídas
                            </div>
                            <button onClick={() => setIsTasksModalOpen(false)} className="px-6 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-foreground font-bold text-sm uppercase">Fechar</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Projects;

