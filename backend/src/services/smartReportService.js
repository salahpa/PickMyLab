const pool = require('../config/database');
const logger = require('../utils/logger');

/**
 * Map test results to body systems
 */
const mapTestToBodySystem = (testCode, testName) => {
  const testLower = testName.toLowerCase();
  const codeLower = testCode.toLowerCase();

  // Heart/Cardiovascular System
  if (
    codeLower.includes('lipid') ||
    codeLower.includes('cholesterol') ||
    codeLower.includes('ldl') ||
    codeLower.includes('hdl') ||
    codeLower.includes('triglyceride') ||
    testLower.includes('cardiac') ||
    testLower.includes('heart')
  ) {
    return 'heart';
  }

  // Blood System
  if (
    codeLower.includes('cbc') ||
    codeLower.includes('hemoglobin') ||
    codeLower.includes('hematocrit') ||
    codeLower.includes('rbc') ||
    codeLower.includes('wbc') ||
    codeLower.includes('platelet') ||
    testLower.includes('blood count')
  ) {
    return 'blood';
  }

  // Digestive/Metabolic
  if (
    codeLower.includes('glucose') ||
    codeLower.includes('sugar') ||
    codeLower.includes('liver') ||
    codeLower.includes('alt') ||
    codeLower.includes('ast') ||
    codeLower.includes('bilirubin') ||
    codeLower.includes('creatinine') ||
    codeLower.includes('urea') ||
    testLower.includes('liver function') ||
    testLower.includes('kidney function')
  ) {
    return 'digestive';
  }

  // Hormonal/Endocrine
  if (
    codeLower.includes('tsh') ||
    codeLower.includes('t3') ||
    codeLower.includes('t4') ||
    codeLower.includes('thyroid') ||
    codeLower.includes('hormone') ||
    testLower.includes('thyroid')
  ) {
    return 'hormonal';
  }

  // Immune System
  if (
    codeLower.includes('wbc') ||
    codeLower.includes('lymphocyte') ||
    codeLower.includes('neutrophil') ||
    testLower.includes('immune')
  ) {
    return 'immune';
  }

  // Lungs/Respiratory
  if (
    testLower.includes('lung') ||
    testLower.includes('respiratory') ||
    testLower.includes('oxygen')
  ) {
    return 'lungs';
  }

  return null;
};

/**
 * Determine status based on result value
 */
const determineStatus = (resultValue, referenceRange, status) => {
  if (status === 'critical') return 'critical';
  if (status === 'abnormal') return 'caution';
  if (status === 'borderline') return 'caution';
  return 'normal';
};

/**
 * Generate body system analysis
 */
const generateBodySystemAnalysis = async (reportId) => {
  try {
    // Get all test results for this report
    const resultsQuery = await pool.query(
      `SELECT 
        rtr.*,
        t.name as test_name,
        t.code as test_code
       FROM report_test_results rtr
       JOIN tests t ON rtr.test_id = t.id
       WHERE rtr.report_id = $1`,
      [reportId]
    );

    const bodySystems = {
      heart: { status: 'not_tested', tests: [], related_tests: [] },
      blood: { status: 'not_tested', tests: [], related_tests: [] },
      lungs: { status: 'not_tested', tests: [], related_tests: [] },
      immune: { status: 'not_tested', tests: [], related_tests: [] },
      digestive: { status: 'not_tested', tests: [], related_tests: [] },
      hormonal: { status: 'not_tested', tests: [], related_tests: [] },
      brain: { status: 'not_tested', tests: [], related_tests: [] },
    };

    // Map results to body systems
    for (const result of resultsQuery.rows) {
      const system = mapTestToBodySystem(result.test_code, result.test_name);

      if (system && bodySystems[system]) {
        bodySystems[system].tests.push({
          test_name: result.test_name,
          test_code: result.test_code,
          parameter: result.parameter_name,
          result: result.result_value,
          status: result.status,
        });

        // Determine overall system status
        if (bodySystems[system].status === 'not_tested') {
          bodySystems[system].status = determineStatus(
            result.result_value,
            result.reference_range,
            result.status
          );
        } else if (
          result.status === 'critical' ||
          result.status === 'abnormal'
        ) {
          if (bodySystems[system].status !== 'critical') {
            bodySystems[system].status = 'caution';
          }
          if (result.status === 'critical') {
            bodySystems[system].status = 'critical';
          }
        }
      }
    }

    // Mark systems as normal if tested but no issues
    for (const system in bodySystems) {
      if (
        bodySystems[system].status === 'not_tested' &&
        bodySystems[system].tests.length > 0
      ) {
        bodySystems[system].status = 'normal';
      }
    }

    return bodySystems;
  } catch (error) {
    logger.error('Generate body system analysis error:', error);
    throw error;
  }
};

