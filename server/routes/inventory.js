const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM inventory ORDER BY name ASC');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inventory'
    });
  }
});

// Create new inventory item
router.post('/', async (req, res) => {
  try {
    const { name, description, category, stock, unitPrice, reorderLevel, supplier } = req.body;
    
    if (!name || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Name and stock are required'
      });
    }
    
    const query = `
      INSERT INTO inventory (name, description, category, stock, unit_price, reorder_level, supplier)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, description, category, stock, unitPrice, reorderLevel || 5, supplier
    ]);
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create inventory item'
    });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, stock, unitPrice, reorderLevel, supplier } = req.body;
    
    const query = `
      UPDATE inventory 
      SET name = $1, description = $2, category = $3, stock = $4, 
          unit_price = $5, reorder_level = $6, supplier = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, description, category, stock, unitPrice, reorderLevel, supplier, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Inventory item not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update inventory item'
    });
  }
});

module.exports = router;