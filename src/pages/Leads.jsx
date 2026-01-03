import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, MoreVertical, Phone, Mail, Filter, BadgeCheck, MessageSquare, ExternalLink, Clock, Trash, X } from 'lucide-react';
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

    const isStale = (date) => {
        const diff = new Date() - new Date(date);
        return diff > 7 * 24 * 60 * 60 * 1000; // 7 days
    };

    const openWhatsApp = (phone, name) => {
        const cleanPhone = phone.replace(/\D/g, '');
        const message = `Olá ${name}, tudo bem? Sou da AceWeb e gostaria de dar continuidade ao seu orçamento.`;
        window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`bg-card/40 backdrop-blur-md border p-6 rounded-2xl hover:border-primary/50 transition-all group relative h-full flex flex-col justify-between ${isStale(lead.created_at) && lead.status !== 'converted' ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-border/50'
                }`}
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => confirm('Excluir lead?') && onDelete(lead.id)}
                    className="p-1.5 hover:bg-rose-500/20 rounded-lg text-muted-foreground hover:text-rose-500 transition-colors"
                >
                    <Trash className="w-4 h-4" />
                </button>
            </div>

            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-2">
                        <div className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border w-fit ${statusColors[lead.status]}`}>
                            {statusLabels[lead.status]}
                        </div>
                        {isStale(lead.created_at) && lead.status !== 'converted' && (
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3" /> PRECISA DE CONTATO
                            </div>
                        )}
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-1 leading-tight text-foreground">{lead.name}</h3>
                <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">Origem: {lead.source || 'Direct'}</p>

                <div className="space-y-2 mb-6">
                    {lead.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground group/mail truncate">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{lead.email}</span>
                        </div>
                    )}
                    {lead.phone && (
                        <button
                            onClick={() => openWhatsApp(lead.phone, lead.name)}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-400 transition-colors w-full group/wa"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover/wa:opacity-100 transition-opacity" />
                        </button>
                    )}
                </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex gap-2">
                <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                    className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider focus:ring-1 focus:ring-primary/50 outline-none transition-all cursor-pointer text-foreground"
                >
                    {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val} className="bg-card">{label}</option>
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
    const [searchTerm, setSearchTerm] = useState('');
    const [showOnlyStale, setShowOnlyStale] = useState(false);
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

    const isStale = (date) => {
        if (!date) return false;
        const diff = new Date() - new Date(date);
        return diff > 7 * 24 * 60 * 60 * 1000;
    };

    const filteredLeads = leads.filter(lead => {
        const matchesStatus = filter === 'all' || lead.status === filter;
        const matchesSearch = !searchTerm ||
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.phone?.includes(searchTerm);
        const matchesStale = !showOnlyStale || (isStale(lead.created_at) && lead.status !== 'converted');

        return matchesStatus && matchesSearch && matchesStale;
    });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Leads</h2>
                    <p className="text-muted-foreground mt-1">Capture e converta novas oportunidades.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            className="w-full bg-secondary/30 border border-border/50 rounded-2xl pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40 focus:bg-card/50 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted/20 rounded-full transition-colors">
                                <X className="w-3 h-3 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-primary/20 w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-5 h-5 font-black" />
                        Novo Lead
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-secondary/10 p-2 rounded-3xl border border-border/30 backdrop-blur-sm">
                {[
                    { val: 'all', label: 'Todos' },
                    { val: 'new', label: 'Novos' },
                    { val: 'contacted', label: 'Em Contato' },
                    { val: 'qualified', label: 'Qualificados' },
                    { val: 'proposal_sent', label: 'Proposta' },
                    { val: 'converted', label: 'Ganhos' },
                    { val: 'lost', label: 'Perdidos' }
                ].map(stat => (
                    <button
                        key={stat.val}
                        onClick={() => setFilter(stat.val)}
                        className={`px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${filter === stat.val
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                            }`}
                    >
                        {stat.label}
                    </button>
                ))}
                <div className="w-[2px] h-8 bg-border/50 mx-2 hidden sm:block" />
                <button
                    onClick={() => setShowOnlyStale(!showOnlyStale)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${showOnlyStale
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'text-amber-500 hover:bg-amber-500/10'
                        }`}
                >
                    <Clock className="w-4 h-4" />
                    Encantados
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : (
                <>
                    {filteredLeads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    ) : (
                        <div className="text-center py-32 rounded-3xl border-2 border-dashed border-border/30 bg-card/20 backdrop-blur-sm">
                            <div className="bg-secondary/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                            </div>
                            <h3 className="text-xl font-bold text-muted-foreground">Nenhum lead encontrado</h3>
                            <p className="text-sm text-muted-foreground mt-2">Tente ajustar seus filtros ou busca.</p>
                            <button
                                onClick={() => { setFilter('all'); setSearchTerm(''); setShowOnlyStale(false); }}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Limpar todos os filtros
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal Lançamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-2xl relative z-10"
                    >
                        <h3 className="text-2xl font-bold mb-6 text-foreground">Novo Lead</h3>
                        <form onSubmit={handleCreateLead} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Nome Completo</label>
                                <input
                                    type="text" required
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newLead.name}
                                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">WhatsApp</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newLead.phone}
                                        onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">E-mail</label>
                                    <input
                                        type="email"
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newLead.email}
                                        onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Origem do Lead</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Instagram, Indicação..."
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newLead.source}
                                    onChange={e => setNewLead({ ...newLead, source: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-muted-foreground">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20">Registrar Lead</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Leads;
