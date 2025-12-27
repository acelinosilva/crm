import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
    Plus, TrendingUp, TrendingDown, DollarSign,
    Calendar, ArrowUpRight, ArrowDownRight, Filter,
    Download, PieChart, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const TransactionItem = ({ transaction }) => (
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
                <p className="font-bold text-white leading-tight">{transaction.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{transaction.category || 'Geral'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`font-black text-lg ${transaction.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <div className="w-24 h-1 bg-secondary/30 rounded-full mt-2 overflow-hidden">
                <div
                    className={`h-full ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: '100%' }}
                />
            </div>
        </div>
    </motion.div>
);

const Financial = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTransaction, setNewTransaction] = useState({ description: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0], category: '' });

    useEffect(() => {
        fetchTransactions();
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

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        const { data, error } = await supabase.from('transactions').insert([newTransaction]).select();
        if (!error) {
            setTransactions([data[0], ...transactions]);
            setIsModalOpen(false);
            setNewTransaction({ description: '', amount: '', type: 'income', date: new Date().toISOString().split('T')[0], category: '' });
        }
    };

    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalBalance = income - expenses;

    const barData = [
        { name: 'Entradas', value: income, color: '#10b981' },
        { name: 'Saídas', value: expenses, color: '#f43f5e' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Gestão Financeira</h2>
                    <p className="text-muted-foreground mt-1">Fluxo de caixa e saúde da Agência.</p>
                </div>
                <div className="flex gap-3">
                    <button className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-white hover:bg-secondary/30 transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        Lançar Movimentação
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 backdrop-blur-sm relative overflow-hidden group">
                    <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-primary/10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Saldo Geral</p>
                    <h3 className="text-4xl font-black text-white">R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    <div className="flex items-center gap-2 mt-4 text-emerald-400 text-sm font-bold">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+12.5% este mês</span>
                    </div>
                </motion.div>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/50 flex items-center justify-between group">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total de Entradas</p>
                            <h4 className="text-2xl font-black text-emerald-500">R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/50 flex items-center justify-between group">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Total de Saídas</p>
                            <h4 className="text-2xl font-black text-rose-500">R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                        </div>
                        <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Transações Recentes
                        </h3>
                        <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Ver Todas</button>
                    </div>
                    <div className="bg-card/20 rounded-3xl border border-border/30 p-2 space-y-2">
                        {transactions.length === 0 ? (
                            <div className="text-center py-20 text-muted-foreground italic">Nenhuma transação registrada.</div>
                        ) : (
                            transactions.map(t => <TransactionItem key={t.id} transaction={t} />)
                        )}
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-md">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-primary" />
                        Distribuição
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
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
                                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Lucro Bruto
                            </span>
                            <span className="font-bold text-white">R$ {(income - expenses).toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary" /> Margem
                            </span>
                            <span className="font-bold text-white">{income > 0 ? ((income - expenses) / income * 100).toFixed(1) : 0}%</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modal Lançamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg p-8 rounded-3xl border border-border shadow-2xl relative z-10">
                        <h3 className="text-2xl font-bold mb-6 text-white">Nova Movimentação</h3>
                        <form onSubmit={handleCreateTransaction} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 p-1 bg-secondary/30 rounded-2xl border border-border">
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'income' })}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-muted-foreground'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setNewTransaction({ ...newTransaction, type: 'expense' })}
                                    className={`py-3 rounded-xl text-sm font-bold transition-all ${newTransaction.type === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-muted-foreground'}`}
                                >
                                    Despesa
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Descrição</label>
                                <input
                                    type="text" required
                                    className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newTransaction.description}
                                    onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Valor (R$)</label>
                                    <input
                                        type="number" step="0.01" required
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newTransaction.amount}
                                        onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase ml-1">Data</label>
                                    <input
                                        type="date" required
                                        className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newTransaction.date}
                                        onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">Cancelar</button>
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
