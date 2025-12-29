import React, { useState } from 'react';
import { Card, Button } from './UI';
import { apiService } from '../services/apiService';
import { CreditCard, Smartphone, CheckCircle2, XCircle } from 'lucide-react';

const MobileMoneyTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    phone: '0241234567',
    amount: 100,
    provider: 'mtn' as 'mtn' | 'vodafone' | 'tigo'
  });

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await apiService.testMobileMoneyPayment(formData);
      setResult(response);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Payment test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="💳 Mobile Money Payment Test" className="max-w-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0241234567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (GHS)
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: parseInt(e.target.value) || 0})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            value={formData.provider}
            onChange={(e) => setFormData({...formData, provider: e.target.value as any})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="mtn">MTN Mobile Money</option>
            <option value="vodafone">Vodafone Cash</option>
            <option value="tigo">Tigo Cash</option>
          </select>
        </div>

        <Button 
          onClick={handleTest}
          disabled={isLoading}
          className="w-full"
        >
          <Smartphone className="mr-2" size={16} />
          {isLoading ? 'Processing...' : 'Test Payment'}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {result.success ? (
                <CheckCircle2 className="text-green-600" size={20} />
              ) : (
                <XCircle className="text-red-600" size={20} />
              )}
              <span className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.success ? 'Payment Initialized!' : 'Payment Failed'}
              </span>
            </div>
            
            {result.success && result.data && (
              <div className="text-sm space-y-1">
                <p><strong>Reference:</strong> {result.data.reference}</p>
                <p><strong>Amount:</strong> {result.data.currency} {result.data.amount}</p>
                <p><strong>Provider:</strong> {result.data.provider.toUpperCase()}</p>
                <p><strong>Status:</strong> {result.data.status}</p>
                <p className="text-green-700 mt-2">{result.data.message}</p>
              </div>
            )}
            
            {result.error && (
              <p className="text-sm text-red-700">{result.error}</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MobileMoneyTest;