
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button, Input, Card } from '../components/UI';
import { UserRole } from '../types';
import { LogIn } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }
    
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      alert('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">B</div>
          <h1 className="text-2xl font-bold text-gray-900">Biskaken Admin Login</h1>
          <p className="text-gray-500">Staff and admin access only</p>
          <div className="mt-4 p-3 bg-amber-50 rounded-md text-sm border border-amber-200">
            <p className="font-medium text-amber-800">🔐 Admin/Staff Access Required</p>
            <p className="text-amber-600">Contact your workshop manager for login credentials</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input 
            label="Staff Email Address" 
            placeholder="Enter your work email" 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            placeholder="Enter your password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" className="w-full" size="lg" icon={LogIn}>
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/landing" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Biskaken Homepage
          </Link>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400 uppercase tracking-widest">
          Ghana Market Edition 🇬🇭
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
