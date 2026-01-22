import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ManageCategories = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error loading categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        alert('Category updated successfully!');
      } else {
        await adminService.createCategory(formData);
        alert('Category created successfully!');
      }
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error?.message || 'Error saving category. Please try again.');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon_url: category.icon_url || '',
      display_order: category.display_order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true,
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await adminService.deleteCategory(categoryId);
      alert('Category deleted successfully!');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert(error.response?.data?.error?.message || 'Error deleting category. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon_url: '',
      display_order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="page-header">
          <h1>Manage Test Categories</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
            Add New Category
          </button>
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={() => { setShowForm(false); resetForm(); }}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: formData.slug || e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                      });
                    }}
                    required
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="input"
                    placeholder="Auto-generated from name"
                  />
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
                  <label>Icon URL</label>
                  <input
                    type="text"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="input"
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
                    {editingCategory ? 'Update' : 'Create'} Category
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
                <th>Name</th>
                <th>Slug</th>
                <th>Display Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    No categories found. Click "Add New Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.display_order}</td>
                    <td>
                      <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn btn-sm btn-outline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

export default ManageCategories;
