import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, MoreVertical, Phone, Mail, Filter, BadgeCheck, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LeadCard = ({ lead, onDelete, onStatusChange }) => {
    const statusColors = {
        new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        contacted: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        qualified: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        proposal_sent: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        converted: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        lost: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    const statusLabels = {
        new: 'Novo',
        contacted: 'Contatado',
        qualified: 'Qualificado',
        proposal_sent: 'Proposta Enviada',
        converted: 'Convertido',
        lost: 'Perdido',
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/40 backdrop-blur-md border border-border/50 p-6 rounded-2xl hover:border-primary/50 transition-all group relative h-full flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${statusColors[lead.status]}`}>
                        {statusLabels[lead.status]}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => confirm('Excluir lead?') && onDelete(lead.id)}
                            className="p-1.5 hover:bg-rose-500/20 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-1 leading-tight">{lead.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">Fonte: {lead.source || 'Não informada'}</p>

                <div className="space-y-2 mb-6">
                    {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-border/50">
                <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="w-full bg-secondary/30 border border-border rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-primary/50 outline-none transition-all cursor-pointer"
                >
                    {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                    ))}
                </select>
            </div>
        </motion.div>
    );
};

const Leads = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('all');
    const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: '', status: 'new', notes: '' });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setLeads(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLead = async (id) => {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (!error) setLeads(leads.filter(l => l.id !== id));
    };

    const handleStatusChange = async (id, newStatus) => {
        const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
        }
    };

    const handleCreateLead = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.from('leads').insert([newLead]).select();
        if (!error) {
            setLeads([data[0], ...leads]);
            setIsModalOpen(false);
            setNewLead({ name: '', email: '', phone: '', source: '', status: 'new', notes: '' });
        }
    };

    const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Leads & Oportunidades</h2>
                    <p className="text-muted-foreground mt-1">Capture e converta novos negócios.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-card/40 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Todos os Status</option>
                        <option value="new">Novos</option>
                        <option value="contacted">Contatados</option>
                        <option value="qualified">Qualificados</option>
                        <option value="proposal_sent">Proposta Enviada</option>
                        <option value="converted">Convertidos</option>
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Lead
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredLeads.map(lead => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onDelete={handleDeleteLead}
                                onStatusChange={handleStatusChange}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modal Lead */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-2xl relative z-10"
                    >
                        <h3 className="text-2xl font-bold mb-6">Cadastrar Oportunidade</h3>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Nome do Lead / Empresa</label>
                                <input
                                    type="text" required
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                        value={newLead.email}
                                        onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                                    <input
                                        type="text"
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                        value={newLead.phone}
                                        onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Origem (Ex: Instagram, Indicação)</label>
                                <input
                                    type="text"
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-white"
                                    value={newLead.source}
                                    onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20">Salvar Lead</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Leads;
