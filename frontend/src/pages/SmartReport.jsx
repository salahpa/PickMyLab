import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { smartReportService } from '../services/smartReportService';
import { reportService } from '../services/reportService';

const SmartReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [smartReport, setSmartReport] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [smartRes, reportRes] = await Promise.all([
        smartReportService.getSmartReport(id),
        reportService.getReportById(id),
      ]);
      setSmartReport(smartRes.data);
      setReport(reportRes.data);
    } catch (error) {
      console.error('Error loading smart report:', error);
      // If smart report doesn't exist, generate it
      try {
        const generated = await smartReportService.generateSmartReport(id);
        setSmartReport(generated.data);
        const reportRes = await reportService.getReportById(id);
        setReport(reportRes.data);
      } catch (genError) {
        console.error('Error generating smart report:', genError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getSystemStatusColor = (status) => {
    const colors = {
      normal: '#10b981',
      caution: '#f59e0b',
      critical: '#ef4444',
      not_tested: '#9ca3af',
    };
    return colors[status] || '#9ca3af';
  };

  const getSystemStatusIcon = (status) => {
    if (status === 'normal') return '✓';
    if (status === 'caution') return '⚠';
    if (status === 'critical') return '✗';
    return '○';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Generating smart report...</div>
      </div>
    );
  }

  if (!smartReport || !report) {
    return (
      <div className="container">
        <div className="error">Smart report not available</div>
      </div>
    );
  }

  const bodySystems = smartReport.body_system_analysis || {};

  return (
    <div className="smart-report-page">
      <div className="container">
        <button onClick={() => navigate(`/reports/${id}`)} className="back-link">
          ← Back to Report
        </button>

        <div className="smart-report-header">
          <h1>Smart Health Report</h1>
          <p className="report-meta">
            Report #{report.report_number} | {new Date(report.report_date).toLocaleDateString()}
          </p>
        </div>

        <div className="smart-report-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Body Overview
          </button>
          <button
            className={activeTab === 'insights' ? 'active' : ''}
            onClick={() => setActiveTab('insights')}
          >
            Health Insights
          </button>
          <button
            className={activeTab === 'recommendations' ? 'active' : ''}
            onClick={() => setActiveTab('recommendations')}
          >
            Recommendations
          </button>
          <button
            className={activeTab === 'trends' ? 'active' : ''}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="body-overview-section">
            <h2>Interactive Body System Analysis</h2>
            <div className="body-systems-grid">
              {Object.entries(bodySystems).map(([system, data]) => (
                <div
                  key={system}
                  className={`body-system-card ${
                    selectedSystem === system ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedSystem(selectedSystem === system ? null : system)}
                  style={{
                    borderColor: getSystemStatusColor(data.status),
                    backgroundColor:
                      selectedSystem === system
                        ? `${getSystemStatusColor(data.status)}20`
                        : 'var(--bg-primary)',
                  }}
                >
                  <div className="system-header">
                    <div className="system-icon">
                      <span
                        style={{
                          color: getSystemStatusColor(data.status),
                          fontSize: '2rem',
                        }}
                      >
                        {getSystemStatusIcon(data.status)}
                      </span>
                    </div>
                    <div>
                      <h3>{system.charAt(0).toUpperCase() + system.slice(1)} System</h3>
                      <p className="system-status">
                        Status:{' '}
                        <span
                          style={{ color: getSystemStatusColor(data.status) }}
                        >
                          {data.status === 'not_tested'
                            ? 'Not Tested'
                            : data.status === 'normal'
                            ? 'Normal'
                            : data.status === 'caution'
                            ? 'Caution'
                            : 'Critical'}
                        </span>
                      </p>
                    </div>
                  </div>
                  {data.tests && data.tests.length > 0 && (
                    <div className="system-tests">
                      <p className="tests-count">
                        {data.tests.length} test{data.tests.length !== 1 ? 's' : ''} performed
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedSystem && bodySystems[selectedSystem] && (
              <div className="system-detail-panel">
                <h3>
                  {selectedSystem.charAt(0).toUpperCase() + selectedSystem.slice(1)} System Details
                </h3>
                <div className="system-details">
                  <div className="detail-section">
                    <h4>Status</h4>
                    <p
                      style={{ color: getSystemStatusColor(bodySystems[selectedSystem].status) }}
                    >
                      {bodySystems[selectedSystem].status === 'not_tested'
                        ? 'Not Tested'
                        : bodySystems[selectedSystem].status === 'normal'
                        ? 'Normal - All parameters within healthy range'
                        : bodySystems[selectedSystem].status === 'caution'
                        ? 'Caution - Some parameters need attention'
                        : 'Critical - Immediate medical attention recommended'}
                    </p>
                  </div>

                  {bodySystems[selectedSystem].tests &&
                    bodySystems[selectedSystem].tests.length > 0 && (
                      <div className="detail-section">
                        <h4>Test Results</h4>
                        <div className="test-results-list">
                          {bodySystems[selectedSystem].tests.map((test, index) => (
                            <div key={index} className="test-result-item">
                              <div className="test-name">
                                <strong>{test.test_name}</strong>
                                <span className="test-code">({test.test_code})</span>
                              </div>
                              <div className="test-parameter">
                                <span>{test.parameter}:</span>
                                <span className="result-value">{test.result}</span>
                                <span
                                  className={`status-badge ${
                                    test.status === 'normal'
                                      ? 'normal'
                                      : test.status === 'abnormal'
                                      ? 'abnormal'
                                      : 'critical'
                                  }`}
                                >
                                  {test.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {bodySystems[selectedSystem].tests &&
                    bodySystems[selectedSystem].tests.length === 0 && (
                      <div className="detail-section">
                        <p>No tests were performed for this system in this report.</p>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && smartReport.health_insights && (
          <div className="insights-section">
            <h2>Health Insights</h2>
            {smartReport.health_insights.length === 0 ? (
              <div className="no-insights">
                <p>All test results are within normal ranges. Great job maintaining your health!</p>
              </div>
            ) : (
              <div className="insights-list">
                {smartReport.health_insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`insight-card ${
                      insight.severity === 'critical'
                        ? 'critical'
                        : insight.severity === 'abnormal'
                        ? 'abnormal'
                        : 'borderline'
                    }`}
                  >
                    <div className="insight-header">
                      <h4>
                        {insight.parameter || insight.type === 'general'
                          ? insight.parameter || 'General Health'
                          : 'Health Insight'}
                      </h4>
                      {insight.severity && (
                        <span className={`severity-badge ${insight.severity}`}>
                          {insight.severity}
                        </span>
                      )}
                    </div>
                    <p className="insight-text">{insight.insight}</p>
                    {insight.test && (
                      <p className="insight-test">Related Test: {insight.test}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && smartReport.recommendations && (
          <div className="recommendations-section">
            <h2>Personalized Recommendations</h2>
            <div className="recommendations-grid">
              {smartReport.recommendations.nutrition &&
                smartReport.recommendations.nutrition.length > 0 && (
                  <div className="recommendation-category">
                    <h3>🍎 Nutrition</h3>
                    <div className="recommendations-list">
                      {smartReport.recommendations.nutrition.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {smartReport.recommendations.lifestyle &&
                smartReport.recommendations.lifestyle.length > 0 && (
                  <div className="recommendation-category">
                    <h3>🏃 Lifestyle</h3>
                    <div className="recommendations-list">
                      {smartReport.recommendations.lifestyle.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {smartReport.recommendations.medical &&
                smartReport.recommendations.medical.length > 0 && (
                  <div className="recommendation-category">
                    <h3>🏥 Medical</h3>
                    <div className="recommendations-list">
                      {smartReport.recommendations.medical.map((rec, index) => (
                        <div key={index} className="recommendation-item medical">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {smartReport.recommendations.supplements &&
                smartReport.recommendations.supplements.length > 0 && (
                  <div className="recommendation-category">
                    <h3>💊 Supplements</h3>
                    <div className="recommendations-list">
                      {smartReport.recommendations.supplements.map((rec, index) => (
                        <div key={index} className="recommendation-item">
                          <h4>{rec.title}</h4>
                          <p>{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {activeTab === 'trends' && smartReport.trend_analysis && (
          <div className="trends-section">
            <h2>Trend Analysis</h2>
            {!smartReport.trend_analysis.has_previous ? (
              <div className="no-trends">
                <p>{smartReport.trend_analysis.message || 'No previous reports available for comparison.'}</p>
              </div>
            ) : (
              <div className="trends-content">
                <div className="trends-info">
                  <p>
                    Comparing with {smartReport.trend_analysis.previous_reports_count} previous
                    report(s)
                  </p>
                </div>
                {smartReport.trend_analysis.trends &&
                  smartReport.trend_analysis.trends.length > 0 && (
                    <div className="trends-list">
                      {smartReport.trend_analysis.trends.map((trend, index) => (
                        <div key={index} className="trend-item">
                          <div className="trend-header">
                            <h4>{trend.parameter}</h4>
                            <span className={`trend-badge ${trend.trend}`}>
                              {trend.trend === 'increasing' ? '↑' : trend.trend === 'decreasing' ? '↓' : '→'} {trend.trend}
                            </span>
                          </div>
                          <div className="trend-comparison">
                            <div className="comparison-item">
                              <span className="label">Previous:</span>
                              <span>
                                {trend.previous_value} {trend.unit || ''}
                              </span>
                              <span className="date">
                                ({new Date(trend.previous_date).toLocaleDateString()})
                              </span>
                            </div>
                            <div className="comparison-item">
                              <span className="label">Current:</span>
                              <span className="current-value">
                                {trend.current_value} {trend.unit || ''}
                              </span>
                            </div>
                            <div className="comparison-item">
                              <span className="label">Change:</span>
                              <span
                                className={
                                  parseFloat(trend.change_percentage) > 0
                                    ? 'positive'
                                    : parseFloat(trend.change_percentage) < 0
                                    ? 'negative'
                                    : 'neutral'
                                }
                              >
                                {trend.change_percentage > 0 ? '+' : ''}
                                {trend.change_percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartReport;
