import React, { useEffect, useState } from 'react';
import { Card, Badge, Button } from '../components/UI';
import { useStore } from '../store/useStore';
import { FileText, DollarSign, Calendar, CheckCircle, Clock, Plus, Edit, Eye, Trash2, X, Download, Mail, Share, Printer } from 'lucide-react';
import { apiService } from '../services/apiService';

const InvoicesPage: React.FC = () => {
  const { invoices, customers, inventory, loadInvoices, loadCustomers, loadInventory, addInvoice, loading } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: '',
    includePDF: true
  });
  const [invoiceForm, setInvoiceForm] = useState({
    customerId: '',
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    subtotal: 0,
    tax: 0,
    grandTotal: 0,
    dueDate: '',
    notes: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'CASH',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    console.log('🧾 InvoicesPage mounted - loading data...');
    loadInvoices();
    loadCustomers();
    loadInventory();
  }, []);

  useEffect(() => {
    console.log('🧾 Invoices data updated:', invoices?.length || 0, 'invoices');
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success">Paid</Badge>;
      case 'UNPAID':
        return <Badge variant="warning">Unpaid</Badge>;
      case 'OVERDUE':
        return <Badge variant="danger">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = invoices?.reduce((sum, inv) => sum + inv.grandTotal, 0) || 0;
  const paidInvoices = invoices?.filter(inv => inv.status === 'PAID') || [];
  const unpaidInvoices = invoices?.filter(inv => inv.status === 'UNPAID') || [];

  // Form handlers
  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
    calculateTotals();
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setInvoiceForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Calculate total for this item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      return { ...prev, items: newItems };
    });
    
    // Recalculate totals after a brief delay
    setTimeout(calculateTotals, 100);
  };

  const calculateTotals = () => {
    setInvoiceForm(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = (subtotal * prev.tax) / 100;
      const grandTotal = subtotal + taxAmount;
      
      return {
        ...prev,
        subtotal,
        grandTotal
      };
    });
  };

  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tax = parseFloat(e.target.value) || 0;
    setInvoiceForm(prev => ({ ...prev, tax }));
    setTimeout(calculateTotals, 100);
  };

  const resetForm = () => {
    setInvoiceForm({
      customerId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
      subtotal: 0,
      tax: 0,
      grandTotal: 0,
      dueDate: '',
      notes: ''
    });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('📝 Creating invoice...', invoiceForm);
      
      const selectedCustomer = customers?.find(c => c.id === invoiceForm.customerId);
      if (!selectedCustomer) {
        alert('Please select a customer');
        return;
      }

      const invoiceData = {
        customerId: invoiceForm.customerId,
        customerName: selectedCustomer.name,
        dueDate: invoiceForm.dueDate || undefined,
        items: invoiceForm.items.filter(item => item.description.trim() !== ''),
        subtotal: invoiceForm.subtotal,
        tax: invoiceForm.tax,
        grandTotal: invoiceForm.grandTotal,
        notes: invoiceForm.notes
      };

      // Create invoice via API
      const response = await apiService.createInvoice(invoiceData);
      
      if (response.success) {
        // Add to store
        addInvoice(response.data);
        
        // Reset form and close modal
        resetForm();
        setShowCreateModal(false);
        
        console.log('✅ Invoice created successfully:', response.data.id);
        alert(`Invoice ${response.data.id} created successfully!`);
        
        // Reload invoices to reflect the new one
        loadInvoices();
      } else {
        alert(`Failed to create invoice: ${response.error}`);
      }
      
    } catch (error) {
      console.error('💥 Failed to create invoice:', error);
      alert('Failed to create invoice. Please try again.');
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) return;
    
    try {
      console.log('💰 Recording payment...', paymentForm);
      
      const paymentData = {
        amount: paymentForm.amount,
        method: paymentForm.method,
        reference: paymentForm.reference,
        notes: paymentForm.notes
      };

      // Record payment via API
      const response = await apiService.recordPayment(selectedInvoice.id, paymentData);
      
      if (response.success) {
        console.log('✅ Payment recorded:', response.data.payment);
        
        // Reset forms and close modal
        setPaymentForm({ amount: 0, method: 'CASH', reference: '', notes: '' });
        setShowPaymentModal(false);
        setSelectedInvoice(null);
        
        const { payment, invoiceStatus, totalPaid, outstanding } = response.data;
        alert(`Payment of ₵${payment.amount.toFixed(2)} recorded successfully!\nInvoice status: ${invoiceStatus.replace('_', ' ')}\nTotal paid: ₵${totalPaid.toFixed(2)}\nOutstanding: ₵${outstanding.toFixed(2)}`);
        
        // Reload invoices to reflect changes
        loadInvoices();
      } else {
        alert(`Failed to record payment: ${response.error}`);
      }
      
    } catch (error) {
      console.error('💥 Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    }
  };

  const handleExportInvoice = async (invoice: any) => {
    if (exportLoading) return;
    
    try {
      setExportLoading(true);
      console.log('📄 Exporting invoice:', invoice.id);
      
      const response = await apiService.exportInvoice(invoice.id, 'pdf');
      
      if (response.success) {
        console.log('✅ Export successful:', response.data);
        
        // In a real implementation, you would trigger download
        alert(`Invoice ${invoice.id} exported successfully!\nDownload URL: ${response.data.downloadUrl}\nFile: ${response.data.filename}`);
        
        // Simulate download trigger
        // window.open(response.data.downloadUrl, '_blank');
      } else {
        alert(`Export failed: ${response.error}`);
      }
    } catch (error) {
      console.error('💥 Export failed:', error);
      alert('Export failed: Network error');
    } finally {
      setExportLoading(false);
    }
  };

  const handleEmailInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) return;
    
    try {
      console.log('📧 Emailing invoice:', selectedInvoice.id, emailForm);
      
      const emailData = {
        invoiceId: selectedInvoice.id,
        to: emailForm.to,
        subject: emailForm.subject,
        message: emailForm.message,
        includePDF: emailForm.includePDF
      };
      
      const response = await apiService.emailInvoice(emailData);
      
      if (response.success) {
        console.log('✅ Email sent successfully:', response.data);
        
        // Reset form and close modal
        setEmailForm({ to: '', subject: '', message: '', includePDF: true });
        setShowEmailModal(false);
        setSelectedInvoice(null);
        
        alert(`Invoice ${selectedInvoice.id} emailed successfully to ${emailForm.to}!`);
      } else {
        alert(`Email failed: ${response.error}`);
      }
    } catch (error) {
      console.error('💥 Email failed:', error);
      alert('Email failed: Network error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">{invoices?.length || 0} total invoices</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
          icon={Plus}
        >
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₵{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{paidInvoices.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unpaid Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{unpaidInvoices.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {invoices?.map((invoice) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{invoice.id}</h3>
                  <p className="text-sm text-gray-600">{invoice.customerName}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex justify-end space-x-1 mb-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      // TODO: Open invoice details modal
                    }}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Download}
                    onClick={() => handleExportInvoice(invoice)}
                    disabled={exportLoading}
                  >
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Mail}
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setEmailForm(prev => ({
                        ...prev,
                        to: customers?.find(c => c.id === invoice.customerId)?.email || '',
                        subject: `Invoice ${invoice.id} - Biskaken Auto Services`
                      }));
                      setShowEmailModal(true);
                    }}
                  >
                    Email
                  </Button>
                  {invoice.status === 'UNPAID' && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      icon={DollarSign}
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPaymentModal(true);
                      }}
                    >
                      Record Payment
                    </Button>
                  )}
                </div>
                {getStatusBadge(invoice.status)}
                <p className="text-lg font-bold text-gray-900 mt-1">
                  ₵{invoice.grandTotal.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Date</p>
                <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
              </div>
              
              {invoice.dueDate && (
                <div>
                  <p className="text-gray-600">Due Date</p>
                  <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              )}

              <div>
                <p className="text-gray-600">Subtotal</p>
                <p className="font-medium">₵{invoice.subtotal.toFixed(2)}</p>
              </div>

              <div>
                <p className="text-gray-600">Items</p>
                <p className="font-medium">{invoice.items?.length || 0}</p>
              </div>
            </div>

            {invoice.items && invoice.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                <div className="space-y-1">
                  {invoice.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span>{item.description} (x{item.quantity})</span>
                      <span>₵{item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Payments:</p>
                <div className="space-y-1">
                  {invoice.payments.map((payment, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span>{payment.method} - {new Date(payment.date).toLocaleDateString()}</span>
                      <span className="text-green-600 font-medium">₵{payment.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {(!invoices || invoices.length === 0) && !loading && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
          <p className="text-gray-600 mb-4">Create your first invoice to start billing customers</p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
            icon={Plus}
          >
            Create First Invoice
          </Button>
        </Card>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Create New Invoice</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-6">
              {/* Customer Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={invoiceForm.customerId}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerId: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.tax}
                    onChange={handleTaxChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Items</h3>
                  <Button 
                    type="button"
                    onClick={addInvoiceItem}
                    variant="outline"
                    size="sm"
                    icon={Plus}
                  >
                    Add Item
                  </Button>
                </div>

                <div className="space-y-3">
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-3 items-end">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          placeholder="Item description"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (₵)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-end space-x-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total (₵)
                          </label>
                          <input
                            type="text"
                            value={item.total.toFixed(2)}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        </div>
                        {invoiceForm.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-2 text-right">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₵{invoiceForm.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({invoiceForm.tax}%):</span>
                    <span className="font-medium">₵{((invoiceForm.subtotal * invoiceForm.tax) / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Grand Total:</span>
                    <span>₵{invoiceForm.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes or terms..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Record Payment</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPaymentForm({ amount: 0, method: 'CASH', reference: '', notes: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              {/* Invoice Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Invoice:</span>
                  <span className="font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg">₵{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount Paid:</span>
                  <span className="font-medium text-green-600">
                    ₵{(selectedInvoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-2 mt-2">
                  <span className="text-sm text-gray-600">Outstanding:</span>
                  <span className="font-bold text-red-600">
                    ₵{(selectedInvoice.grandTotal - (selectedInvoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₵) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedInvoice.grandTotal - (selectedInvoice.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0)}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="MOBILE_MONEY">Mobile Money</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CARD">Card Payment</option>
                  <option value="CHECK">Check</option>
                </select>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction reference (optional)"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Additional notes (optional)"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedInvoice(null);
                    setPaymentForm({ amount: 0, method: 'CASH', reference: '', notes: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Record Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Invoice Modal */}
      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Email Invoice</h2>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedInvoice(null);
                    setEmailForm({ to: '', subject: '', message: '', includePDF: true });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEmailInvoice} className="p-6 space-y-4">
              {/* Invoice Details */}
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Invoice:</span>
                  <span className="font-medium">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedInvoice.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-bold text-lg">₵{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Email To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email To *
                </label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="customer@example.com"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Dear valued customer,

Please find attached your invoice for the recent services provided...

Best regards,
Biskaken Auto Services"
                />
              </div>

              {/* Include PDF Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includePDF"
                  checked={emailForm.includePDF}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, includePDF: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includePDF" className="ml-2 block text-sm text-gray-900">
                  Include PDF attachment
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEmailModal(false);
                    setSelectedInvoice(null);
                    setEmailForm({ to: '', subject: '', message: '', includePDF: true });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  icon={Mail}
                >
                  Send Email
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;