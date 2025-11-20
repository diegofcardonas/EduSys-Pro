

import React, { useState, useEffect } from 'react';
import { User, Role, UserStatus } from '../../types';
import { ShieldIcon, UsersIcon, CheckCircleIcon, BanIcon, EditIcon, PlusIcon, SearchIcon, TrashIcon, SaveIcon, XIcon, DownloadIcon, ChevronLeftIcon, ChevronRightIcon, SortIcon } from '../Icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotification } from '../../contexts/NotificationContext';

// Enhanced Interface for Form handling to support Student/Teacher specific fields
interface ExtendedUserFormData {
    id?: string;
    name: string;
    email: string;
    role: Role;
    status: UserStatus;
    phoneNumber?: string;
    address?: string;
    department?: string;
    office?: string; // Teacher specific
    gradeLevel?: number; // Student specific
    parentContact?: string; // Student specific
}

interface UserManagementProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    autoOpenAdd?: boolean;
}

const ITEMS_PER_PAGE = 5;

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, autoOpenAdd }) => {
    const { t } = useLanguage();
    const { colors, theme } = useTheme();
    const { addNotification } = useNotification();

    // State
    const [filterRole, setFilterRole] = useState<Role | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Form State
    const initialFormState: ExtendedUserFormData = {
        name: '',
        email: '',
        role: 'Student',
        status: 'Active',
        phoneNumber: '',
        address: '',
        department: '',
        office: '',
        gradeLevel: 10,
        parentContact: ''
    };
    const [formData, setFormData] = useState<ExtendedUserFormData>(initialFormState);

    // Handle Auto Open from Dashboard Quick Actions
    useEffect(() => {
        if (autoOpenAdd) {
            handleAddNew();
        }
    }, [autoOpenAdd]);

    // Helpers
    const getRoleColor = (role: Role) => {
        switch (role) {
            case 'Administrator': return '#7C3AED'; // Violet
            case 'Professor': return '#2563EB'; // Blue
            case 'Student': return '#059669'; // Emerald
            default: return colors.textSecondary;
        }
    };

    const getRoleIconBg = (role: Role) => {
        if (theme === 'dark') return 'rgba(255,255,255,0.05)';
        switch (role) {
            case 'Administrator': return '#EDE9FE';
            case 'Professor': return '#DBEAFE';
            case 'Student': return '#D1FAE5';
            default: return '#F1F5F9';
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = t('nameRequired');
        if (!formData.email.trim()) {
            newErrors.email = t('emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('invalidEmail');
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Filtering and Sorting
    const filteredUsers = users.filter(user => {
        const matchesRole = filterRole === 'All' || user.role === filterRole;
        const matchesSearch = user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm);
        return matchesRole && matchesSearch;
    }).sort((a, b) => {
        // Simple sort by Join Date for now
        const dateA = new Date(a.joinDate).getTime();
        const dateB = new Date(b.joinDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Handlers
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
        setCurrentPage(1); // Reset to first page on search
    };

    const handleSortToggle = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Join Date', 'Phone'];
        const rows = filteredUsers.map(u => [u.id, u.name, u.email, u.role, u.status, u.joinDate, u.phoneNumber || '']);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addNotification(t('financialReportGenerated'), 'success'); // Reuse msg or add specific
    };

    const handleAddNew = () => {
        setEditingUser(null);
        setFormData(initialFormState);
        setErrors({});
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        // Cast user to any to access specific props safely for form population
        const u: any = user; 
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phoneNumber: user.phoneNumber || '',
            address: user.address || '',
            department: user.department || (u.department) || '',
            office: u.office || '',
            gradeLevel: u.gradeLevel || 10,
            parentContact: u.parentContact || ''
        });
        setErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteClick = (userId: string) => {
        setDeleteConfirmation(userId);
    };

    const confirmDelete = () => {
        if (deleteConfirmation) {
            setUsers(prev => prev.filter(u => u.id !== deleteConfirmation));
            addNotification(t('userDeletedSuccess'), 'success');
            setDeleteConfirmation(null);
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Clean up data based on role (remove unnecessary fields)
        const cleanData: any = { ...formData };
        if (formData.role !== 'Student') {
            delete cleanData.gradeLevel;
            delete cleanData.parentContact;
        }
        if (formData.role !== 'Professor') {
            delete cleanData.office;
            // Note: 'department' is kept for generic use or professor use
        }

        if (editingUser) {
            // Update
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...cleanData } : u));
            addNotification(t('userUpdatedSuccess'), 'success');
        } else {
            // Create
            const newUser: any = {
                id: Date.now().toString(),
                ...cleanData,
                joinDate: new Date().toISOString().split('T')[0],
                avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
                // Add specific IDs based on role mock logic
                ...(formData.role === 'Student' ? { studentId: `S${Date.now()}` } : {}),
                ...(formData.role === 'Professor' ? { teacherId: `T${Date.now()}` } : {})
            };
            setUsers(prev => [newUser, ...prev]);
            addNotification(t('userCreatedSuccess'), 'success');
        }
        setIsModalOpen(false);
    };

    // Stats
    const totalUsers = users.length;
    const activeUsersCount = users.filter(u => u.status === 'Active').length;
    
    // Styles helpers
    const modalStyle = {
        ...styles.modalContent,
        backgroundColor: colors.card,
        color: colors.text
    };

    return (
        <div style={styles.container}>
            {/* Modal Overlay */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={modalStyle}>
                        <div style={styles.modalHeader}>
                            <h2 style={{...styles.modalTitle, color: colors.text}}>{editingUser ? t('editUser') : t('createUser')}</h2>
                            <button style={{...styles.closeButton, color: colors.textSecondary}} onClick={() => setIsModalOpen(false)}>
                                <XIcon />
                            </button>
                        </div>
                        <form onSubmit={handleSave} style={styles.form}>
                            {/* Row 1: Name & Email */}
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('name')} <span style={{color: colors.danger}}>*</span></label>
                                    <input 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: errors.name ? colors.danger : colors.border}} 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                    {errors.name && <span style={{...styles.errorText, color: colors.danger}}>{errors.name}</span>}
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('email')} <span style={{color: colors.danger}}>*</span></label>
                                    <input 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: errors.email ? colors.danger : colors.border}} 
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                    {errors.email && <span style={{...styles.errorText, color: colors.danger}}>{errors.email}</span>}
                                </div>
                            </div>

                            {/* Row 2: Role & Status */}
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('role')}</label>
                                    <select 
                                        style={{...styles.select, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.role}
                                        onChange={e => setFormData({...formData, role: e.target.value as Role})}
                                    >
                                        <option value="Student">{t('student')}</option>
                                        <option value="Professor">{t('professor')}</option>
                                        <option value="Administrator">{t('administrator')}</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('status')}</label>
                                    <select 
                                        style={{...styles.select, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}}
                                        value={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.value as UserStatus})}
                                    >
                                        <option value="Active">{t('active')}</option>
                                        <option value="Inactive">{t('inactive')}</option>
                                        <option value="Suspended">{t('suspended')}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Fields Based on Role */}
                            {formData.role === 'Student' && (
                                <div style={{...styles.roleSpecificSection, backgroundColor: colors.secondaryBg, borderColor: colors.border}}>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={{...styles.label, color: colors.textSecondary}}>{t('gradeLevel')}</label>
                                            <input 
                                                type="number"
                                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                                value={formData.gradeLevel}
                                                onChange={e => setFormData({...formData, gradeLevel: parseInt(e.target.value) || 0})}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={{...styles.label, color: colors.textSecondary}}>{t('parentContact')}</label>
                                            <input 
                                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                                value={formData.parentContact}
                                                onChange={e => setFormData({...formData, parentContact: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.role === 'Professor' && (
                                <div style={{...styles.roleSpecificSection, backgroundColor: colors.secondaryBg, borderColor: colors.border}}>
                                    <div style={styles.formRow}>
                                        <div style={styles.formGroup}>
                                            <label style={{...styles.label, color: colors.textSecondary}}>{t('departmentLabel')}</label>
                                            <input 
                                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                                value={formData.department}
                                                onChange={e => setFormData({...formData, department: e.target.value})}
                                            />
                                        </div>
                                        <div style={styles.formGroup}>
                                            <label style={{...styles.label, color: colors.textSecondary}}>{t('officeLabel')}</label>
                                            <input 
                                                style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                                value={formData.office}
                                                onChange={e => setFormData({...formData, office: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Common Extended Fields */}
                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('phone')}</label>
                                    <input 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                        value={formData.phoneNumber}
                                        placeholder="+1 (555) 000-0000"
                                        onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={{...styles.label, color: colors.textSecondary}}>{t('address')}</label>
                                    <input 
                                        style={{...styles.input, backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border}} 
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button type="button" style={{...styles.cancelBtn, borderColor: colors.border, color: colors.textSecondary, backgroundColor: colors.secondaryBg}} onClick={() => setIsModalOpen(false)}>
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

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                 <div style={styles.modalOverlay}>
                    <div style={{...styles.confirmContent, backgroundColor: colors.card}}>
                        <h3 style={{...styles.confirmTitle, color: colors.text}}>{t('deleteUser')}</h3>
                        <p style={{...styles.confirmText, color: colors.textSecondary}}>
                            {t('confirmDelete', { name: users.find(u => u.id === deleteConfirmation)?.name || '' })}
                        </p>
                        <div style={styles.modalActions}>
                            <button style={{...styles.cancelBtn, borderColor: colors.border, color: colors.textSecondary, backgroundColor: colors.secondaryBg}} onClick={() => setDeleteConfirmation(null)}>
                                {t('cancel')}
                            </button>
                            <button style={styles.deleteBtn} onClick={confirmDelete}>
                                {t('deleteUser')}
                            </button>
                        </div>
                    </div>
                 </div>
            )}

            {/* Stats & Role Defs Section */}
            <div style={styles.topSection}>
                <div style={styles.statsGrid}>
                    <div style={{...styles.statCard, backgroundColor: colors.card, boxShadow: theme === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'}}>
                        <div style={{...styles.statIcon, backgroundColor: colors.secondaryBg, color: colors.primary}}><UsersIcon /></div>
                        <div>
                            <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('totalUsers')}</p>
                            <p style={{...styles.statValue, color: colors.text}}>{totalUsers}</p>
                        </div>
                    </div>
                    <div style={{...styles.statCard, backgroundColor: colors.card, boxShadow: theme === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.05)'}}>
                        <div style={{...styles.statIcon, color: '#059669', backgroundColor: theme === 'dark' ? 'rgba(5, 150, 105, 0.2)' : '#D1FAE5'}}><CheckCircleIcon /></div>
                        <div>
                            <p style={{...styles.statLabel, color: colors.textSecondary}}>{t('activeUsers')}</p>
                            <p style={{...styles.statValue, color: colors.text}}>{activeUsersCount}</p>
                        </div>
                    </div>
                </div>
                
                <div style={{...styles.roleLegend, backgroundColor: colors.card, borderColor: colors.border}}>
                     <div style={{...styles.legendItem, color: colors.textSecondary}}>
                         <span style={{...styles.legendDot, backgroundColor: getRoleColor('Administrator')}}></span> {t('administrator')}
                     </div>
                     <div style={{...styles.legendItem, color: colors.textSecondary}}>
                         <span style={{...styles.legendDot, backgroundColor: getRoleColor('Professor')}}></span> {t('professor')}
                     </div>
                     <div style={{...styles.legendItem, color: colors.textSecondary}}>
                         <span style={{...styles.legendDot, backgroundColor: getRoleColor('Student')}}></span> {t('student')}
                     </div>
                </div>
            </div>

            {/* User List */}
            <div style={{...styles.tableCard, backgroundColor: colors.card}}>
                <div style={{...styles.tableHeader, borderBottomColor: colors.border}}>
                    <div style={styles.headerLeft}>
                         <h3 style={{...styles.tableTitle, color: colors.text}}>{filterRole === 'All' ? t('all') : t(filterRole.toLowerCase())} {t('usersList')}</h3>
                         <div style={{...styles.searchContainer, backgroundColor: colors.inputBg, borderColor: colors.border}}>
                            <SearchIcon />
                            <input 
                                style={{...styles.searchInput, color: colors.text}} 
                                placeholder={t('searchUsers')} 
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                         </div>
                    </div>
                    <div style={styles.filters}>
                         <button 
                            style={{...styles.actionBtnSecondary, borderColor: colors.border, color: colors.textSecondary}} 
                            onClick={handleSortToggle}
                            title="Sort by Date"
                        >
                            <SortIcon />
                        </button>
                        <button 
                            style={{...styles.actionBtnSecondary, borderColor: colors.border, color: colors.textSecondary}} 
                            onClick={handleExport}
                            title={t('exportCsv')}
                        >
                            <DownloadIcon />
                        </button>

                        <div style={styles.filterGroup}>
                            {['All', 'Administrator', 'Professor', 'Student'].map(role => (
                                <button 
                                    key={role}
                                    style={
                                        filterRole === role 
                                        ? {...styles.filterBtn, backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary} 
                                        : {...styles.filterBtn, backgroundColor: colors.card, color: colors.textSecondary, borderColor: colors.border}
                                    } 
                                    onClick={() => {
                                        setFilterRole(role as Role | 'All');
                                        setCurrentPage(1);
                                    }}
                                >
                                    {role === 'All' ? t('all') : t(role.toLowerCase())}
                                </button>
                            ))}
                        </div>
                        <button style={{...styles.addBtn, backgroundColor: colors.success}} onClick={handleAddNew}>
                            <PlusIcon /> {t('addUser')}
                        </button>
                    </div>
                </div>
                <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('name')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('email')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('phone')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('role')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('status')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('joined')}</th>
                                <th style={{...styles.th, backgroundColor: colors.secondaryBg, color: colors.textSecondary, borderColor: colors.border}}>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                                <tr key={user.id} style={{...styles.tr, borderBottomColor: colors.border}}>
                                    <td style={{...styles.td, color: colors.text}}>
                                        <div style={styles.userCell}>
                                            <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt="" style={styles.avatar} />
                                            <span style={{...styles.userName, color: colors.text}}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{...styles.td, color: colors.textSecondary}}>{user.email}</td>
                                    <td style={{...styles.td, color: colors.textSecondary}}>{user.phoneNumber || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={{...styles.roleBadge, backgroundColor: getRoleIconBg(user.role), color: getRoleColor(user.role)}}>
                                            {t(user.role.toLowerCase())}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.statusCell}>
                                            {user.status === 'Active' ? <CheckCircleIcon /> : <BanIcon />}
                                            <span style={{
                                                color: user.status === 'Active' ? colors.success : user.status === 'Suspended' ? colors.danger : colors.textSecondary
                                            }}>{t(user.status.toLowerCase())}</span>
                                        </div>
                                    </td>
                                    <td style={{...styles.td, color: colors.textSecondary}}>{user.joinDate}</td>
                                    <td style={styles.td}>
                                        <div style={styles.actionButtons}>
                                            <button 
                                                style={{...styles.actionBtn, backgroundColor: colors.secondaryBg, color: colors.primary}} 
                                                onClick={() => handleEdit(user)}
                                                title={t('editUser')}
                                            >
                                                <EditIcon />
                                            </button>
                                            <button 
                                                style={{...styles.actionBtn, backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2', color: colors.danger}} 
                                                onClick={() => handleDeleteClick(user.id)}
                                                title={t('deleteUser')}
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} style={{...styles.emptyState, color: colors.textSecondary}}>
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div style={{...styles.paginationContainer, borderTopColor: colors.border}}>
                    <div style={{color: colors.textSecondary, fontSize: '0.9rem'}}>
                        {t('page')} {currentPage} {t('of')} {totalPages}
                    </div>
                    <div style={styles.paginationButtons}>
                        <button 
                            style={{...styles.pageBtn, color: currentPage === 1 ? colors.textSecondary : colors.text, opacity: currentPage === 1 ? 0.5 : 1}}
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeftIcon /> {t('previous')}
                        </button>
                        <button 
                             style={{...styles.pageBtn, color: currentPage === totalPages ? colors.textSecondary : colors.text, opacity: currentPage === totalPages ? 0.5 : 1}}
                             disabled={currentPage === totalPages}
                             onClick={() => handlePageChange(currentPage + 1)}
                        >
                            {t('next')} <ChevronRightIcon />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'relative',
        paddingBottom: '2rem',
    },
    // Modal Styles
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
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px', // Wider for grid layout
        padding: '2rem',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.2s ease-out',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    confirmContent: {
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        textAlign: 'center',
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    modalTitle: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    closeButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.5rem',
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
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    roleSpecificSection: {
        padding: '1rem',
        borderRadius: '8px',
        border: '1px solid',
        marginTop: '0.5rem',
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
        transition: 'border-color 0.2s',
        width: '100%',
        boxSizing: 'border-box',
    },
    select: {
        padding: '0.75rem',
        borderRadius: '8px',
        border: '1px solid',
        fontSize: '1rem',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    errorText: {
        fontSize: '0.8rem',
        marginTop: '0.25rem',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    cancelBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: '1px solid',
        fontWeight: 600,
        cursor: 'pointer',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    deleteBtn: {
        padding: '0.75rem 1.5rem',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#DC2626',
        color: '#fff',
        fontWeight: 600,
        cursor: 'pointer',
    },
    confirmTitle: {
        margin: '0 0 1rem 0',
    },
    confirmText: {
        marginBottom: '2rem',
    },
    
    // Top Section Stats
    topSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
    },
    statsGrid: {
        display: 'flex',
        gap: '1.5rem',
    },
    statCard: {
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        minWidth: '200px',
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        margin: 0,
        fontSize: '0.8rem',
    },
    statValue: {
        margin: '0.25rem 0 0',
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    roleLegend: {
        display: 'flex',
        gap: '1.5rem',
        padding: '0.75rem 1.5rem',
        borderRadius: '12px',
        border: '1px solid',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        fontWeight: 500,
    },
    legendDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
    },

    // Table Styles
    tableCard: {
        borderRadius: '12px',
        overflow: 'hidden',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
    },
    tableHeader: {
        padding: '1.5rem',
        borderBottom: '1px solid',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    tableTitle: {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: 600,
        textTransform: 'capitalize',
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        border: '1px solid',
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        gap: '0.5rem',
    },
    searchInput: {
        border: 'none',
        background: 'transparent',
        outline: 'none',
        fontSize: '0.9rem',
        minWidth: '200px',
    },
    filters: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
    },
    filterGroup: {
        display: 'flex',
        gap: '0.5rem',
    },
    filterBtn: {
        padding: '0.5rem 1rem',
        border: '1px solid',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s',
    },
    addBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 600,
        color: '#fff',
    },
    actionBtnSecondary: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        borderRadius: '6px',
        border: '1px solid',
        background: 'transparent',
        cursor: 'pointer',
    },
    tableWrapper: {
        overflowX: 'auto',
        flex: 1,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '800px',
    },
    th: {
        padding: '1rem 1.5rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: '1px solid',
    },
    tr: {
        borderBottom: '1px solid',
        transition: 'background-color 0.1s',
    },
    td: {
        padding: '1rem 1.5rem',
        fontSize: '0.9rem',
        verticalAlign: 'middle',
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    userName: {
        fontWeight: 600,
    },
    roleBadge: {
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
    },
    statusCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontWeight: 500,
        fontSize: '0.85rem',
    },
    actionButtons: {
        display: 'flex',
        gap: '0.5rem',
    },
    actionBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        cursor: 'pointer',
        border: 'none',
        transition: 'transform 0.1s',
    },
    emptyState: {
        textAlign: 'center',
        padding: '3rem',
        fontStyle: 'italic',
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderTop: '1px solid',
    },
    paginationButtons: {
        display: 'flex',
        gap: '0.5rem',
    },
    pageBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        padding: '0.5rem',
    }
};

export default UserManagement;