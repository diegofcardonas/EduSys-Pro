
import React, { useState, useEffect } from 'react';
import { User, Transaction, TransactionType, TransactionStatus } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    DollarIcon, 
    TrendUpIcon, 
    TrendDownIcon, 
    WalletIcon, 
    SearchIcon, 
    PlusIcon, 
    EditIcon, 
    TrashIcon, 
    XIcon, 
    SaveIcon,
    AlertIcon,
    CheckCircleIcon
} from '../Icons';

interface FinanceProps {
  users: User[];
}

const Finance: React.FC<FinanceProps> = ({ users }) => {
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const { addNotification } = useNotification();

    // --- State ---
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filterType, setFilterType] = useState<TransactionType | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
    
    const initialFormState: Partial<Transaction> = {
        title: '',
        amount: 0,
        type: 'Income',
        category: 'Tuition',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        relatedUserId: '',
        description: ''
    };
    const [formData, setFormData] = useState<Partial<Transaction>>(initialFormState);

    // --- Data Management ---
    useEffect(() => {
        const stored = localStorage.getItem('edusys_transactions');
        if (stored) {
            setTransactions(JSON.parse(stored));
        } else {
            // Seed Mock Data if empty
            const mocks: Transaction[] = [
                { id: 't1', title: 'Tuition - Fall 2023', amount: 1200, type: 'Income', category: 'Tuition', date: '2023-09-01', status: 'Paid', relatedUserId: users.find(u=>u.role==='Student')?.id },
                { id: 't2', title: 'Teacher Salaries', amount: 4500, type: 'Expense', category: 'Salary', date: '2023-09-30', status: 'Pending' },
                { id: 't3', title: 'Library Maintenance', amount: 300, type: 'Expense', category: 'Maintenance', date: '2023-10-05', status: 'Paid' },
                { id: 't4', title: 'Alumni Donation', amount: 5000, type: 'Income', category: 'Donation', date: '2023-10-10', status: 'Paid' },
            ];
            setTransactions(mocks);
        }
    }, [users]); // Re-run if users load late, to check relations

    useEffect(() => {
        if (transactions.length > 0) {
            localStorage.setItem('edusys_transactions', JSON.stringify(transactions));
        }
    }, [transactions]);

    // --- Computed Logic ---
    const filteredTransactions = transactions.filter(tr => {
        const matchesType = filterType === 'All' || tr.type === filterType;
        const matchesSearch = tr.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              tr.category.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const pendingAmount = transactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);

    // --- CRUD Handlers ---
    const handleAdd = () => {
        setEditingTransaction(null);
        setFormData(initialFormState);
        setIsModalOpen(true);
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setFormData({ ...transaction });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (id: string) => setDeleteConfirmation(id);

    const confirmDelete = () => {
        if (deleteConfirmation) {
            setTransactions(prev => prev.filter(t => t.id !== deleteConfirmation));
            addNotification(t('transactionDeletedSuccess'), 'success');
            setDeleteConfirmation(null);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return;

        if (editingTransaction) {
            setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...formData } as Transaction : t));
            addNotification(t('transactionUpdatedSuccess'), 'success');
        } else {
            const newTransaction: Transaction = {
                id: `tr_${Date.now()}`,
                ...formData as Transaction
            };
            setTransactions(prev => [newTransaction, ...prev]);
            addNotification(t('transactionCreatedSuccess'), 'success');
        }
        setIsModalOpen(false);
    };

    // Quick Toggle Status in Table
    const toggleStatus = (transaction: Transaction) => {
        const nextStatus: TransactionStatus = 
            transaction.status === 'Paid' ? 'Pending' : 
            transaction.status === 'Pending' ? 'Overdue' : 'Paid';
        
        setTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, status: nextStatus } : t));
    };

    // --- UI Helpers ---
    const getStatusColor = (status: TransactionStatus) => {
        switch(status) {
            case 'Paid': return { bg: '#D1FAE5', color: '#065F46' };
            case 'Pending': return { bg: '#FEF3C7', color: '#92400E' };
            case 'Overdue': return { bg: '#FEE2E2', color: '#991B1B' };
        }
    };

    const getUserName = (id?: string) => users.find(u => u.id === id)?.name || '-';

    return (
        <div style={styles.container}>
            {/* KPI Cards */}
            <div style={styles.statsGrid}>
                <div style={{...styles.statCard, backgroundColor: colors.card}}>
                    <div style={{...styles.statIcon, backgroundColor: '#D1FAE5', color: '#059669'}}>
                        <TrendUpIcon />
                    </div>
                    <div>
                        <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('income')}</p>
                        <h3 style={{...styles.statValue, color: colors.text}}>${totalIncome.toLocaleString()}</h3>
                    </div>
                </div>
                <div style={{...styles.statCard, backgroundColor: colors.card}}>
                    <div style={{...styles.statIcon, backgroundColor: '#FEE2E2', color: '#DC2626'}}>
                        <TrendDownIcon />
                    </div>
                    <div>
                        <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('expenses')}</p>
                        <h3 style={{...styles.statValue, color: colors.text}}>${totalExpense.toLocaleString()}</h3>
                    </div>
                </div>
                <div style={{...styles.statCard, backgroundColor: colors.card}}>
                    <div style={{...styles.statIcon, backgroundColor: '#DBEAFE', color: '#2563EB'}}>
                        <WalletIcon />
                    </div>
                    <div>
                        <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('netBalance')}</p>
                        <h3 style={{...styles.statValue, color: netBalance >= 0 ? colors.success : colors.danger}}>${netBalance.toLocaleString()}</h3>
                    </div>
                </div>
                 <div style={{...styles.statCard, backgroundColor: colors.card}}>
                    <div style={{...styles.statIcon, backgroundColor: '#FEF3C7', color: '#D97706'}}>
                        <AlertIcon />
                    </div>
                    <div>
                        <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('pendingPayments')}</p>
                        <h3 style={{...styles.statValue, color: colors.text}}>${pendingAmount.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div style={{...styles.toolbar, backgroundColor: colors.card, borderBottomColor: colors.border}}>
                <div style={styles.toolbarLeft}>
                     <div style={{...styles.searchContainer, backgroundColor: colors.inputBg, borderColor: colors.border}}>
                        <SearchIcon />
                        <input 
                            style={{...styles.searchInput, color: colors.text}} 
                            placeholder={t('searchTransactions')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={styles.filterGroup}>
                        {['All', 'Income', 'Expense'].map(type => (
                            <button
                                key={type}
                                style={filterType === type 
                                    ? {...styles.filterBtn, backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary}
                                    : {...styles.filterBtn, backgroundColor: colors.card, color: colors.textSecondary, borderColor: colors.border}
                                }
                                onClick={() => setFilterType(type as TransactionType | 'All')}
                            >
                                {t(type.toLowerCase())}
                            </button>
                        ))}
                    </div>
                </div>
                <button style={{...styles.addBtn, backgroundColor: colors.primary}} onClick={handleAdd}>
                    <PlusIcon /> {t('addTransaction')}
                </button>
            </div>

            {/* Transactions Table */}
            <div style={{...styles.tableContainer, backgroundColor: colors.card}}>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('date')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('title')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('category')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('linkedUser')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('amount')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('status')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary}}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length > 0 ? filteredTransactions.map(tr => (
                                <tr key={tr.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                    <td style={{...styles.td, color: colors.textSecondary}}>{tr.date}</td>
                                    <td style={{...styles.td, color: colors.text, fontWeight: 500}}>{tr.title}</td>
                                    <td style={{...styles.td, color: colors.textSecondary}}>
                                        <span style={{...styles.catBadge, backgroundColor: colors.secondaryBg}}>{t(tr.category.toLowerCase())}</span>
                                    </td>
                                    <td style={{...styles.td, color: colors.textSecondary}}>{getUserName(tr.relatedUserId)}</td>
                                    <td style={{...styles.td, fontWeight: 600, color: tr.type === 'Income' ? colors.success : colors.danger}}>
                                        {tr.type === 'Income' ? '+' : '-'}${tr.amount.toLocaleString()}
                                    </td>
                                    <td style={styles.td}>
                                        <button 
                                            style={{...styles.statusBadge, ...getStatusColor(tr.status)}}
                                            onClick={() => toggleStatus(tr)}
                                            title="Click to toggle status"
                                        >
                                            {t(tr.status.toLowerCase())}
                                        </button>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button style={{...styles.iconBtn, color: colors.primary}} onClick={() => handleEdit(tr)}><EditIcon /></button>
                                            <button style={{...styles.iconBtn, color: colors.danger}} onClick={() => handleDeleteClick(tr.id)}><TrashIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{padding: '2rem', textAlign: 'center', color: colors.textSecondary}}>{t('noTransactionsFound')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={{...styles.modalContent, backgroundColor: colors.card}}>
                         <div style={styles.modalHeader}>
                            <h3 style={{...styles.modalTitle, color: colors.text}}>
                                {editingTransaction ? t('editTransaction') : t('addTransaction')}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('type')}</label>
                                    <select 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.type}
                                        onChange={e => setFormData({...formData, type: e.target.value as TransactionType})}
                                    >
                                        <option value="Income">{t('income')}</option>
                                        <option value="Expense">{t('expense')}</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('category')}</label>
                                    <select 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        {formData.type === 'Income' ? (
                                            <>
                                                <option value="Tuition">{t('tuition')}</option>
                                                <option value="Donation">{t('donation')}</option>
                                                <option value="Grant">{t('grant')}</option>
                                                <option value="Other">{t('other')}</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="Salary">{t('salary')}</option>
                                                <option value="Maintenance">{t('maintenance')}</option>
                                                <option value="Utilities">{t('utilities')}</option>
                                                <option value="Supplies">{t('supplies')}</option>
                                                <option value="Other">{t('other')}</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('title')}</label>
                                <input 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('amount')}</label>
                                    <input 
                                        type="number"
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('date')}</label>
                                    <input 
                                        type="date"
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.date}
                                        onChange={e => setFormData({...formData, date: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            
                            {/* Dynamic User Linking */}
                            {(formData.category === 'Tuition' || formData.category === 'Salary') && (
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('linkedUser')}</label>
                                    <select 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.relatedUserId}
                                        onChange={e => setFormData({...formData, relatedUserId: e.target.value})}
                                    >
                                        <option value="">{t('selectUser')}</option>
                                        {users
                                            .filter(u => formData.category === 'Tuition' ? u.role === 'Student' : u.role === 'Professor')
                                            .map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}

                             <div style={styles.formGroup}>
                                <label style={{...styles.label, color: colors.textSecondary}}>{t('status')}</label>
                                <select 
                                    style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                    value={formData.status}
                                    onChange={e => setFormData({...formData, status: e.target.value as TransactionStatus})}
                                >
                                    <option value="Paid">{t('paid')}</option>
                                    <option value="Pending">{t('pending')}</option>
                                    <option value="Overdue">{t('overdue')}</option>
                                </select>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={styles.cancelBtn}>
                                    {t('cancel')}
                                </button>
                                <button type="submit" style={{...styles.saveBtn, backgroundColor: colors.primary}}>
                                    <SaveIcon /> {t('saveChanges')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteConfirmation && (
                 <div style={styles.modalOverlay}>
                    <div style={{...styles.confirmContent, backgroundColor: colors.card}}>
                        <h3 style={{...styles.confirmTitle, color: colors.text}}>{t('deleteTransaction')}</h3>
                        <p style={{...styles.confirmText, color: colors.textSecondary}}>
                            {t('confirmDeleteTransaction')}
                        </p>
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={() => setDeleteConfirmation(null)}>
                                {t('cancel')}
                            </button>
                            <button style={{...styles.deleteBtn, backgroundColor: colors.danger}} onClick={confirmDelete}>
                                {t('deleteTransaction')}
                            </button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    statsGrid: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    statCard: {
        flex: 1,
        minWidth: '200px',
        padding: '1.5rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    statIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        margin: 0,
        fontSize: '0.85rem',
        fontWeight: 500,
    },
    statValue: {
        margin: '0.25rem 0 0',
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    toolbar: {
        padding: '1rem',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        borderBottom: '1px solid',
    },
    toolbarLeft: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderRadius: '8px',
        padding: '0.6rem 1rem',
        gap: '0.5rem',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '0.95rem',
        minWidth: '200px',
    },
    filterGroup: {
        display: 'flex',
        gap: '0.5rem',
    },
    filterBtn: {
        padding: '0.6rem 1rem',
        border: '1px solid',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    tableContainer: {
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    },
    tableWrapper: {
        overflowX: 'auto',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        padding: '1rem',
        textAlign: 'left',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    tr: {
        borderBottom: '1px solid',
    },
    td: {
        padding: '1rem',
        fontSize: '0.95rem',
        verticalAlign: 'middle',
    },
    catBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
    },
    statusBadge: {
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.8rem',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
    },
    actions: {
        display: 'flex',
        gap: '0.5rem',
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Modal
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modalContent: {
        padding: '2rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        opacity: 0.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flex: 1,
    },
    row: {
        display: 'flex',
        gap: '1rem',
    },
    label: {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    input: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        marginTop: '1rem',
    },
    cancelBtn: {
        padding: '0.75rem 1rem',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        background: 'transparent',
        color: '#64748B',
        fontWeight: 600,
        cursor: 'pointer',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    confirmContent: {
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    confirmTitle: {
        margin: '0 0 1rem 0',
    },
    confirmText: {
        marginBottom: '2rem',
    },
    deleteBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
};

export default Finance;
