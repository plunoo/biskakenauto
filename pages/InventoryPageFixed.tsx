import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, AlertTriangle, Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { InventoryItem } from '../types';

const InventoryPageFixed: React.FC = () => {
  const { inventory, addInventory, updateInventory, deleteInventory, updateInventoryStock } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  
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

  const filteredInventory = inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockItems = inventory.filter(item => item.stock <= item.reorderLevel);

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock <= item.reorderLevel) {
      return { color: 'bg-red-100 text-red-800', text: 'Low Stock' };
    }
    if (item.stock <= item.reorderLevel * 2) {
      return { color: 'bg-yellow-100 text-yellow-800', text: 'Medium Stock' };
    }
    return { color: 'bg-green-100 text-green-800', text: 'In Stock' };
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category) return;

    if (editingItem) {
      updateInventory(editingItem.id, formData);
    } else {
      const newItem: InventoryItem = {
        id: `INV${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString()
      };
      addInventory(newItem);
    }

    resetForm();
    setIsModalOpen(false);
  };

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

  const handleEdit = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      stock: item.stock,
      reorderLevel: item.reorderLevel,
      unitCost: item.unitCost || 0,
      sellingPrice: item.sellingPrice || 0,
      supplier: item.supplier || '',
      description: item.description || ''
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (itemId: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteInventory(itemId);
    }
  };

  const handleStockUpdate = (itemId: string, newStock: number) => {
    if (newStock >= 0) {
      updateInventoryStock(itemId, newStock);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts & Inventory</h1>
          <p className="text-gray-500">Manage parts, stock levels, and suppliers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle size={20} />
            <span className="font-semibold">Low Stock Alert</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            {lowStockItems.length} item(s) are running low on stock
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInventory.map(item => {
          const stockStatus = getStockStatus(item);
          return (
            <div key={item.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                    {stockStatus.text}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.category}</p>
                {item.supplier && (
                  <p className="text-xs text-gray-400 mt-1">Supplier: {item.supplier}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-500">Stock:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => handleStockUpdate(item.id, item.stock - 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                      disabled={item.stock <= 0}
                    >
                      -
                    </button>
                    <span className="font-semibold min-w-[2rem] text-center">{item.stock}</span>
                    <button 
                      onClick={() => handleStockUpdate(item.id, item.stock + 1)}
                      className="w-6 h-6 bg-gray-200 rounded text-gray-600 hover:bg-gray-300 flex items-center justify-center text-xs"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Reorder Level:</span>
                  <p className="font-semibold">{item.reorderLevel}</p>
                </div>
              </div>

              {(item.unitCost || item.sellingPrice) && (
                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                  {item.unitCost && (
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <p className="font-semibold">₵{item.unitCost}</p>
                    </div>
                  )}
                  {item.sellingPrice && (
                    <div>
                      <span className="text-gray-500">Selling:</span>
                      <p className="font-semibold text-green-600">₵{item.sellingPrice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredInventory.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Package size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No inventory items found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or add new items.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Engine Oil"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g., Oils"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₵)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({...formData, sellingPrice: parseFloat(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.supplier}
                    onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description or notes"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!formData.name || !formData.category}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPageFixed;