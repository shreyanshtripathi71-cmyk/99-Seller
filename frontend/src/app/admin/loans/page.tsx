'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import styles from '../../../components/admin/admin.module.scss';

interface Loan {
  id: number;
  property_id?: number;
  deed_id?: string;
  borrower_name?: string;
  lender_name?: string;
  lender_address?: string;
  loan_amount?: number;
  arrears_amount?: number;
  foreclosure_stage?: string;
  default_status?: string;
  lis_pendens_date?: string;
  property?: {
    proaddress?: {
      PStreetNum: string;
      PStreetName: string;
      Pcity: string;
      PState: string;
      Pzip: string;
    };
  };
}

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [formData, setFormData] = useState({
    property_id: '',
    deed_id: '',
    borrower_name: '',
    lender_name: '',
    lender_address: '',
    loan_amount: '',
    arrears_amount: '',
    foreclosure_stage: '',
    default_status: '',
    lis_pendens_date: ''
  });

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const result = await adminAPI.loans.getAll();
      if (result.success && result.data && Array.isArray(result.data.loans)) {
        setLoans(result.data.loans);
      } else if (result.success && Array.isArray(result.data)) {
        setLoans(result.data);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        property_id: formData.property_id ? parseInt(formData.property_id) : null,
        loan_amount: formData.loan_amount ? parseFloat(formData.loan_amount) : null,
        arrears_amount: formData.arrears_amount ? parseFloat(formData.arrears_amount) : null
      };

      let result;
      if (editingLoan) {
        result = await adminAPI.loans.update(editingLoan.id, payload);
      } else {
        result = await adminAPI.loans.create(payload);
      }

      if (result.success) {
        alert(editingLoan ? 'Loan updated successfully' : 'Loan created successfully');
        setShowForm(false);
        setEditingLoan(null);
        resetForm();
        fetchLoans();
      } else {
        alert(result.error || 'Failed to save loan');
      }
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Failed to save loan');
    }
  };

  const deleteLoan = async (id: number) => {
    if (!confirm('Are you sure you want to delete this loan?')) return;

    try {
      const result = await adminAPI.loans.delete(id);
      if (result.success) {
        alert('Loan deleted successfully');
        fetchLoans();
      } else {
        alert(result.error || 'Failed to delete loan');
      }
    } catch (error) {
      console.error('Error deleting loan:', error);
      alert('Failed to delete loan');
    }
  };

  const editLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setFormData({
      property_id: loan.property_id?.toString() || '',
      deed_id: loan.deed_id || '',
      borrower_name: loan.borrower_name || '',
      lender_name: loan.lender_name || '',
      lender_address: loan.lender_address || '',
      loan_amount: loan.loan_amount?.toString() || '',
      arrears_amount: loan.arrears_amount?.toString() || '',
      foreclosure_stage: loan.foreclosure_stage || '',
      default_status: loan.default_status || '',
      lis_pendens_date: loan.lis_pendens_date || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      property_id: '',
      deed_id: '',
      borrower_name: '',
      lender_name: '',
      lender_address: '',
      loan_amount: '',
      arrears_amount: '',
      foreclosure_stage: '',
      default_status: '',
      lis_pendens_date: ''
    });
  };

  const filteredLoans = loans.filter(loan =>
    loan.borrower_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.lender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loan.deed_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>Loading loans...</div>;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1>Loan Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingLoan(null);
            resetForm();
          }}
          className={styles.btnPrimary}
        >
          Add New Loan
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingLoan ? 'Edit Loan' : 'Create New Loan'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Property ID *</label>
                <input
                  type="number"
                  value={formData.property_id}
                  onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                  required
                  placeholder="Enter property ID"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Borrower Name</label>
                  <input
                    type="text"
                    value={formData.borrower_name}
                    onChange={(e) => setFormData({ ...formData, borrower_name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Deed ID</label>
                  <input
                    type="text"
                    value={formData.deed_id}
                    onChange={(e) => setFormData({ ...formData, deed_id: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Lender Name</label>
                  <input
                    type="text"
                    value={formData.lender_name}
                    onChange={(e) => setFormData({ ...formData, lender_name: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Lender Address</label>
                  <input
                    type="text"
                    value={formData.lender_address}
                    onChange={(e) => setFormData({ ...formData, lender_address: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Loan Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.loan_amount}
                    onChange={(e) => setFormData({ ...formData, loan_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Arrears Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.arrears_amount}
                    onChange={(e) => setFormData({ ...formData, arrears_amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Foreclosure Stage</label>
                  <select
                    value={formData.foreclosure_stage}
                    onChange={(e) => setFormData({ ...formData, foreclosure_stage: e.target.value })}
                  >
                    <option value="">Select Stage</option>
                    <option value="Pre-Foreclosure">Pre-Foreclosure</option>
                    <option value="Foreclosure">Foreclosure</option>
                    <option value="Auction">Auction</option>
                    <option value="REO">REO</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Default Status</label>
                  <select
                    value={formData.default_status}
                    onChange={(e) => setFormData({ ...formData, default_status: e.target.value })}
                  >
                    <option value="">Select Status</option>
                    <option value="Current">Current</option>
                    <option value="In Default">In Default</option>
                    <option value="Foreclosed">Foreclosed</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Lis Pendens Date</label>
                <input
                  type="date"
                  value={formData.lis_pendens_date}
                  onChange={(e) => setFormData({ ...formData, lis_pendens_date: e.target.value })}
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>
                  {editingLoan ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingLoan(null);
                    resetForm();
                  }}
                  className={styles.btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by borrower, lender, or deed ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Property Address</th>
              <th>Borrower</th>
              <th>Lender</th>
              <th>Loan Amount</th>
              <th>Arrears</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map(loan => (
              <tr key={loan.id}>
                <td>{loan.id}</td>
                <td>
                  {loan.property?.proaddress
                    ? `${loan.property.proaddress.PStreetNum} ${loan.property.proaddress.PStreetName}, ${loan.property.proaddress.Pcity}`
                    : `Property #${loan.property_id || 'N/A'}`}
                </td>
                <td>{loan.borrower_name || 'N/A'}</td>
                <td>{loan.lender_name || 'N/A'}</td>
                <td>${loan.loan_amount?.toLocaleString() || '0'}</td>
                <td className={loan.arrears_amount && loan.arrears_amount > 0 ? styles.textDanger : ''}>
                  ${loan.arrears_amount?.toLocaleString() || '0'}
                </td>
                <td>
                  <span className={
                    loan.default_status === 'Current' ? styles.badgeSuccess :
                      loan.default_status === 'In Default' ? styles.badgeWarning :
                        styles.badgeDanger
                  }>
                    {loan.default_status || 'N/A'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => editLoan(loan)} className={styles.btnEdit}>
                      Edit
                    </button>
                    <button onClick={() => deleteLoan(loan.id)} className={styles.btnDelete}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLoans.length === 0 && (
          <div className={styles.emptyState}>
            <p>No loans found</p>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Loans</h3>
          <p className={styles.statValue}>{loans.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Loan Amount</h3>
          <p className={styles.statValue}>
            ${loans.reduce((sum, loan) => sum + (loan.loan_amount || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Total Arrears</h3>
          <p className={styles.statValue}>
            ${loans.reduce((sum, loan) => sum + (loan.arrears_amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
