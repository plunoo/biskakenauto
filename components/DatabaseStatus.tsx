import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { apiService } from '../services/apiService';

interface DatabaseStatusProps {
  refreshInterval?: number; // in milliseconds
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ refreshInterval = 30000 }) => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkDatabaseConnection = async () => {
    try {
      setStatus('checking');
      
      // Try to make a simple API call to check connectivity
      const response = await fetch('/api/health', {
        method: 'GET',
        timeout: 5000 as any
      });
      
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      // Try alternative endpoints
      try {
        const customerResponse = await apiService.getCustomers();
        if (customerResponse.success) {
          setStatus('connected');
        } else {
          setStatus('disconnected');
        }
      } catch (secondError) {
        setStatus('error');
      }
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkDatabaseConnection();
    
    const interval = setInterval(checkDatabaseConnection, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 size={16} className="text-green-600" />;
      case 'disconnected':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      case 'checking':
      default:
        return <Clock size={16} className="text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Database Connected';
      case 'disconnected':
        return 'Database Disconnected';
      case 'error':
        return 'Connection Error';
      case 'checking':
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
      case 'error':
        return 'text-red-600';
      case 'checking':
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">Database Status</span>
      <div className="flex items-center space-x-2">
        <span className={`flex items-center text-sm ${getStatusColor()}`}>
          {getStatusIcon()}
          <span className="ml-1">{getStatusText()}</span>
        </span>
        {lastChecked && (
          <span className="text-xs text-gray-400">
            {lastChecked.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;