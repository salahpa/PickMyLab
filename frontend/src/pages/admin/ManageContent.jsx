import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ManageContent = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('faqs');
  const [faqs, setFaqs] = useState([]);
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFAQForm, setShowFAQForm] = useState(false);
  const [showTermsForm, setShowTermsForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: '',
    display_order: 0,
    is_active: true,
  });
  const [termsForm, setTermsForm] = useState({
    version: '',
    content: '',
    effective_from: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const [faqsRes, termsRes] = await Promise.all([
        adminService.getFAQs(),
        adminService.getTerms(),
      ]);
      setFaqs(faqsRes.data);
      setTerms(termsRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
      alert('Error loading content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFAQSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await adminService.updateFAQ(editingFAQ.id, faqForm);
        alert('FAQ updated successfully!');
      } else {
        await adminService.createFAQ(faqForm);
        alert('FAQ created successfully!');
      }
      setShowFAQForm(false);
      setEditingFAQ(null);
      resetFAQForm();
      loadContent();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert(error.response?.data?.error?.message || 'Error saving FAQ.');
    }
  };

  const handleTermsSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateTerms(termsForm);
      alert('Terms & Conditions updated successfully!');
      setShowTermsForm(false);
      resetTermsForm();
      loadContent();
    } catch (error) {
      console.error('Error saving terms:', error);
      alert(error.response?.data?.error?.message || 'Error saving terms.');
    }
  };

  const handleEditFAQ = (faq) => {
    setEditingFAQ(faq);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      display_order: faq.display_order || 0,
      is_active: faq.is_active !== undefined ? faq.is_active : true,
    });
    setShowFAQForm(true);
  };

  const handleDeleteFAQ = async (faqId) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await adminService.deleteFAQ(faqId);
      alert('FAQ deleted successfully!');
      loadContent();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      alert(error.response?.data?.error?.message || 'Error deleting FAQ.');
    }
  };

  const resetFAQForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: '',
      display_order: 0,
      is_active: true,
    });
    setEditingFAQ(null);
  };

  const resetTermsForm = () => {
    setTermsForm({
      version: '',
      content: '',
      effective_from: new Date().toISOString().split('T')[0],
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Content Management</h1>
      </div>

        <div className="tabs">
          <button
            className={activeTab === 'faqs' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('faqs')}
          >
            FAQs
          </button>
          <button
            className={activeTab === 'terms' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('terms')}
          >
            Terms & Conditions
          </button>
        </div>

        {activeTab === 'faqs' && (
          <div>
            <div className="section-header">
              <h2>Frequently Asked Questions</h2>
              <button onClick={() => { resetFAQForm(); setShowFAQForm(true); }} className="btn btn-primary">
                Add New FAQ
              </button>
            </div>

            {showFAQForm && (
              <div className="modal-overlay" onClick={() => { setShowFAQForm(false); resetFAQForm(); }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</h2>
                  <form onSubmit={handleFAQSubmit}>
                    <div className="form-group">
                      <label>Question *</label>
                      <input
                        type="text"
                        value={faqForm.question}
                        onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Answer *</label>
                      <textarea
                        value={faqForm.answer}
                        onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                        required
                        className="input"
                        rows="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={faqForm.category}
                        onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                        className="input"
                        placeholder="e.g., Booking, Payment, Reports"
                      />
                    </div>
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={faqForm.display_order}
                        onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 0 })}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={faqForm.is_active}
                          onChange={(e) => setFaqForm({ ...faqForm, is_active: e.target.checked })}
                        />
                        Active
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        {editingFAQ ? 'Update' : 'Create'} FAQ
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowFAQForm(false); resetFAQForm(); }}
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
                    <th>Question</th>
                    <th>Category</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center' }}>
                        No FAQs found. Click "Add New FAQ" to create one.
                      </td>
                    </tr>
                  ) : (
                    faqs.map((faq) => (
                      <tr key={faq.id}>
                        <td>
                          <strong>{faq.question}</strong>
                          <br />
                          <small>{faq.answer.substring(0, 100)}...</small>
                        </td>
                        <td>{faq.category || 'General'}</td>
                        <td>{faq.display_order}</td>
                        <td>
                          <span className={`status-badge ${faq.is_active ? 'green' : 'red'}`}>
                            {faq.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleEditFAQ(faq)}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq.id)}
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
        )}

        {activeTab === 'terms' && (
          <div>
            <div className="section-header">
              <h2>Terms & Conditions</h2>
              <button onClick={() => { resetTermsForm(); setShowTermsForm(true); }} className="btn btn-primary">
                {terms ? 'Update Terms' : 'Create Terms'}
              </button>
            </div>

            {showTermsForm && (
              <div className="modal-overlay" onClick={() => { setShowTermsForm(false); resetTermsForm(); }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <h2>Update Terms & Conditions</h2>
                  <form onSubmit={handleTermsSubmit}>
                    <div className="form-group">
                      <label>Version *</label>
                      <input
                        type="text"
                        value={termsForm.version}
                        onChange={(e) => setTermsForm({ ...termsForm, version: e.target.value })}
                        required
                        className="input"
                        placeholder="e.g., 1.0, 2.0, 2024.1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Effective From *</label>
                      <input
                        type="date"
                        value={termsForm.effective_from}
                        onChange={(e) => setTermsForm({ ...termsForm, effective_from: e.target.value })}
                        required
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Content *</label>
                      <textarea
                        value={termsForm.content}
                        onChange={(e) => setTermsForm({ ...termsForm, content: e.target.value })}
                        required
                        className="input"
                        rows="15"
                        placeholder="Enter terms and conditions content here..."
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="btn btn-primary">
                        Save Terms
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowTermsForm(false); resetTermsForm(); }}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {terms && (
              <div className="content-preview">
                <h3>Current Terms & Conditions</h3>
                <p><strong>Version:</strong> {terms.version}</p>
                <p><strong>Effective From:</strong> {new Date(terms.effective_from).toLocaleDateString()}</p>
                <div className="content-box">
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{terms.content}</pre>
                </div>
              </div>
            )}

            {!terms && (
              <div className="empty-state">
                <p>No terms and conditions have been created yet.</p>
                <button onClick={() => setShowTermsForm(true)} className="btn btn-primary">
                  Create Terms & Conditions
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
};

export default ManageContent;
