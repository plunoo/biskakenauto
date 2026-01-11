const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT j.*, c.name as customer_name, c.phone as customer_phone,
             c.plate_number, c.vehicle_make, c.vehicle_model, c.vehicle_year,
             CONCAT(c.vehicle_year, ' ', c.vehicle_make, ' ', c.vehicle_model) as vehicle_info
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      ORDER BY j.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
});

// Create new job
router.post('/', async (req, res) => {
  try {
    const { customerId, title, description, priority, estimatedCost } = req.body;
    
    if (!customerId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and title are required'
      });
    }
    
    const query = `
      INSERT INTO jobs (customer_id, title, description, priority, estimated_cost)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      customerId, title, description, priority || 'MEDIUM', estimatedCost
    ]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    });
  }
});

// Update job status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, actualCost } = req.body;
    
    let query = 'UPDATE jobs SET status = $1, updated_at = CURRENT_TIMESTAMP';
    let params = [status, id];
    
    if (status === 'COMPLETED') {
      query += ', completed_at = CURRENT_TIMESTAMP';
      if (actualCost) {
        query += ', actual_cost = $3';
        params = [status, id, actualCost];
      }
    }
    
    query += ' WHERE id = $2 RETURNING *';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job status'
    });
  }
});

module.exports = router;