import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from './UI';
import { apiService } from '../services/apiService';
import {
  Database,
  Flame,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Server,
  ArrowRightLeft
} from 'lucide-react';

type Provider = 'firebase' | 'postgres';

interface ConnectionStatus {
  status: 'connected' | 'error' | 'not_configured';
  message?: string;
  latencyMs?: number;
}

interface DBStatus {
  activeProvider: Provider;
  availableProviders: Provider[];
  connections: {
    firebase: ConnectionStatus;
    postgres: ConnectionStatus;
  };
}

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'connected') return <CheckCircle className="w-4 h-4 text-green-500" />;
  if (status === 'not_configured') return <AlertCircle className="w-4 h-4 text-yellow-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};

const statusLabel: Record<string, { text: string; color: string }> = {
  connected: { text: 'Connected', color: 'bg-green-100 text-green-700' },
  not_configured: { text: 'Not Configured', color: 'bg-yellow-100 text-yellow-700' },
  error: { text: 'Error', color: 'bg-red-100 text-red-700' }
};

const PROVIDER_INFO = {
  firebase: {
    label: 'Firebase Firestore',
    description: 'Google Firebase / Firestore — real-time NoSQL, scales automatically',
    icon: Flame,
    color: 'text-orange-500'
  },
  postgres: {
    label: 'PostgreSQL',
    description: 'Relational SQL database — full ACID compliance, complex queries',
    icon: Server,
    color: 'text-blue-500'
  }
};

const DatabaseSettings: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getDatabaseProviderStatus();
      if (res.success) {
        setDbStatus(res.data);
      } else {
        setError('Could not load database status');
      }
    } catch {
      setError('Backend unreachable — start the API server first');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleSwitch = async (provider: Provider) => {
    if (!dbStatus || provider === dbStatus.activeProvider) return;
    setSwitching(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await apiService.switchDatabaseProvider(provider);
      if (res.success) {
        setDbStatus(prev => prev ? { ...prev, activeProvider: provider } : prev);
        setSuccessMsg(`Switched to ${PROVIDER_INFO[provider].label}`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setError(res.error || 'Switch failed');
      }
    } catch {
      setError('Failed to switch provider');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Database Provider</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose the active database. The switch takes effect immediately — no restart needed.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-8 justify-center text-gray-400">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Checking database connections...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {(['firebase', 'postgres'] as Provider[]).map((provider) => {
            const info = PROVIDER_INFO[provider];
            const conn = dbStatus?.connections[provider];
            const isActive = dbStatus?.activeProvider === provider;
            const IconComp = info.icon;
            const sl = conn ? (statusLabel[conn.status] ?? statusLabel.error) : statusLabel.not_configured;

            return (
              <Card
                key={provider}
                className={`border-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`mt-0.5 ${info.color}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{info.label}</span>
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{info.description}</p>

                      {conn && (
                        <div className="flex items-center gap-2 mt-2">
                          <StatusIcon status={conn.status} />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sl.color}`}>
                            {sl.text}
                          </span>
                          {conn.latencyMs !== undefined && (
                            <span className="text-xs text-gray-400">{conn.latencyMs}ms</span>
                          )}
                          {conn.message && (
                            <span className="text-xs text-gray-400 truncate">{conn.message}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSwitch(provider)}
                      disabled={switching || conn?.status === 'not_configured'}
                      className="shrink-0"
                    >
                      {switching ? (
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
                          Use this
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="bg-gray-50 border-gray-200">
        <div className="flex items-start gap-3">
          <Database className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-700">Setup instructions</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>
                <strong>Firebase:</strong> Set <code className="bg-gray-100 px-1 rounded">FIREBASE_SERVICE_ACCOUNT</code> (JSON string) or{' '}
                <code className="bg-gray-100 px-1 rounded">FIREBASE_PROJECT_ID</code> in <code className="bg-gray-100 px-1 rounded">.env</code>
              </li>
              <li>
                <strong>PostgreSQL:</strong> Set <code className="bg-gray-100 px-1 rounded">DATABASE_URL</code> or individual{' '}
                <code className="bg-gray-100 px-1 rounded">DB_HOST</code> / <code className="bg-gray-100 px-1 rounded">DB_NAME</code> / <code className="bg-gray-100 px-1 rounded">DB_USER</code> /{' '}
                <code className="bg-gray-100 px-1 rounded">DB_PASSWORD</code> vars
              </li>
              <li>Run <code className="bg-gray-100 px-1 rounded">models/postgres/schema.sql</code> to initialise the PostgreSQL schema</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DatabaseSettings;
