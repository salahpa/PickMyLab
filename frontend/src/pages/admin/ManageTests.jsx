import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { testService } from '../../services/testService';

const ManageTests = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category_id: '',
    description: '',
    sample_type: 'blood',
    fasting_required: false,
    special_instructions: '',
    is_active: true,
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadData();
  }, [search, categoryFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [testsRes, categoriesRes] = await Promise.all([
        adminService.getAllTestsAdmin({
          search,
          category_id: categoryFilter || undefined,
        }),
        testService.getCategories(),
      ]);
      setTests(testsRes.data.tests);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading tests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTest) {
        await adminService.updateTest(editingTest.id, formData);
        alert('Test updated successfully!');
      } else {
        await adminService.createTest(formData);
        alert('Test created successfully!');
      }
      setShowForm(false);
      setEditingTest(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving test:', error);
      alert(error.response?.data?.error?.message || 'Error saving test. Please try again.');
    }
  };

  const handleEdit = (test) => {
    setEditingTest(test);
    setFormData({
      name: test.name,
      code: test.code,
      category_id: test.category_id || '',
      description: test.description || '',
      sample_type: test.sample_type || 'blood',
      fasting_required: test.fasting_required || false,
      special_instructions: test.special_instructions || '',
      is_active: test.is_active !== undefined ? test.is_active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (testId) => {
    if (!confirm('Are you sure you want to delete this test?')) return;

    try {
      await adminService.deleteTest(testId);
      alert('Test deleted successfully!');
      loadData();
    } catch (error) {
      console.error('Error deleting test:', error);
      alert(error.response?.data?.error?.message || 'Error deleting test. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      category_id: '',
      description: '',
      sample_type: 'blood',
      fasting_required: false,
      special_instructions: '',
      is_active: true,
    });
    setEditingTest(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Tests</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
            Add New Test
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingTest ? 'Edit Test' : 'Add New Test'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Test Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Test Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Sample Type</label>
                  <select
                    value={formData.sample_type}
                    onChange={(e) => setFormData({ ...formData, sample_type: e.target.value })}
                    className="input"
                  >
                    <option value="blood">Blood</option>
                    <option value="urine">Urine</option>
                    <option value="stool">Stool</option>
                    <option value="saliva">Saliva</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.fasting_required}
                      onChange={(e) => setFormData({ ...formData, fasting_required: e.target.checked })}
                    />
                    Fasting Required
                  </label>
                </div>

                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    className="input"
                    rows="2"
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
                    {editingTest ? 'Update' : 'Create'} Test
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
                <th>Category</th>
                <th>Sample Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>
                    No tests found. Click "Add New Test" to create one.
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id}>
                    <td>{test.code}</td>
                    <td>{test.name}</td>
                    <td>{test.category_name || 'N/A'}</td>
                    <td>{test.sample_type}</td>
                    <td>
                      <span className={`status-badge ${test.is_active ? 'active' : 'inactive'}`}>
                        {test.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(test)}
                        className="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(test.id)}
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

        <div className="page-actions">
          <button onClick={() => navigate('/admin')} className="btn btn-outline">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTests;