/**
 * Generate health insights
 */
const generateHealthInsights = async (reportId, userId) => {
  try {
    const insights = [];

    // Get report with results
    const reportQuery = await pool.query(
      `SELECT rtr.*, t.name as test_name
       FROM report_test_results rtr
       JOIN tests t ON rtr.test_id = t.id
       WHERE rtr.report_id = $1`,
      [reportId]
    );

    const results = reportQuery.rows;

    // Analyze results and generate insights
    for (const result of results) {
      if (result.status === 'abnormal' || result.status === 'critical') {
        let insight = `Your ${result.parameter_name} is ${result.status === 'critical' ? 'critically' : ''} outside the normal range. `;
        insight += `Result: ${result.result_value} ${result.unit || ''} (Normal: ${result.reference_range || 'N/A'}). `;
        insight += `This may indicate a need for medical attention.`;

        insights.push({
          parameter: result.parameter_name,
          test: result.test_name,
          severity: result.status,
          insight: insight,
        });
      } else if (result.status === 'borderline') {
        insights.push({
          parameter: result.parameter_name,
          test: result.test_name,
          severity: 'borderline',
          insight: `Your ${result.parameter_name} is at the borderline of normal range. Consider monitoring and lifestyle adjustments.`,
        });
      }
    }

    // Get user info for personalized insights
    const userQuery = await pool.query(
      'SELECT date_of_birth, gender FROM users WHERE id = $1',
      [userId]
    );

    const user = userQuery.rows[0];
    if (user) {
      const age = user.date_of_birth
        ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()
        : null;

      if (age) {
        if (age > 50) {
          insights.push({
            type: 'general',
            insight: 'As you are over 50, regular health screenings are important. Consider annual comprehensive health checkups.',
          });
        }
      }
    }

    return insights;
  } catch (error) {
    logger.error('Generate health insights error:', error);
    throw error;
  }
};

/**
 * Generate recommendations
 */
