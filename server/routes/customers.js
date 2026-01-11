const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT c.*, 
             COUNT(j.id) as total_jobs,
             COALESCE(SUM(j.estimated_cost), 0) as total_spent
      FROM customers c
      LEFT JOIN jobs j ON c.id = j.customer_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers'
    });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customer'
    });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear } = req.body;
    
    if (!name || !phone || !plateNumber) {
      return res.status(400).json({
        success: false,
        error: 'Name, phone, and plate number are required'
      });
    }
    
    const query = `
      INSERT INTO customers (name, phone, email, plate_number, vehicle_make, vehicle_model, vehicle_year)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear
    ]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create customer'
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear } = req.body;
    
    const query = `
      UPDATE customers 
      SET name = $1, phone = $2, email = $3, plate_number = $4, 
          vehicle_make = $5, vehicle_model = $6, vehicle_year = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, phone, email, plateNumber, vehicleMake, vehicleModel, vehicleYear, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update customer'
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: { message: 'Customer deleted successfully' }
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete customer'
    });
  }
});

module.exports = router;