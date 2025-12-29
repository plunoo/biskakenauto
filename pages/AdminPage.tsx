import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input } from '../components/UI';
import { useStore } from '../store/useStore';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Shield, 
  UserCheck,
  FileEdit,
  Rss,
  Mail
} from 'lucide-react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

const AdminPage: React.FC = () => {
  const { user, reorderRequests, updateReorderStatus } = useStore();
  
  // State for user management
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<any>(null);
  
  // Mock users data (in v1.1+ this would come from API)
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // Form states
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: UserRole.STAFF as UserRole
  });
  
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [blogForm, setBlogForm] = useState({
    title: '',
    content: '',
    status: 'draft' as 'draft' | 'published'
  });

  // Mock blog posts (v1.1+ feature)
  const [blogPosts, setBlogPosts] = useState([
    { id: 1, title: 'Car Maintenance Tips for Ghana Roads', author: 'Admin', status: 'published', date: '2025-12-20' },
    { id: 2, title: 'Common Engine Problems and Solutions', author: 'Admin', status: 'draft', date: '2025-12-25' },
    { id: 3, title: 'Brake Safety Checklist', author: 'Admin', status: 'published', date: '2025-12-28' }
  ]);

  // Only allow admins to access this page
  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  // User Management Functions
  const openUserModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setUserForm({
        name: '',
        email: '',
        role: UserRole.STAFF
      });
    }
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = () => {
    if (!userForm.name || !userForm.email) return;
    
    const userData: User = {
      id: editingUser?.id || `U${Date.now()}`,
      name: userForm.name,
      email: userForm.email,
      role: userForm.role
    };

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? userData : u));
    } else {
      setUsers([...users, userData]);
    }
    
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === user?.id) {
      alert('You cannot delete your own account');
      return;
    }
    if (confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  const openPasswordModal = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setIsPasswordModalOpen(true);
  };

  const handlePasswordReset = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    // In v1.1+ this would call API
    alert(`Password reset for ${selectedUser?.name} (In production, this would update the database)`);
    setIsPasswordModalOpen(false);
  };

  // Blog Management Functions
  const openBlogModal = (post?: any) => {
    if (post) {
      setEditingBlogPost(post);
      setBlogForm({
        title: post.title,
        content: `Sample content for: ${post.title}`, // In v1.1+ this would come from API
        status: post.status
      });
    } else {
      setEditingBlogPost(null);
      setBlogForm({
        title: '',
        content: '',
        status: 'draft'
      });
    }
    setIsBlogModalOpen(true);
  };

  const handleBlogSubmit = () => {
    if (!blogForm.title) return;
    
    const blogData = {
      id: editingBlogPost?.id || Date.now(),
      title: blogForm.title,
      content: blogForm.content,
      status: blogForm.status,
      author: user?.name || 'Admin',
      date: editingBlogPost?.date || new Date().toISOString().split('T')[0]
    };

    if (editingBlogPost) {
      setBlogPosts(blogPosts.map(p => p.id === editingBlogPost.id ? blogData : p));
    } else {
      setBlogPosts([...blogPosts, blogData]);
    }
    
    setIsBlogModalOpen(false);
  };

  const handleDeleteBlogPost = (postId: number) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setBlogPosts(blogPosts.filter(p => p.id !== postId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-600">Manage users, passwords, and blog content</p>
        </div>
      </div>

      {/* User Management Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
              <p className="text-sm text-gray-600">{users.length} total users</p>
            </div>
          </div>
          <Button onClick={() => openUserModal()} icon={Plus}>
            Add User
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{u.name}</h3>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <Badge variant={
                  u.role === 'ADMIN' ? 'danger' :
                  u.role === 'SUB_ADMIN' ? 'warning' : 'outline'
                }>
                  {u.role.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => openUserModal(u)}
                  className="flex-1 text-xs bg-blue-50 text-blue-600 py-1 px-2 rounded hover:bg-blue-100"
                >
                  <Edit size={12} className="inline mr-1" />
                  Edit
                </button>
                <button 
                  onClick={() => openPasswordModal(u)}
                  className="flex-1 text-xs bg-yellow-50 text-yellow-600 py-1 px-2 rounded hover:bg-yellow-100"
                >
                  <Key size={12} className="inline mr-1" />
                  Reset
                </button>
                {u.id !== user?.id && (
                  <button 
                    onClick={() => handleDeleteUser(u.id)}
                    className="flex-1 text-xs bg-red-50 text-red-600 py-1 px-2 rounded hover:bg-red-100"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Reorder Management Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-full">
              <ShoppingCart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Reorder Requests</h2>
              <p className="text-sm text-gray-600">{reorderRequests.length} pending requests</p>
            </div>
          </div>
        </div>

        {reorderRequests.length > 0 ? (
          <div className="space-y-3">
            {reorderRequests.map((request) => (
              <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{request.itemName}</h4>
                      <Badge variant={
                        request.status === 'pending' ? 'warning' :
                        request.status === 'approved' ? 'success' :
                        request.status === 'rejected' ? 'danger' :
                        'outline'
                      }>
                        {request.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <span className="font-medium">Requested by:</span>
                        <p>{request.requestedBy}</p>
                      </div>
                      <div>
                        <span className="font-medium">Current Stock:</span>
                        <p>{request.currentStock} units</p>
                      </div>
                      <div>
                        <span className="font-medium">Quantity:</span>
                        <p>{request.requestedQuantity} units</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(request.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="p-2 bg-blue-50 rounded text-sm text-blue-800 mb-3">
                        <strong>Notes:</strong> {request.notes}
                      </div>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button 
                        onClick={() => updateReorderStatus(request.id, 'approved')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => updateReorderStatus(request.id, 'rejected')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No reorder requests at this time</p>
          </div>
        )}
      </Card>

      {/* Blog Management Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Rss className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Blog Management</h2>
              <p className="text-sm text-gray-600">{blogPosts.length} blog posts</p>
            </div>
          </div>
          <Button onClick={() => openBlogModal()} icon={Plus}>
            New Post
          </Button>
        </div>

        <div className="space-y-3">
          {blogPosts.map((post) => (
            <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{post.title}</h4>
                <p className="text-sm text-gray-600">
                  By {post.author} • {post.date} • 
                  <Badge variant={post.status === 'published' ? 'success' : 'warning'} className="ml-2">
                    {post.status}
                  </Badge>
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => openBlogModal(post)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit Post"
                >
                  <FileEdit size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteBlogPost(post.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* User Modal */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
            <Input
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <Input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              placeholder="email@biskaken.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value={UserRole.STAFF}>Staff</option>
              <option value={UserRole.SUB_ADMIN}>Sub Admin</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsUserModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUserSubmit} disabled={!userForm.name || !userForm.email}>
              {editingUser ? 'Update User' : 'Add User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title={`Reset Password - ${selectedUser?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
            <Input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              placeholder="Enter new password (min 6 chars)"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
            <Input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              placeholder="Confirm new password"
              required
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordReset} 
              disabled={!passwordForm.newPassword || !passwordForm.confirmPassword}
              variant="warning"
            >
              Reset Password
            </Button>
          </div>
        </div>
      </Modal>

      {/* Blog Post Modal */}
      <Modal 
        isOpen={isBlogModalOpen} 
        onClose={() => setIsBlogModalOpen(false)} 
        title={editingBlogPost ? 'Edit Blog Post' : 'Create New Blog Post'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <Input
              value={blogForm.title}
              onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
              placeholder="Blog post title"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea
              value={blogForm.content}
              onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
              placeholder="Write your blog content here..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={8}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              📝 Rich text editor with image upload coming in v1.1+
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={blogForm.status}
              onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value as 'draft' | 'published' })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsBlogModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlogSubmit} disabled={!blogForm.title}>
              {editingBlogPost ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;