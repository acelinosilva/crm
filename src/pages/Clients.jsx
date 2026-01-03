import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Plus, Search, MoreVertical, Phone, Mail, MapPin, MessageSquare, ExternalLink, Edit2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ClientCard = ({ client, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const openWhatsApp = (phone, name) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${name}, tudo bem? Sou da AceWeb e gostaria de falar sobre o nosso projeto.`;
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate(`/clients/${client.id}`)}
            className="bg-card/50 backdrop-blur-sm border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-all group relative cursor-pointer"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                <button
                    onClick={(e) => { e.stopPropagation(); onEdit(client); }}
                    className="p-2 hover:bg-primary/20 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    title="Editar"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Deseja excluir este cliente? Todos os projetos vinculados serão afetados.')) {
                            onDelete(client.id);
                        }
                    }}
                    className="p-2 hover:bg-rose-500/20 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                    title="Excluir"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                    {client.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-bold text-lg leading-tight text-foreground">{client.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Cliente desde {new Date(client.created_at).toLocaleDateString()}</p>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border/50">
                {client.email && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <div className="p-1.5 rounded-md bg-secondary/50 text-primary">
                            <Mail className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{client.email}</span>
                    </div>
                )}
                {client.phone && (
                    <button
                        onClick={(e) => { e.stopPropagation(); openWhatsApp(client.phone, client.name); }}
                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-emerald-400 transition-colors w-full group/wa"
                    >
                        <div className="p-1.5 rounded-md bg-secondary/50 text-emerald-500 group-hover/wa:bg-emerald-500/20 transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <span>{client.phone}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover/wa:opacity-100 transition-opacity" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', document: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = async (id) => {
        try {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;
            setClients(clients.filter(c => c.id !== id));
        } catch (error) {
            alert('Erro ao excluir cliente: ' + error.message);
        }
    };

    const handleEditClient = (client) => {
        setClientForm({
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            document: client.document || ''
        });
        setEditingId(client.id);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setClientForm({ name: '', email: '', phone: '', document: '' });
        setEditMode(false);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                const { error } = await supabase.from('clients').update(clientForm).eq('id', editingId);
                if (error) throw error;
                fetchClients();
            } else {
                const { data, error } = await supabase.from('clients').insert([clientForm]).select();
                if (error) throw error;
                setClients([data[0], ...clients]);
            }
            setIsModalOpen(false);
        } catch (error) {
            alert('Erro ao processar: ' + error.message);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Clientes</h2>
                    <p className="text-muted-foreground mt-1">Gerencie seus clientes e oportunidades.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Cliente
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : clients.length === 0 ? (
                <div className="text-center p-20 border border-dashed border-border rounded-3xl bg-card/30">
                    <p className="text-muted-foreground">Nenhum cliente encontrado. Adicione o primeiro!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onDelete={handleDeleteClient}
                            onEdit={handleEditClient}
                        />
                    ))}
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-card w-full max-w-lg p-6 rounded-2xl border border-border shadow-2xl relative z-10"
                    >
                        <h3 className="text-xl font-bold mb-6 text-foreground">{editMode ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Acme Corp"
                                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                                    value={clientForm.name}
                                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <input
                                        type="email"
                                        placeholder="contato@empresa.com"
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                                        value={clientForm.email}
                                        onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/50 text-foreground"
                                        value={clientForm.phone}
                                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border/50">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {editMode ? 'Salvar Alterações' : 'Salvar Cliente'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Clients;

