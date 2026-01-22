import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ManagePhlebotomists = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [phlebotomists, setPhlebotomists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    availability: '',
    page: 1,
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (!user || (user.user_type !== 'admin' && user.user_type !== 'ops')) {
      navigate('/');
      return;
    }
    loadPhlebotomists();
  }, [filters.status, filters.availability, filters.page]);

  const loadPhlebotomists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.page) params.append('page', filters.page);
      params.append('limit', '20');

      const response = await api.get(`/phlebotomists?${params.toString()}`);
      
      // Handle response structure - could be response.data.data or response.data
      const data = response.data?.data || response.data;
      setPhlebotomists(data?.phlebotomists || []);
      setPagination(data?.pagination || {});
    } catch (error) {
      console.error('Error loading phlebotomists:', error);
      console.error('Error details:', error.response?.data);
      alert(`Error loading phlebotomists: ${error.response?.data?.error?.message || error.message}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'green',
      busy: 'yellow',
      offline: 'red',
      on_break: 'orange',
    };
    return colors[status] || 'gray';
  };

  if (loading && phlebotomists.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading phlebotomists...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page-header">
          <h1>Manage Phlebotomists</h1>
        </div>

        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="on_break">On Break</option>
          </select>
          <select
            value={filters.availability}
            onChange={(e) => setFilters({ ...filters, availability: e.target.value, page: 1 })}
            className="input"
          >
            <option value="">All</option>
            <option value="available">Available Only</option>
          </select>
          <button
            onClick={() => setFilters({ status: '', availability: '', page: 1 })}
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
                <th>License #</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Bookings</th>
                <th>Max/Day</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {phlebotomists.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center' }}>
                    No phlebotomists found.
                  </td>
                </tr>
              ) : (
                phlebotomists.map((phleb) => (
                  <tr key={phleb.id}>
                    <td>{phleb.first_name} {phleb.last_name}</td>
                    <td>{phleb.email}</td>
                    <td>{phleb.phone || 'N/A'}</td>
                    <td>{phleb.license_number || 'N/A'}</td>
                    <td>{phleb.vehicle_type || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(phleb.availability_status)}`}>
                        {phleb.availability_status || 'offline'}
                      </span>
                    </td>
                    <td>{phleb.current_bookings_count || 0}</td>
                    <td>{phleb.max_bookings_per_day || 10}</td>
                    <td>
                      <button
                        onClick={() => navigate(`/admin/phlebotomists/${phleb.id}`)}
                        className="btn btn-sm btn-outline"
                      >
                        View Details
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

export default ManagePhlebotomists;