const generateRecommendations = async (reportId, userId) => {
  try {
    const recommendations = {
      nutrition: [],
      lifestyle: [],
      medical: [],
      supplements: [],
    };

    // Get abnormal results
    const abnormalResults = await pool.query(
      `SELECT rtr.*, t.name as test_name
       FROM report_test_results rtr
       JOIN tests t ON rtr.test_id = t.id
       WHERE rtr.report_id = $1 
         AND (rtr.status = 'abnormal' OR rtr.status = 'critical' OR rtr.status = 'borderline')`,
      [reportId]
    );

    // Get user info
    const userQuery = await pool.query(
      'SELECT date_of_birth, gender FROM users WHERE id = $1',
      [userId]
    );
    const user = userQuery.rows[0];
    const age = user?.date_of_birth
      ? new Date().getFullYear() - new Date(user.date_of_birth).getFullYear()
      : null;

    for (const result of abnormalResults.rows) {
      const paramLower = result.parameter_name.toLowerCase();

      // High cholesterol recommendations
      if (paramLower.includes('cholesterol') || paramLower.includes('ldl')) {
        recommendations.nutrition.push({
          title: 'Reduce Saturated Fats',
          description: 'Limit red meat, full-fat dairy, and fried foods. Choose lean proteins and plant-based options.',
        });
        recommendations.lifestyle.push({
          title: 'Regular Exercise',
          description: 'Aim for 30 minutes of moderate exercise 5 times per week to help lower cholesterol.',
        });
      }

      // High glucose recommendations
      if (paramLower.includes('glucose') || paramLower.includes('sugar')) {
        recommendations.nutrition.push({
          title: 'Manage Carbohydrate Intake',
          description: 'Choose complex carbs (whole grains, vegetables) over simple sugars. Monitor portion sizes.',
        });
        recommendations.lifestyle.push({
          title: 'Regular Physical Activity',
          description: 'Exercise helps improve insulin sensitivity. Aim for 150 minutes per week.',
        });
        recommendations.medical.push({
          title: 'Consult Healthcare Provider',
          description: 'Discuss your glucose levels with your doctor for proper management.',
        });
      }

      // Low hemoglobin/anemia
      if (paramLower.includes('hemoglobin') || paramLower.includes('rbc')) {
        recommendations.nutrition.push({
          title: 'Iron-Rich Foods',
          description: 'Include red meat, poultry, fish, beans, lentils, and dark leafy greens in your diet.',
        });
        recommendations.nutrition.push({
          title: 'Vitamin C with Iron',
          description: 'Pair iron-rich foods with vitamin C sources (citrus, tomatoes) to enhance absorption.',
        });
        recommendations.supplements.push({
          title: 'Iron Supplement',
          description: 'Consider iron supplements if recommended by your healthcare provider.',
        });
      }

      // Liver function
      if (
        paramLower.includes('alt') ||
        paramLower.includes('ast') ||
        paramLower.includes('bilirubin')
      ) {
        recommendations.lifestyle.push({
          title: 'Limit Alcohol',
          description: 'Reduce or eliminate alcohol consumption to support liver health.',
        });
        recommendations.nutrition.push({
          title: 'Liver-Friendly Foods',
          description: 'Include leafy greens, beets, and foods rich in antioxidants.',
        });
      }

      // Thyroid
      if (paramLower.includes('tsh') || paramLower.includes('thyroid')) {
        recommendations.medical.push({
          title: 'Endocrinologist Consultation',
          description: 'Consult with an endocrinologist for proper thyroid management.',
        });
        recommendations.nutrition.push({
          title: 'Iodine-Rich Foods',
          description: 'Include seafood, dairy, and iodized salt in moderation.',
        });
      }
    }

    // General recommendations
    recommendations.lifestyle.push({
      title: 'Adequate Sleep',
      description: 'Aim for 7-9 hours of quality sleep per night for optimal health.',
    });

    recommendations.lifestyle.push({
      title: 'Stress Management',
      description: 'Practice relaxation techniques like meditation, yoga, or deep breathing.',
    });

    recommendations.lifestyle.push({
      title: 'Stay Hydrated',
      description: 'Drink at least 8 glasses of water daily to support overall health.',
    });

    return recommendations;
  } catch (error) {
    logger.error('Generate recommendations error:', error);
    throw error;
  }
};

/**
 * Generate trend analysis
 */
