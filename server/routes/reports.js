const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Dashboard report
router.get('/dashboard', async (req, res) => {
  try {
    // Get summary statistics
    const [jobsResult, customersResult, invoicesResult, inventoryResult] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*) as total_jobs,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_jobs,
          COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_jobs,
          COALESCE(SUM(estimated_cost), 0) as total_revenue
        FROM jobs
      `),
      pool.query('SELECT COUNT(*) as total_customers FROM customers'),
      pool.query(`
        SELECT 
          COUNT(*) as total_invoices,
          COUNT(CASE WHEN status = 'PAID' THEN 1 END) as paid_invoices
        FROM invoices
      `),
      pool.query(`
        SELECT COUNT(*) as low_stock_items 
        FROM inventory 
        WHERE stock <= reorder_level
      `)
    ]);

    // Get recent jobs
    const recentJobsResult = await pool.query(`
      SELECT j.*, c.name as customer_name,
             CONCAT(c.vehicle_year, ' ', c.vehicle_make, ' ', c.vehicle_model) as vehicle_info
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      ORDER BY j.created_at DESC
      LIMIT 5
    `);

    // Get low stock items
    const lowStockResult = await pool.query(`
      SELECT * FROM inventory 
      WHERE stock <= reorder_level
      ORDER BY stock ASC
      LIMIT 5
    `);

    const summary = {
      ...jobsResult.rows[0],
      ...customersResult.rows[0],
      ...invoicesResult.rows[0],
      ...inventoryResult.rows[0]
    };

    res.json({
      success: true,
      data: {
        summary,
        recentJobs: recentJobsResult.rows,
        lowStock: lowStockResult.rows
      }
    });

  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate dashboard report'
    });
  }
});

// Financial report
router.get('/financial', async (req, res) => {
  try {
    // Get financial summary
    const financialResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(total_amount) * 0.3, 0) as total_profit,
        COUNT(*) as total_invoices,
        COALESCE(AVG(total_amount), 0) as average_invoice_value
      FROM invoices
      WHERE status = 'PAID'
    `);

    // Get payment methods breakdown
    const paymentMethodsResult = await pool.query(`
      SELECT payment_method, COUNT(*) as count
      FROM payments
      GROUP BY payment_method
    `);

    // Get monthly data (last 3 months)
    const monthlyResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') as month,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(total_amount) * 0.3, 0) as profit
      FROM invoices
      WHERE created_at >= CURRENT_DATE - INTERVAL '3 months'
        AND status = 'PAID'
      GROUP BY TO_CHAR(created_at, 'Mon'), EXTRACT(MONTH FROM created_at)
      ORDER BY EXTRACT(MONTH FROM created_at)
    `);

    const paymentMethods = {};
    paymentMethodsResult.rows.forEach(row => {
      paymentMethods[row.payment_method] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: {
        ...financialResult.rows[0],
        paymentMethods,
        monthlyData: monthlyResult.rows
      }
    });

  } catch (error) {
    console.error('Financial report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate financial report'
    });
  }
});

// Export report
router.post('/export', async (req, res) => {
  try {
    const { reportType, format, dateRange } = req.body;
    
    // Simulate export process
    const reportId = `RPT-${Date.now()}`;
    const downloadUrl = `${req.protocol}://${req.get('host')}/reports/download/${reportId}.${format}`;
    
    res.json({
      success: true,
      data: {
        reportId,
        downloadUrl,
        generatedAt: new Date().toISOString(),
        reportType,
        format
      }
    });
    
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export report'
    });
  }
});

module.exports = router;