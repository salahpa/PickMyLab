import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const ManageUsers = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_type: '',
    is_active: '',
    search: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadUsers();
  }, [filters.user_type, filters.is_active, filters.search, filters.page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers({
        user_type: filters.user_type || undefined,
        is_active: filters.is_active !== '' ? filters.is_active === 'true' : undefined,
        search: filters.search || undefined,
        page: filters.page,
        limit: 20,
      });
      // Handle response structure
      const data = response.data?.data || response.data;
      setUsers(data?.users || []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error('Error loading users:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error loading users: ${error.response?.data?.error?.message || error.message}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    if (!confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} this user?`)) {
      return;
    }

    try {
      await adminService.updateUserStatus(userId, newStatus);
      alert(`User ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert(error.response?.data?.error?.message || 'Error updating user status.');
    }
  };

  const getUserTypeColor = (type) => {
    const colors = {
      admin: 'red',
      ops: 'orange',
      patient: 'blue',
      phlebotomist: 'green',
      lab_staff: 'purple',
    };
    return colors[type] || 'gray';
  };

  if (loading && users.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Manage Users</h1>
        </div>

        <div className="filters">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="input"
          />
          <select
            value={filters.user_type}
            onChange={(e) => setFilters({ ...filters, user_type: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All User Types</option>
            <option value="patient">Patient</option>
            <option value="admin">Admin</option>
            <option value="ops">Operations</option>
            <option value="phlebotomist">Phlebotomist</option>
            <option value="lab_staff">Lab Staff</option>
          </select>
          <select
            value={filters.is_active}
            onChange={(e) => setFilters({ ...filters, is_active: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button
            onClick={() => setFilters({ user_type: '', is_active: '', search: '', page: 1 })}
            className="btn btn-outline"
          >
            Clear Filters
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>User Type</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.first_name} {u.last_name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getUserTypeColor(u.user_type)}`}>
                        {u.user_type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_active ? 'green' : 'red'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_verified ? 'green' : 'yellow'}`}>
                        {u.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      {u.last_login
                        ? new Date(u.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.is_active)}
                        className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.total_pages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            <span>
              Page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
            </span>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.total_pages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