const generateTrendAnalysis = async (reportId, userId) => {
  try {
    // Get current report date
    const currentReport = await pool.query(
      'SELECT report_date FROM lab_reports WHERE id = $1',
      [reportId]
    );

    if (currentReport.rows.length === 0) {
      return null;
    }

    const currentDate = currentReport.rows[0].report_date;

    // Get previous reports (last 5)
    const previousReports = await pool.query(
      `SELECT lr.id, lr.report_date
       FROM lab_reports lr
       JOIN bookings b ON lr.booking_id = b.id
       WHERE b.user_id = $1 
         AND lr.report_date < $2
         AND lr.status = 'ready'
       ORDER BY lr.report_date DESC
       LIMIT 5`,
      [userId, currentDate]
    );

    if (previousReports.rows.length === 0) {
      return {
        has_previous: false,
        message: 'This is your first report. No trend data available.',
      };
    }

    // Get current report results
    const currentResults = await pool.query(
      `SELECT 
        rtr.parameter_name,
        rtr.result_value,
        rtr.unit,
        rtr.test_id,
        t.name as test_name
       FROM report_test_results rtr
       JOIN tests t ON rtr.test_id = t.id
       WHERE rtr.report_id = $1`,
      [reportId]
    );

    const trends = [];

    // Compare each parameter with previous reports
    for (const current of currentResults.rows) {
      const previousResults = await pool.query(
        `SELECT 
          rtr.result_value,
          rtr.report_id,
          lr.report_date
         FROM report_test_results rtr
         JOIN lab_reports lr ON rtr.report_id = lr.id
         WHERE rtr.parameter_name = $1
           AND rtr.test_id = $2
           AND lr.report_date < $3
         ORDER BY lr.report_date DESC
         LIMIT 1`,
        [current.parameter_name, current.test_id, currentDate]
      );

      if (previousResults.rows.length > 0) {
        const previous = previousResults.rows[0];
        const currentValue = parseFloat(current.result_value);
        const previousValue = parseFloat(previous.result_value);

        let trend = 'stable';
        let change = 0;

        if (!isNaN(currentValue) && !isNaN(previousValue)) {
          change = ((currentValue - previousValue) / previousValue) * 100;
          if (Math.abs(change) < 5) {
            trend = 'stable';
          } else if (change > 0) {
            trend = 'increasing';
          } else {
            trend = 'decreasing';
          }
        }

        trends.push({
          parameter: current.parameter_name,
          test: current.test_name,
          current_value: current.result_value,
          previous_value: previous.result_value,
          previous_date: previous.report_date,
          change_percentage: change.toFixed(2),
          trend: trend,
          unit: current.unit,
        });
      }
    }

    return {
      has_previous: true,
      previous_reports_count: previousReports.rows.length,
      trends: trends,
    };
  } catch (error) {
    logger.error('Generate trend analysis error:', error);
    throw error;
  }
};

/**
 * Generate smart report
 */
const generateSmartReport = async (reportId, userId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if smart report already exists
    const existingCheck = await client.query(
      'SELECT id FROM smart_reports WHERE report_id = $1',
      [reportId]
    );

    if (existingCheck.rows.length > 0) {
      // Return existing smart report
      const existing = await client.query(
        'SELECT * FROM smart_reports WHERE report_id = $1',
        [reportId]
      );
      await client.query('COMMIT');
      return existing.rows[0];
    }

    // Generate all components
    const bodySystemAnalysis = await generateBodySystemAnalysis(reportId);
    const healthInsights = await generateHealthInsights(reportId, userId);
    const recommendations = await generateRecommendations(reportId, userId);
    const trendAnalysis = await generateTrendAnalysis(reportId, userId);

    // Create smart report
    const smartReportResult = await client.query(
      `INSERT INTO smart_reports (
        report_id, body_system_analysis, health_insights,
        recommendations, trend_analysis, generated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *`,
      [
        reportId,
        JSON.stringify(bodySystemAnalysis),
        JSON.stringify(healthInsights),
        JSON.stringify(recommendations),
        JSON.stringify(trendAnalysis),
      ]
    );

    await client.query('COMMIT');

    return smartReportResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Generate smart report error:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get smart report
 */
const getSmartReport = async (reportId, userId = null) => {
  try {
    let query = `
      SELECT sr.*, lr.report_number, lr.report_date
      FROM smart_reports sr
      JOIN lab_reports lr ON sr.report_id = lr.id
      JOIN bookings b ON lr.booking_id = b.id
      WHERE sr.report_id = $1
    `;

    const values = [reportId];

    if (userId) {
      query += ' AND b.user_id = $2';
      values.push(userId);
    }

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // Generate smart report if it doesn't exist
      if (userId) {
        return await generateSmartReport(reportId, userId);
      }
      throw new Error('Smart report not found');
    }

    const smartReport = result.rows[0];

    // Parse JSON fields
    smartReport.body_system_analysis = JSON.parse(
      smartReport.body_system_analysis || '{}'
    );
    smartReport.health_insights = JSON.parse(
      smartReport.health_insights || '[]'
    );
    smartReport.recommendations = JSON.parse(
      smartReport.recommendations || '{}'
    );
    smartReport.trend_analysis = JSON.parse(
      smartReport.trend_analysis || '{}'
    );

    return smartReport;
  } catch (error) {
    logger.error('Get smart report error:', error);
    throw error;
  }
};

module.exports = {
  generateSmartReport,
  getSmartReport,
  generateBodySystemAnalysis,
  generateHealthInsights,
  generateRecommendations,
  generateTrendAnalysis,
};
