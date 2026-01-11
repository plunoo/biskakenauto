const express = require('express');
const { pool } = require('../db/connection');
const router = express.Router();

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.name as customer_name, c.phone as customer_phone
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      ORDER BY i.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const { customerId, jobId, items, subtotal, taxAmount, discountAmount, totalAmount, dueDate } = req.body;
    
    if (!customerId || !totalAmount) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and total amount are required'
      });
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Create invoice
      const invoiceQuery = `
        INSERT INTO invoices (invoice_number, customer_id, job_id, subtotal, tax_amount, discount_amount, total_amount, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const invoiceResult = await client.query(invoiceQuery, [
        invoiceNumber, customerId, jobId, subtotal, taxAmount || 0, discountAmount || 0, totalAmount, dueDate
      ]);
      
      const invoiceId = invoiceResult.rows[0].id;
      
      // Create invoice items
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(`
            INSERT INTO invoice_items (invoice_id, inventory_id, description, quantity, unit_price, total_price)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [invoiceId, item.inventoryId, item.description, item.quantity, item.unitPrice, item.totalPrice]);
        }
      }
      
      await client.query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: invoiceResult.rows[0]
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create invoice'
    });
  }
});

// Record payment
router.post('/:id/payments', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, paymentReference } = req.body;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Record payment
      await client.query(`
        INSERT INTO payments (invoice_id, amount, payment_method, payment_reference)
        VALUES ($1, $2, $3, $4)
      `, [id, amount, paymentMethod, paymentReference]);
      
      // Check if invoice is fully paid
      const paymentsResult = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total_paid 
        FROM payments 
        WHERE invoice_id = $1
      `, [id]);
      
      const invoiceResult = await client.query(`
        SELECT total_amount FROM invoices WHERE id = $1
      `, [id]);
      
      const totalPaid = paymentsResult.rows[0].total_paid;
      const totalAmount = invoiceResult.rows[0].total_amount;
      
      // Update invoice status if fully paid
      if (totalPaid >= totalAmount) {
        await client.query(`
          UPDATE invoices 
          SET status = 'PAID', paid_at = CURRENT_TIMESTAMP 
          WHERE id = $1
        `, [id]);
      }
      
      await client.query('COMMIT');
      
      res.json({
        success: true,
        data: {
          message: 'Payment recorded successfully',
          totalPaid,
          remainingBalance: totalAmount - totalPaid
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record payment'
    });
  }
});

module.exports = router;