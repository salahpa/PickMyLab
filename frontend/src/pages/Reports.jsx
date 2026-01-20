import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { reportService } from '../services/reportService';
import { testService } from '../services/testService';

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [reports, setReports] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    test_id: '',
    date_from: '',
    date_to: '',
    page: 1,
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReports();
    loadTests();
  }, [filters.page]);

  useEffect(() => {
    loadReports();
  }, [filters.test_id, filters.date_from, filters.date_to]);

  const loadTests = async () => {
    try {
      const response = await testService.getTests({ limit: 100 });
      setTests(response.data.tests);
    } catch (error) {
      console.error('Error loading tests:', error);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getUserReports(filters);
      setReports(response.data.reports);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      await reportService.downloadReport(reportId);
    } catch (error) {
      alert('Failed to download report: ' + error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ready: '#10b981',
      pending: '#f59e0b',
      processing: '#2563eb',
      delivered: '#8b5cf6',
    };
    return colors[status] || '#6b7280';
  };

  if (loading && reports.length === 0) {
    return (
      <div className="container">
        <div className="loading">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="container">
        <h1>My Reports</h1>

        <div className="reports-filters">
          <div className="filter-group">
            <label>Filter by Test</label>
            <select
              value={filters.test_id}
              onChange={(e) => setFilters({ ...filters, test_id: e.target.value, page: 1 })}
            >
              <option value="">All Tests</option>
              {tests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Date From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
            />
          </div>

          <div className="filter-group">
            <label>Date To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
            />
          </div>

          <button onClick={() => {
            setFilters({ test_id: '', date_from: '', date_to: '', page: 1 });
          }} className="btn btn-outline">
            Clear Filters
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="no-reports">
            <p>No reports found</p>
            <a href="/tests" className="btn btn-primary">
              Browse Tests
            </a>
          </div>
        ) : (
          <>
            <div className="reports-list">
              {reports.map((report) => (
                <div key={report.id} className="report-card">
                  <div className="report-header">
                    <div>
                      <h3>Report #{report.report_number}</h3>
                      <p className="report-date">
                        {new Date(report.report_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="report-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(report.status) }}
                      >
                        {report.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="report-details">
                    <div className="detail-item">
                      <span className="label">Lab Partner:</span>
                      <span>{report.lab_partner_name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Booking:</span>
                      <span>#{report.booking_number}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tests:</span>
                      <span>
                        {report.tests?.map((t) => t.test_name).join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="report-actions">
                    <button
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="btn btn-primary"
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => handleDownload(report.id)}
                      className="btn btn-outline"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.total_pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="btn btn-outline"
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === pagination.total_pages}
                  className="btn btn-outline"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
