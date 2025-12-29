import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { User, Car, Phone, MapPin, Plus, Edit, Trash2, Mail } from 'lucide-react';
import { Customer } from '../types';
import { VEHICLE_MAKES } from '../constants';

const CustomersPage: React.FC = () => {
  const { customers, loadCustomers, loading, addCustomer, updateCustomer, deleteCustomer } = useStore();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      plateNumber: ''
    }
  });

  useEffect(() => {
    console.log('👥 CustomersPage mounted - loading customers...');
    loadCustomers();
  }, []);

  useEffect(() => {
    console.log('👥 Customers data updated:', customers?.length || 0, 'customers');
  }, [customers]);

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
      vehicle: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        plateNumber: ''
      }
    });
    setEditingCustomer(null);
  };

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || '',
        notes: customer.notes || '',
        vehicle: customer.vehicle
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.phone || !formData.vehicle.plateNumber) return;
    
    const customerData: Customer = {
      id: editingCustomer?.id || `C${Date.now()}`,
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      notes: formData.notes,
      vehicle: formData.vehicle,
      createdAt: editingCustomer?.createdAt || new Date().toISOString()
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, customerData);
    } else {
      addCustomer(customerData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (customerId: string) => {
    if (confirm('Are you sure you want to delete this customer? This will also delete all related jobs and invoices.')) {
      deleteCustomer(customerId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">{customers?.length || 0} total customers</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openModal()} icon={Plus}>
          Add Customer
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {customers?.map((customer) => (
          <Card key={customer.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">ID: {customer.id}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => openModal(customer)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Customer"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete Customer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              
              {customer.email && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{customer.email}</span>
                </div>
              )}

              {customer.address && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{customer.address}</span>
                </div>
              )}

              {customer.vehicle && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Car className="h-4 w-4" />
                  <span>
                    {customer.vehicle.year} {customer.vehicle.make} {customer.vehicle.model}
                    <Badge variant="outline" className="ml-2">{customer.vehicle.plateNumber}</Badge>
                  </span>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">{customer.notes}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              Customer since: {new Date(customer.createdAt).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>

      {(!customers || customers.length === 0) && !loading && (
        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first customer</p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openModal()}>Add First Customer</Button>
        </Card>
      )}

      {/* Customer Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+233 24 123 4567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Customer address"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Make</label>
                <select
                  value={formData.vehicle.make}
                  onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, make: e.target.value } })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Make</option>
                  {VEHICLE_MAKES.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <Input
                  value={formData.vehicle.model}
                  onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })}
                  placeholder="e.g. Camry, Civic"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <Input
                  type="number"
                  value={formData.vehicle.year}
                  onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, year: parseInt(e.target.value) } })}
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                <Input
                  value={formData.vehicle.plateNumber}
                  onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, plateNumber: e.target.value.toUpperCase() } })}
                  placeholder="GR-1234-X"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about the customer..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.phone || !formData.vehicle.plateNumber}
            >
              {editingCustomer ? 'Update Customer' : 'Add Customer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CustomersPage;