import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus, TrendingUp, TrendingDown, DollarSign,
    Calendar, ArrowUpRight, ArrowDownRight, Filter,
    Download, PieChart, Activity, Receipt, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TransactionItem = ({ transaction, onStatusChange }) => (
    <motion.div
        layout
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-card/30 border border-border/50 hover:bg-card/50 transition-all group"
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                {transaction.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div>
                <p className="font-bold text-foreground leading-tight">{transaction.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {transaction.category || 'Geral'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    {transaction.status && (
                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${transaction.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                    )}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className={`font-black text-lg ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
            </div>
            {transaction.status === 'pending' && (
                <button
                    onClick={() => onStatusChange(transaction.id, 'paid')}
                    className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-colors"
                    title="Marcar como Pago"
                >
                    <CheckCircle2 className="w-5 h-5" />
                </button>
            )}
        </div>
    </motion.div>
);

const Financial = () => {
    const [transactions, setTransactions] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [view, setView] = useState('transactions'); // 'transactions' or 'invoices'
    const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0], category: '', status: 'paid', project_id: '' });

    useEffect(() => {
        fetchTransactions();
        fetchProjects();
    }, []);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
            if (error) throw error;
            setTransactions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('id, name');
        if (data) setProjects(data);
    };

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.from('transactions').insert([newTransaction]).select();
        if (!error) {
            setTransactions([data[0], ...transactions]);
            setIsModalOpen(false);
            setNewTransaction({ description: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0], category: '', status: 'paid', project_id: '' });
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        const { error } = await supabase.from('transactions').update({ status: newStatus }).eq('id', id);
        if (!error) {
            setTransactions(transactions.map(t => t.id === id ? { ...t, status: newStatus } : t));
        }
    };

    const income = transactions.filter(t => t.type === 'income' && (t.status === 'paid' || !t.status)).reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const pendingIncome = transactions.filter(t => t.type === 'income' && t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalBalance = income - expenses;

    const barData = [
        { name: 'Entradas', value: income, color: '#10b981' },
        { name: 'Saídas', value: expenses, color: '#f43f5e' },
    ];

    const filteredList = view === 'transactions'
        ? transactions
        : transactions.filter(t => t.type === 'income' && (t.status === 'pending' || t.status === 'paid'));

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestão Financeira</h2>
                    <p className="text-muted-foreground mt-1">Fluxo de caixa e saúde da Agência.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-secondary/30 p-1 rounded-xl border border-border flex gap-1">
                        <button
                            onClick={() => setView('transactions')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'transactions' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Activity className="w-4 h-4 inline mr-2" /> Transações
                        </button>
                        <button
                            onClick={() => setView('invoices')}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'invoices' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <Receipt className="w-4 h-4 inline mr-2" /> Faturas
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        {view === 'transactions' ? 'Nova Transação' : 'Emitir Fatura'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
                    <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Saldo em Caixa</p>
                    <h3 className="text-4xl font-black text-foreground">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Saldo Realizado</span>
                    </div>
                </motion.div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/50 flex items-center justify-between group">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">A Receber (Faturas)</p>
                            <h4 className="text-2xl font-black text-amber-500">R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/50 flex items-center justify-between group text-rose-500">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1 text-muted-foreground">Saídas Totais</p>
                            <h4 className="text-2xl font-black">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-500/10 transition-colors group-hover:bg-rose-500 group-hover:text-white">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                            {view === 'transactions' ? (
                                <><Activity className="w-5 h-5 text-primary" /> Transações Recentes</>
                            ) : (
                                <><Receipt className="w-5 h-5 text-primary" /> Cobranças e Faturas</>
                            )}
                        </h3>
                    </div>
                    <div className="bg-card/20 rounded-3xl border border-border/30 p-2 space-y-2">
                        {filteredList.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground italic">Nenhum registro encontrado nesta categoria.</div>
                        ) : (
                            filteredList.map(t => <TransactionItem key={t.id} transaction={t} onStatusChange={handleStatusChange} />)
                        )}
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-md sticky top-8">
                    <h3 className="text-lg font-bold text-foreground mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Saúde Financeira
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Lucro Realizado
                            </span>
                            <span className="font-bold text-foreground">R$ {totalBalance.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-amber-500" /> Potencial (Projetado)
                            </span>
                            <span className="font-bold text-amber-500">R$ {(totalBalance + pendingIncome).toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modal Lançamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-2xl relative z-10">
                        <h3 className="text-2xl font-bold mb-6 text-foreground">{view === 'transactions' ? 'Nova Transação' : 'Nova Fatura'}</h3>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-1 bg-secondary/30 rounded-2xl border border-border">
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income', status: view === 'invoices' ? 'pending' : 'paid' })}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground'}`}
                                >
                                    Receita / Fatura
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', status: 'paid' })}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-muted-foreground'}`}
                                >
                                    Despesa
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Descrição</label>
                                <input
                                    type="text" required
                                    placeholder="Ex: Projeto Web AceWeb"
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Valor (R$)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Data</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Vincular Projeto (Opcional)</label>
                                <select
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newTransaction.project_id}
                                    onChange={e => setNewTransaction({ ...newTransaction, project_id: e.target.value })}
                                >
                                    <option value="">Nenhum projeto</option>
                                    {projects.map(p => <option key={p.id} value={p.id} className="bg-card">{p.name}</option>)}
                                </select>
                            </div>

                            {view === 'invoices' && (
                                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-500 font-medium">
                                    As faturas são registradas como "Pendentes" e não afetam o saldo atual até serem marcadas como pagas.
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-muted-foreground">Cancelar</button>
                                <button type="submit" className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20">Salvar Registro</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Financial;
