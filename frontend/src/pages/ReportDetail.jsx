import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { reportService } from '../services/reportService';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await reportService.getReportById(id);
      setReport(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      await reportService.downloadReport(id);
    } catch (error) {
      alert('Failed to download report: ' + error);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const response = await reportService.shareReport(id, shareEmail);
      setShareLink(response.data.share_link);
      alert('Report shared successfully! Share link: ' + response.data.share_link);
      setShowShareModal(false);
    } catch (error) {
      alert('Failed to share report: ' + error);
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container">
        <div className="error">Report not found</div>
      </div>
    );
  }

  // Group test results by test
  const groupedResults = {};
  if (report.test_results) {
    report.test_results.forEach((result) => {
      const testKey = result.test_id;
      if (!groupedResults[testKey]) {
        groupedResults[testKey] = {
          test_name: result.test_name,
          test_code: result.test_code,
          results: [],
        };
      }
      groupedResults[testKey].results.push(result);
    });
  }

  return (
    <div className="report-detail-page">
      <div className="container">
        <button onClick={() => navigate('/reports')} className="back-link">
          ← Back to Reports
        </button>

        <div className="report-detail-header">
          <div>
            <h1>Report #{report.report_number}</h1>
            <p className="report-meta">
              Lab: {report.lab_partner_name} | Date: {new Date(report.report_date).toLocaleDateString()}
            </p>
          </div>
          <div className="report-actions-header">
            <button onClick={handleDownload} className="btn btn-primary">
              Download PDF
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="btn btn-outline"
            >
              Share Report
            </button>
          </div>
        </div>

        <div className="report-content">
          <div className="report-info-section">
            <h2>Report Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Booking Number</label>
                <p>#{report.booking_number}</p>
              </div>
              <div className="info-item">
                <label>Report Date</label>
                <p>{new Date(report.report_date).toLocaleDateString()}</p>
              </div>
              <div className="info-item">
                <label>Lab Partner</label>
                <p>{report.lab_partner_name}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>{report.status}</p>
              </div>
            </div>
          </div>

          {report.tests && report.tests.length > 0 && (
            <div className="report-tests-section">
              <h2>Tests Included</h2>
              <div className="tests-list">
                {report.tests.map((test, index) => (
                  <div key={index} className="test-badge">
                    {test.test_name} ({test.test_code})
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.test_results && report.test_results.length > 0 && (
            <div className="report-results-section">
              <h2>Test Results</h2>
              {Object.values(groupedResults).map((group, index) => (
                <div key={index} className="test-results-group">
                  <h3>{group.test_name} ({group.test_code})</h3>
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Result</th>
                        <th>Unit</th>
                        <th>Reference Range</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.results.map((result, idx) => (
                        <tr
                          key={idx}
                          className={
                            result.status === 'abnormal' || result.status === 'critical'
                              ? 'abnormal-result'
                              : ''
                          }
                        >
                          <td>{result.parameter_name}</td>
                          <td className="result-value">{result.result_value}</td>
                          <td>{result.unit || 'N/A'}</td>
                          <td>{result.reference_range || 'N/A'}</td>
                          <td>
                            <span
                              className={`status-indicator ${
                                result.status === 'normal'
                                  ? 'normal'
                                  : result.status === 'abnormal'
                                  ? 'abnormal'
                                  : 'critical'
                              }`}
                            >
                              {result.status}
                            </span>
                            {result.flagged && <span className="flag-badge">⚠️</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <div className="smart-report-section">
            <h2>Smart Health Insights</h2>
            <p>Get personalized health insights, recommendations, and trend analysis.</p>
            <button
              onClick={() => navigate(`/reports/${id}/smart`)}
              className="btn btn-primary"
            >
              View Smart Report
            </button>
          </div>

          {report.report_file_url && (
            <div className="report-file-section">
              <h2>Report Document</h2>
              <p>Original report file is available for download.</p>
              <button onClick={handleDownload} className="btn btn-primary">
                Download Original PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Share Report</h2>
            <form onSubmit={handleShare}>
              <div className="form-group">
                <label>Email Address (Optional)</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email to send link"
                />
              </div>
              {shareLink && (
                <div className="share-link-section">
                  <label>Share Link</label>
                  <div className="share-link-input">
                    <input type="text" value={shareLink} readOnly />
                    <button
                      type="button"
                      onClick={copyShareLink}
                      className="btn btn-outline"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="share-note">
                    This link will expire in 7 days
                  </p>
                </div>
              )}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    setShareEmail('');
                    setShareLink('');
                  }}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Generate Share Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
