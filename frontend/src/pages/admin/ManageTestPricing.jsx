import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { testService } from '../../services/testService';
import { labService } from '../../services/labService';

const ManageTestPricing = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [labPartners, setLabPartners] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [pricing, setPricing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [formData, setFormData] = useState({
    lab_partner_id: '',
    test_id: '',
    price: '',
    turnaround_time_hours: 24,
    is_available: true,
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedLab) {
      loadPricing();
    }
  }, [selectedLab]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [labsRes, testsRes] = await Promise.all([
        adminService.getAllLabPartners(),
        adminService.getAllTestsAdmin({ limit: 1000 }),
      ]);
      setLabPartners(labsRes.data.lab_partners);
      setTests(testsRes.data.tests);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPricing = async () => {
    try {
      const response = await adminService.getTestPricing(selectedLab);
      setPricing(response.data);
    } catch (error) {
      console.error('Error loading pricing:', error);
      alert('Error loading pricing. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.upsertTestPricing({
        ...formData,
        price: parseFloat(formData.price),
        turnaround_time_hours: parseInt(formData.turnaround_time_hours),
      });
      alert('Pricing saved successfully!');
      setShowForm(false);
      setEditingPricing(null);
      resetForm();
      loadPricing();
    } catch (error) {
      console.error('Error saving pricing:', error);
      alert(error.response?.data?.error?.message || 'Error saving pricing.');
    }
  };

  const handleEdit = (price) => {
    setEditingPricing(price);
    setFormData({
      lab_partner_id: price.lab_partner_id,
      test_id: price.test_id,
      price: price.price,
      turnaround_time_hours: price.turnaround_time_hours || 24,
      is_available: price.is_available !== undefined ? price.is_available : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (pricingId) => {
    if (!confirm('Are you sure you want to delete this pricing?')) return;

    try {
      await adminService.deleteTestPricing(pricingId);
      alert('Pricing deleted successfully!');
      loadPricing();
    } catch (error) {
      console.error('Error deleting pricing:', error);
      alert(error.response?.data?.error?.message || 'Error deleting pricing.');
    }
  };

  const resetForm = () => {
    setFormData({
      lab_partner_id: selectedLab || '',
      test_id: '',
      price: '',
      turnaround_time_hours: 24,
      is_available: true,
    });
    setEditingPricing(null);
  };

  const getLabName = (labId) => {
    const lab = labPartners.find((l) => l.id === labId);
    return lab ? lab.name : 'Unknown';
  };

  const getTestName = (testId) => {
    const test = tests.find((t) => t.id === testId);
    return test ? test.name : 'Unknown';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Test Pricing</h1>
          <button onClick={() => navigate('/admin')} className="btn btn-outline">
            Back to Dashboard
          </button>
        </div>

        <div className="filters">
          <label>Select Lab Partner:</label>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="input"
          >
            <option value="">Select Lab Partner</option>
            {labPartners.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name} ({lab.code})
              </option>
            ))}
          </select>
        </div>

        {selectedLab && (
          <>
            <div className="section-header">
              <h2>Pricing for {getLabName(selectedLab)}</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="btn btn-primary"
              >
                Add New Pricing
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{editingPricing ? 'Edit Pricing' : 'Add New Pricing'}</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Lab Partner</label>
                      <input
                        type="text"
                        value={getLabName(formData.lab_partner_id || selectedLab)}
                        disabled
                        className="input"
                      />
                      <input type="hidden" value={formData.lab_partner_id || selectedLab} />
                    </div>
                    <div className="form-group">
                      <label>Test *</label>
                      <select
                        value={formData.test_id}
                        onChange={(e) => setFormData({ ...formData, test_id: e.target.value })}
                        required
                        className="input"
                      >
                        <option value="">Select Test</option>
                        {tests.map((test) => (
                          <option key={test.id} value={test.id}>
                            {test.name} ({test.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Price (AED) *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        className="input"
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Turnaround Time (Hours)</label>
                      <input
                        type="number"
                        value={formData.turnaround_time_hours}
                        onChange={(e) => setFormData({ ...formData, turnaround_time_hours: parseInt(e.target.value) || 24 })}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={formData.is_available}
                          onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                        />
                        Available
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingPricing ? 'Update' : 'Create'} Pricing
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
                    <th>Test</th>
                    <th>Code</th>
                    <th>Price (AED)</th>
                    <th>Turnaround Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center' }}>
                        No pricing found. Click "Add New Pricing" to create one.
                      </td>
                    </tr>
                  ) : (
                    pricing.map((price) => (
                      <tr key={price.id}>
                        <td>{price.test_name}</td>
                        <td>{price.test_code}</td>
                        <td>AED {parseFloat(price.price).toFixed(2)}</td>
                        <td>{price.turnaround_time_hours} hours</td>
                        <td>
                          <span className={`status-badge ${price.is_available ? 'green' : 'red'}`}>
                            {price.is_available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEdit(price)}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(price.id)}
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
          </>
        )}

        {!selectedLab && (
          <div className="empty-state">
            <p>Please select a lab partner to manage pricing.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTestPricing;
