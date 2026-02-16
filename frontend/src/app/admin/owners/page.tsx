'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import styles from '../../../components/admin/admin.module.scss';

interface Owner {
  id: number;
  OFirstName: string;
  OLastName: string;
  OMiddleName?: string;
  email: string;
  OStreetAddr1?: string;
  OCity?: string;
  OState?: string;
  OZip?: string;
  is_out_of_state: boolean;
  OProperty_id?: number;
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

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [formData, setFormData] = useState({
    OFirstName: '',
    OLastName: '',
    OMiddleName: '',
    email: '',
    OStreetAddr1: '',
    OCity: '',
    OState: '',
    OZip: '',
    is_out_of_state: false,
    OProperty_id: ''
  });

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const result = await adminAPI.owners.getAll();
      if (result.success && result.data && Array.isArray(result.data.owners)) {
        setOwners(result.data.owners);
      } else if (result.success && Array.isArray(result.data)) {
        // Handle case where it might return array directly or wrapped
        setOwners(result.data);
      }
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        OProperty_id: formData.OProperty_id ? parseInt(formData.OProperty_id) : null
      };

      let result;
      if (editingOwner) {
        result = await adminAPI.owners.update(editingOwner.id, payload);
      } else {
        result = await adminAPI.owners.create(payload);
      }

      if (result.success) {
        alert(editingOwner ? 'Owner updated successfully' : 'Owner created successfully');
        setShowForm(false);
        setEditingOwner(null);
        resetForm();
        fetchOwners();
      } else {
        alert(result.error || 'Failed to save owner');
      }
    } catch (error) {
      console.error('Error saving owner:', error);
      alert('Failed to save owner');
    }
  };

  const deleteOwner = async (id: number) => {
    if (!confirm('Are you sure you want to delete this owner?')) return;

    try {
      const result = await adminAPI.owners.delete(id);
      if (result.success) {
        alert('Owner deleted successfully');
        fetchOwners();
      } else {
        alert(result.error || 'Failed to delete owner');
      }
    } catch (error) {
      console.error('Error deleting owner:', error);
      alert('Failed to delete owner');
    }
  };

  const editOwner = (owner: Owner) => {
    setEditingOwner(owner);
    setFormData({
      OFirstName: owner.OFirstName || '',
      OLastName: owner.OLastName || '',
      OMiddleName: owner.OMiddleName || '',
      email: owner.email || '',
      OStreetAddr1: owner.OStreetAddr1 || '',
      OCity: owner.OCity || '',
      OState: owner.OState || '',
      OZip: owner.OZip || '',
      is_out_of_state: owner.is_out_of_state || false,
      OProperty_id: owner.OProperty_id?.toString() || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      OFirstName: '',
      OLastName: '',
      OMiddleName: '',
      email: '',
      OStreetAddr1: '',
      OCity: '',
      OState: '',
      OZip: '',
      is_out_of_state: false,
      OProperty_id: ''
    });
  };

  const filteredOwners = owners.filter(owner =>
    owner.OFirstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.OLastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.loading}>Loading owners...</div>;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1>Owner Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingOwner(null);
            resetForm();
          }}
          className={styles.btnPrimary}
        >
          Add New Owner
        </button>
      </div>

      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingOwner ? 'Edit Owner' : 'Create New Owner'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.OFirstName}
                    onChange={(e) => setFormData({ ...formData, OFirstName: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Middle Name</label>
                  <input
                    type="text"
                    value={formData.OMiddleName}
                    onChange={(e) => setFormData({ ...formData, OMiddleName: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={formData.OLastName}
                    onChange={(e) => setFormData({ ...formData, OLastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Street Address</label>
                <input
                  type="text"
                  value={formData.OStreetAddr1}
                  onChange={(e) => setFormData({ ...formData, OStreetAddr1: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.OCity}
                    onChange={(e) => setFormData({ ...formData, OCity: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.OState}
                    onChange={(e) => setFormData({ ...formData, OState: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Zip</label>
                  <input
                    type="text"
                    value={formData.OZip}
                    onChange={(e) => setFormData({ ...formData, OZip: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Property ID</label>
                <input
                  type="number"
                  value={formData.OProperty_id}
                  onChange={(e) => setFormData({ ...formData, OProperty_id: e.target.value })}
                  placeholder="Enter property ID to associate"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={formData.is_out_of_state}
                    onChange={(e) => setFormData({ ...formData, is_out_of_state: e.target.checked })}
                  />
                  Out of State Owner
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>
                  {editingOwner ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOwner(null);
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
          placeholder="Search by name or email..."
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
              <th>Name</th>
              <th>Email</th>
              <th>Property Address</th>
              <th>State</th>
              <th>Out of State</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOwners.map(owner => (
              <tr key={owner.id}>
                <td>{owner.id}</td>
                <td>{owner.OFirstName} {owner.OLastName}</td>
                <td>{owner.email}</td>
                <td>
                  {owner.property?.proaddress
                    ? `${owner.property.proaddress.PStreetNum} ${owner.property.proaddress.PStreetName}, ${owner.property.proaddress.Pcity}`
                    : 'N/A'}
                </td>
                <td>{owner.OState || 'N/A'}</td>
                <td>
                  <span className={owner.is_out_of_state ? styles.badgeSuccess : styles.badgeDefault}>
                    {owner.is_out_of_state ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button onClick={() => editOwner(owner)} className={styles.btnEdit}>
                      Edit
                    </button>
                    <button onClick={() => deleteOwner(owner.id)} className={styles.btnDelete}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOwners.length === 0 && (
          <div className={styles.emptyState}>
            <p>No owners found</p>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Owners</h3>
          <p className={styles.statValue}>{owners.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Out of State</h3>
          <p className={styles.statValue}>{owners.filter(o => o.is_out_of_state).length}</p>
        </div>
      </div>
    </div>
  );
}
