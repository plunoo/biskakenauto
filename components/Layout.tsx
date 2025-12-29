
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  Package, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  ChevronDown
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';

const SidebarItem: React.FC<{ icon: any; label: string; to: string; active?: boolean; onClick?: () => void }> = ({ 
  icon: Icon, label, to, active, onClick 
}) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, notifications, markAllNotificationsRead } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

  if (!user) return <>{children}</>;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.STAFF] },
    { label: 'Customers', icon: Users, to: '/customers', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.STAFF] },
    { label: 'Jobs', icon: Wrench, to: '/jobs', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.STAFF] },
    { label: 'Inventory', icon: Package, to: '/inventory', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN] },
    { label: 'Invoices', icon: FileText, to: '/invoices', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN, UserRole.STAFF] },
    { label: 'Reports', icon: BarChart3, to: '/reports', roles: [UserRole.ADMIN, UserRole.SUB_ADMIN] },
    { label: 'Settings', icon: Settings, to: '/settings', roles: [UserRole.ADMIN] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  // Get time ago format for notifications
  const getTimeAgo = (time: string) => {
    const now = new Date();
    const notifTime = new Date(time);
    const diffInMinutes = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">B</div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">BISKAKEN</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {filteredNavItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              {...item} 
              active={location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none">
            <h2 className="text-lg font-semibold text-gray-900 lg:hidden">
              {navItems.find(i => location.pathname.startsWith(i.to))?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notificationRef}>
              <button 
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <p className="text-xs text-gray-500">{unreadCount} unread</p>
                    )}
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${
                          notification.unread ? 'border-blue-500 bg-blue-50/30' : 'border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`text-sm ${notification.unread ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(notification.time)}</p>
                          </div>
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'job' ? 'bg-blue-500' :
                            notification.type === 'payment' ? 'bg-green-500' :
                            notification.type === 'inventory' ? 'bg-orange-500' :
                            notification.type === 'reorder' ? 'bg-purple-500' :
                            notification.type === 'user' ? 'bg-red-500' :
                            'bg-gray-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => {
                        markAllNotificationsRead();
                        setIsNotificationOpen(false);
                      }}
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-1 pl-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900 leading-none">{user.name}</p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'SUB_ADMIN' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1">
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Profile Settings
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link 
                        to="/admin" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Users size={16} className="mr-3" />
                        User Management
                      </Link>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-100 py-1">
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <span className="text-xl font-bold">Biskaken</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {filteredNavItems.map((item) => (
                <SidebarItem 
                  key={item.to} 
                  {...item} 
                  active={location.pathname === item.to}
                  onClick={() => setIsSidebarOpen(false)}
                />
              ))}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-medium">
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
