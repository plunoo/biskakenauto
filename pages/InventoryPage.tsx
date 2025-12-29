import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { Package, AlertTriangle, DollarSign, Building, Plus, Edit, Trash2, Minus, ShoppingCart } from 'lucide-react';
import { InventoryItem } from '../types';
import { INVENTORY_CATEGORIES } from '../constants';

const InventoryPage: React.FC = () => {
  const { inventory, loadInventory, loading, addInventory, updateInventory, deleteInventory, updateInventoryStock, createReorderRequest } = useStore();
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [reorderingItem, setReorderingItem] = useState<InventoryItem | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    stock: 0,
    reorderLevel: 5,
    unitCost: 0,
    sellingPrice: 0,
    supplier: '',
    description: ''
  });

  // Reorder form state
  const [reorderForm, setReorderForm] = useState({
    quantity: 0,
    notes: ''
  });

  useEffect(() => {
    console.log('📦 InventoryPage mounted - loading inventory...');
    loadInventory();
  }, []);

  useEffect(() => {
    console.log('📦 Inventory data updated:', inventory?.length || 0, 'items');
  }, [inventory]);

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      stock: 0,
      reorderLevel: 5,
      unitCost: 0,
      sellingPrice: 0,
      supplier: '',
      description: ''
    });
    setEditingItem(null);
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        stock: item.stock,
        reorderLevel: item.reorderLevel,
        unitCost: item.unitCost,
        sellingPrice: item.sellingPrice,
        supplier: item.supplier || '',
        description: item.description || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) return;
    
    const itemData: InventoryItem = {
      id: editingItem?.id || `INV${Date.now()}`,
      name: formData.name,
      category: formData.category,
      stock: formData.stock,
      reorderLevel: formData.reorderLevel,
      unitCost: formData.unitCost,
      sellingPrice: formData.sellingPrice,
      supplier: formData.supplier,
      description: formData.description,
      createdAt: editingItem?.createdAt || new Date().toISOString()
    };

    if (editingItem) {
      updateInventory(editingItem.id, itemData);
    } else {
      addInventory(itemData);
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      deleteInventory(itemId);
    }
  };

  const openReorderModal = (item: InventoryItem) => {
    setReorderingItem(item);
    setReorderForm({
      quantity: Math.max(item.reorderLevel * 2, 10), // Suggest double the reorder level
      notes: ''
    });
    setIsReorderModalOpen(true);
  };

  const handleReorderSubmit = () => {
    if (!reorderingItem || reorderForm.quantity <= 0) return;
    
    createReorderRequest(reorderingItem.id, reorderForm.quantity, reorderForm.notes);
    setIsReorderModalOpen(false);
    setReorderingItem(null);
    setReorderForm({ quantity: 0, notes: '' });
    
    alert(`Reorder request submitted for ${reorderingItem.name}. Admins will be notified.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const lowStockItems = inventory?.filter(item => item.stock <= item.reorderLevel) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">{inventory?.length || 0} total items</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openModal()} icon={Plus}>
          Add Item
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="p-4 border-orange-200 bg-orange-50">
          <div className="flex items-center space-x-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              {lowStockItems.length} item(s) low in stock
            </span>
          </div>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {inventory?.map((item) => (
          <Card key={item.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {item.stock <= item.reorderLevel && (
                  <Badge variant="warning" className="text-xs">
                    Low Stock
                  </Badge>
                )}
                <div className="flex space-x-1">
                  <button 
                    onClick={() => openModal(item)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Edit Item"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stock Level</span>
                <div className="text-right">
                  <span className={`font-semibold ${item.stock <= item.reorderLevel ? 'text-orange-600' : 'text-gray-900'}`}>
                    {item.stock}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    (min: {item.reorderLevel})
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unit Cost</span>
                <span className="font-medium text-gray-900">
                  ₵{item.unitCost.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Selling Price</span>
                <span className="font-medium text-green-600">
                  ₵{item.sellingPrice.toFixed(2)}
                </span>
              </div>

              {item.supplier && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{item.supplier}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-gray-600">Profit Margin</span>
                <span className="font-medium text-blue-600">
                  {((item.sellingPrice - item.unitCost) / item.unitCost * 100).toFixed(1)}%
                </span>
              </div>
              
              {item.stock <= item.reorderLevel && (
                <Button 
                  onClick={() => openReorderModal(item)}
                  variant="warning"
                  size="sm"
                  className="w-full"
                  icon={ShoppingCart}
                >
                  Request Reorder
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {(!inventory || inventory.length === 0) && !loading && (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No inventory items</h3>
          <p className="text-gray-600 mb-4">Start by adding parts and supplies to your inventory</p>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => openModal()}>Add First Item</Button>
        </Card>
      )}

      {/* Inventory Item Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingItem ? 'Edit Inventory Item' : 'Add New Item'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Engine Oil (5W-30)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {INVENTORY_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
              <Input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₵)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₵)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
            <Input
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Supplier name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details about the item..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {formData.unitCost > 0 && formData.sellingPrice > 0 && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Profit Margin:</strong> {formData.sellingPrice > formData.unitCost 
                  ? `${(((formData.sellingPrice - formData.unitCost) / formData.unitCost) * 100).toFixed(1)}%`
                  : 'Loss'
                } • 
                <strong> Profit per Unit:</strong> ₵{(formData.sellingPrice - formData.unitCost).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.category}
            >
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reorder Modal */}
      <Modal 
        isOpen={isReorderModalOpen} 
        onClose={() => setIsReorderModalOpen(false)} 
        title={`Request Reorder - ${reorderingItem?.name}`}
      >
        <div className="space-y-4">
          {reorderingItem && (
            <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2">Item Details</h4>
              <div className="text-sm text-orange-800 space-y-1">
                <p><strong>Current Stock:</strong> {reorderingItem.stock} units</p>
                <p><strong>Reorder Level:</strong> {reorderingItem.reorderLevel} units</p>
                <p><strong>Unit Cost:</strong> ₵{reorderingItem.unitCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity to Order *</label>
            <Input
              type="number"
              value={reorderForm.quantity}
              onChange={(e) => setReorderForm({ ...reorderForm, quantity: parseInt(e.target.value) || 0 })}
              min="1"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Suggested: {reorderingItem ? Math.max(reorderingItem.reorderLevel * 2, 10) : 10} units
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={reorderForm.notes}
              onChange={(e) => setReorderForm({ ...reorderForm, notes: e.target.value })}
              placeholder="Any special requirements or notes for this order..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          {reorderingItem && reorderForm.quantity > 0 && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Estimated Cost:</strong> ₵{(reorderForm.quantity * reorderingItem.unitCost).toFixed(2)}
                <br />
                <strong>This will bring stock to:</strong> {reorderingItem.stock + reorderForm.quantity} units
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="ghost" 
              onClick={() => setIsReorderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReorderSubmit}
              disabled={!reorderForm.quantity || reorderForm.quantity <= 0}
              variant="warning"
            >
              Submit Reorder Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InventoryPage;