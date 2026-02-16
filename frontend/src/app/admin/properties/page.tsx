'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import styles from '../../../components/admin/admin.module.scss';

interface Property {
  id: number;
  motive_type_id: number;
  PBeds: string;
  PBaths: string;
  Pcity: string;
  Pstate: string;
  Pcounty: string;
  motiveType?: { name: string; code: string };
  local_image_path?: string;
  proaddress?: {
    PStreetNum: string;
    PStreetName: string;
    Pcity: string;
    PState: string;
    Pzip: string;
    price: number;
    beds: string;
    baths: string;
    proptype: string;
  };
  owners?: Array<{ OFirstName: string; OLastName: string }>;
  // Motive Details
  probates?: any[];
  divorces?: any[];
  taxLiens?: any[];
  auctions?: any[];
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMotiveType, setFilterMotiveType] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const result = await adminAPI.properties.getAll();
      if (result.success && Array.isArray(result.data)) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProperty = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const result = await adminAPI.properties.delete(id);
      if (result.success) {
        alert('Property deleted successfully');
        fetchProperties();
      } else {
        alert(result.error || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch =
      prop.proaddress?.Pcity?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.proaddress?.PState?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.proaddress?.PStreetName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMotiveType = !filterMotiveType || prop.motiveType?.name === filterMotiveType;

    return matchesSearch && matchesMotiveType;
  });

  const uniqueMotiveTypes = Array.from(new Set(properties.map(p => p.motiveType?.name).filter(Boolean)));

  /* CRUD State */
  const [showForm, setShowForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    PStreetNum: '',
    PStreetName: '',
    Pcity: '',
    PState: '',
    Pzip: '',
    motive_type_id: '',
    price: '',
    beds: '',
    baths: '',
    proptype: 'Single Family',
    // Motive specifics
    probates: [] as any[],
    divorces: [] as any[],
    taxLiens: [] as any[],
    auctions: [] as any[]
  });

  // Image Upload State
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        motive_type_id: Number(formData.motive_type_id),
        proaddress: {
          PStreetNum: formData.PStreetNum,
          PStreetName: formData.PStreetName,
          Pcity: formData.Pcity,
          PState: formData.PState,
          Pzip: formData.Pzip,
          price: Number(formData.price),
          beds: formData.beds,
          baths: formData.baths,
          proptype: formData.proptype
        },
        // Include motive details
        probates: formData.probates,
        divorces: formData.divorces,
        taxLiens: formData.taxLiens,
        auctions: formData.auctions
      };

      let result;
      if (editingProperty) {
        result = await adminAPI.properties.update(editingProperty.id, payload);
      } else {
        result = await adminAPI.properties.create(payload);
      }

      if (result.success) {
        alert(editingProperty ? 'Property updated successfully' : 'Property created successfully');
        setShowForm(false);
        setEditingProperty(null);
        resetForm();
        fetchProperties();
      } else {
        alert(result.error || 'Failed to save property');
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Failed to save property');
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty || !selectedImage) return;

    try {
      const result = await adminAPI.properties.uploadImage(editingProperty.id, selectedImage);
      if (result.success) {
        alert('Image uploaded successfully');
        setSelectedImage(null);
        fetchProperties(); // Refresh to show new image (if we displayed it in table)
        // Optionally keep modal open or close it
      } else {
        alert(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const deleteImage = async () => {
    if (!editingProperty) return;
    if (!confirm('Delete current image?')) return;

    try {
      const result = await adminAPI.properties.deleteImage(editingProperty.id);
      if (result.success) {
        alert('Image deleted');
        fetchProperties();
        setEditingProperty({ ...editingProperty, local_image_path: undefined });
      } else {
        alert(result.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const editProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      PStreetNum: property.proaddress?.PStreetNum || '',
      PStreetName: property.proaddress?.PStreetName || '',
      Pcity: property.proaddress?.Pcity || property.Pcity || '',
      PState: property.proaddress?.PState || property.Pstate || '',
      Pzip: property.proaddress?.Pzip || '',
      motive_type_id: property.motive_type_id?.toString() || '',
      price: property.proaddress?.price?.toString() || '',
      beds: property.proaddress?.beds || property.PBeds || '',
      baths: property.proaddress?.baths || property.PBaths || '',
      proptype: property.proaddress?.proptype || 'Single Family',
      probates: property.probates || [],
      divorces: property.divorces || [],
      taxLiens: property.taxLiens || [],
      auctions: property.auctions || []
    });
    setShowForm(true);
  };

  const openImageModal = (property: Property) => {
    setEditingProperty(property);
    setShowImageModal(true);
    setSelectedImage(null);
  };

  const resetForm = () => {
    setFormData({
      PStreetNum: '',
      PStreetName: '',
      Pcity: '',
      PState: '',
      Pzip: '',
      motive_type_id: '',
      price: '',
      beds: '',
      baths: '',
      proptype: 'Single Family',
      probates: [],
      divorces: [],
      taxLiens: [],
      auctions: []
    });
  };

  /* Helper to render motive fields based on selection */
  const renderMotiveFields = () => {
    return (
      <div className={styles.motiveSection}>
        <h3>Motive Details</h3>
        <p className={styles.hint}>Enter details specific to the motive type (Probate, Divorce, etc.)</p>

        {/* Divorce Fields */}
        <div className={styles.formGroup}>
          <label>Divorce Case Number (if applicable)</label>
          <input
            type="text"
            placeholder="Case Number"
            value={formData.divorces[0]?.case_number || ''}
            onChange={e => {
              const newDivorces = [...formData.divorces];
              if (!newDivorces[0]) newDivorces[0] = {};
              newDivorces[0].case_number = e.target.value;
              // Add required fields stub
              if (!newDivorces[0].legal_filing_date) newDivorces[0].legal_filing_date = new Date().toISOString().split('T')[0];
              if (!newDivorces[0].attorney_name) newDivorces[0].attorney_name = 'Unknown';
              setFormData({ ...formData, divorces: newDivorces });
            }}
          />
        </div>

        {/* Probate Fields */}
        <div className={styles.formGroup}>
          <label>Probate Attorney (if applicable)</label>
          <input
            type="text"
            placeholder="Attorney Name"
            value={formData.probates[0]?.attorney_name || ''}
            onChange={e => {
              const newProbates = [...formData.probates];
              if (!newProbates[0]) newProbates[0] = {};
              newProbates[0].attorney_name = e.target.value;
              // Add required fields stub
              if (!newProbates[0].case_number) newProbates[0].case_number = 'PENDING';
              if (!newProbates[0].filing_date) newProbates[0].filing_date = new Date().toISOString().split('T')[0];
              setFormData({ ...formData, probates: newProbates });
            }}
          />
        </div>

        {/* Generic note about other types */}
        <p style={{ fontSize: '0.8rem', color: '#666' }}>* Additional motive details (Tax Lien, Auction) can be added similarly.</p>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading properties...</div>;
  }

  return (
    <div className={styles.adminPage}>
      <div className={styles.pageHeader}>
        <h1>Property Management</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingProperty(null);
            resetForm();
          }}
          className={styles.btnPrimary}
        >
          Add New Property
        </button>
      </div>

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingProperty ? 'Edit Property' : 'Create New Property'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Street Number</label>
                  <input
                    type="text"
                    value={formData.PStreetNum}
                    onChange={(e) => setFormData({ ...formData, PStreetNum: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Street Name</label>
                  <input
                    type="text"
                    value={formData.PStreetName}
                    onChange={(e) => setFormData({ ...formData, PStreetName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.Pcity}
                    onChange={(e) => setFormData({ ...formData, Pcity: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>State</label>
                  <input
                    type="text"
                    value={formData.PState}
                    onChange={(e) => setFormData({ ...formData, PState: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Zip</label>
                  <input
                    type="text"
                    value={formData.Pzip}
                    onChange={(e) => setFormData({ ...formData, Pzip: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Motive Type ID</label>
                  <input
                    type="number"
                    value={formData.motive_type_id}
                    onChange={(e) => setFormData({ ...formData, motive_type_id: e.target.value })}
                    required
                    placeholder="e.g. 1 (Divorce), 2 (Probate)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Beds</label>
                  <input
                    type="text"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Baths</label>
                  <input
                    type="text"
                    value={formData.baths}
                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={formData.proptype}
                    onChange={(e) => setFormData({ ...formData, proptype: e.target.value })}
                  >
                    <option value="Single Family">Single Family</option>
                    <option value="Multi Family">Multi Family</option>
                    <option value="Condo">Condo</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Motive Fields */}
              {renderMotiveFields()}

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>
                  {editingProperty ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProperty(null);
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

      {/* IMAGE UPLOAD MODAL */}
      {showImageModal && editingProperty && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Manage Images</h2>
            <p>Property: {editingProperty.proaddress?.PStreetNum} {editingProperty.proaddress?.PStreetName}</p>

            <div className={styles.currentImage}>
              {editingProperty.local_image_path ? (
                <div>
                  <img
                    key={editingProperty.local_image_path}
                    src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${editingProperty.local_image_path}`}
                    alt="Property"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }}
                  />
                  <br />
                  <button onClick={deleteImage} className={styles.btnDelete} style={{ width: '100%' }}>
                    Delete Current Image
                  </button>
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                  <p>No image uploaded for this property.</p>
                </div>
              )}
            </div>

            <form onSubmit={handleImageUpload} className={styles.form} style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <h3>Upload New Image</h3>
              <div className={styles.formGroup}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedImage(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary} disabled={!selectedImage}>
                  Upload
                </button>
                <button type="button" onClick={() => setShowImageModal(false)} className={styles.btnSecondary}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by city, state, or street..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterMotiveType}
          onChange={(e) => setFilterMotiveType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Motive Types</option>
          {uniqueMotiveTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Motive Type</th>
              <th>Price</th>
              <th>Beds/Baths</th>
              <th>Owner</th>
              <th style={{ minWidth: '220px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProperties.map(property => (
              <tr key={property.id}>
                <td>{property.id}</td>
                <td>
                  {property.proaddress?.PStreetNum} {property.proaddress?.PStreetName}
                </td>
                <td>{property.proaddress?.Pcity || property.Pcity}</td>
                <td>{property.proaddress?.PState || property.Pstate}</td>
                <td>
                  <span className={styles.badge}>
                    {property.motiveType?.name || 'N/A'}
                  </span>
                </td>
                <td>${property.proaddress?.price?.toLocaleString() || 'N/A'}</td>
                <td>
                  {property.proaddress?.beds || property.PBeds}/{property.proaddress?.baths || property.PBaths}
                </td>
                <td>
                  {property.owners && property.owners.length > 0
                    ? `${property.owners[0].OFirstName} ${property.owners[0].OLastName}`
                    : 'N/A'}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => editProperty(property)}
                      className={styles.btnEdit}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openImageModal(property)}
                      className={styles.btnSecondary}
                      title="Manage Images"
                    >
                      Images
                    </button>
                    <button
                      onClick={() => deleteProperty(property.id)}
                      className={styles.btnDelete}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProperties.length === 0 && (
          <div className={styles.emptyState}>
            <p>No properties found matching your criteria</p>
          </div>
        )}
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <h3>Total Properties</h3>
          <p className={styles.statValue}>{properties.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Filtered Results</h3>
          <p className={styles.statValue}>{filteredProperties.length}</p>
        </div>
      </div>
    </div>
  );
}
