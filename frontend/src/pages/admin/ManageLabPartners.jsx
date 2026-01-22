import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ManageLabPartners = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [labPartners, setLabPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    service_zones: '',
    commission_percentage: '',
    is_active: true,
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadLabPartners();
  }, [search]);

  const loadLabPartners = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllLabPartners({ search });
      setLabPartners(response.data.lab_partners);
    } catch (error) {
      console.error('Error loading lab partners:', error);
      alert('Error loading lab partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        service_zones: formData.service_zones
          ? formData.service_zones.split(',').map((zone) => zone.trim()).filter(Boolean)
          : [],
        commission_percentage: formData.commission_percentage ? parseFloat(formData.commission_percentage) : null,
      };

      if (editingLab) {
        await adminService.updateLabPartner(editingLab.id, submitData);
        alert('Lab partner updated successfully!');
      } else {
        await adminService.createLabPartner(submitData);
        alert('Lab partner created successfully!');
      }
      setShowForm(false);
      setEditingLab(null);
      resetForm();
      loadLabPartners();
    } catch (error) {
      console.error('Error saving lab partner:', error);
      alert(error.response?.data?.error?.message || 'Error saving lab partner. Please try again.');
    }
  };

  const handleEdit = (lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      code: lab.code,
      contact_email: lab.contact_email || '',
      contact_phone: lab.contact_phone || '',
      address: lab.address || '',
      city: lab.city || '',
      service_zones: Array.isArray(lab.service_zones) ? lab.service_zones.join(', ') : '',
      commission_percentage: lab.commission_percentage || '',
      is_active: lab.is_active !== undefined ? lab.is_active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (labId) => {
    if (!confirm('Are you sure you want to delete this lab partner?')) return;

    try {
      await adminService.deleteLabPartner(labId);
      alert('Lab partner deleted successfully!');
      loadLabPartners();
    } catch (error) {
      console.error('Error deleting lab partner:', error);
      alert(error.response?.data?.error?.message || 'Error deleting lab partner. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      city: '',
      service_zones: '',
      commission_percentage: '',
      is_active: true,
    });
    setEditingLab(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading lab partners...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Manage Lab Partners</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="admin-btn admin-btn-primary">
            Add New Lab Partner
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search lab partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingLab ? 'Edit Lab Partner' : 'Add New Lab Partner'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Lab Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Lab Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="text"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Service Zones (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.service_zones}
                    onChange={(e) => setFormData({ ...formData, service_zones: e.target.value })}
                    className="input"
                    placeholder="Dubai, Abu Dhabi, Sharjah"
                  />
                </div>

                <div className="form-group">
                  <label>Commission Percentage</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.commission_percentage}
                    onChange={(e) => setFormData({ ...formData, commission_percentage: e.target.value })}
                    className="input"
                    placeholder="e.g., 15.5"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    Active
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingLab ? 'Update' : 'Create'} Lab Partner
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>City</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {labPartners.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No lab partners found. Click "Add New Lab Partner" to create one.
                  </td>
                </tr>
              ) : (
                labPartners.map((lab) => (
                  <tr key={lab.id}>
                    <td>{lab.code}</td>
                    <td>{lab.name}</td>
                    <td>{lab.city || 'N/A'}</td>
                    <td>{lab.contact_phone || lab.contact_email || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${lab.is_active ? 'active' : 'inactive'}`}>
                        {lab.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(lab)}
                        className="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(lab.id)}
                        className="btn btn-sm btn-danger"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default ManageLabPartners;
