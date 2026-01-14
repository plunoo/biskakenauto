import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Eye, Search, Filter, Sparkles, Brain, FileText, Image, Upload, Video } from 'lucide-react';
import { Button } from '../components/UI';
import { BlogPostForm } from '../components/BlogPostForm';
import { apiService } from '../services/apiService';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  author: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

const BlogManagementPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');
  const [loading, setLoading] = useState(false);

  const loadBlogPosts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getBlogPosts();
      if (response.success) {
        setPosts(response.data || []);
      } else {
        // Fallback demo data
        setPosts([
          {
            id: '1',
            title: 'Essential Car Maintenance Tips for Summer',
            content: 'With summer approaching, it\'s crucial to prepare your vehicle for the hot weather...',
            excerpt: 'Prepare your car for summer with these essential maintenance tips.',
            status: 'PUBLISHED',
            author: 'Admin',
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-10T10:00:00Z',
            tags: ['maintenance', 'summer', 'tips']
          },
          {
            id: '2', 
            title: 'How to Choose the Right Motor Oil',
            content: 'Selecting the correct motor oil for your vehicle is essential...',
            excerpt: 'Learn how to select the best motor oil for your vehicle.',
            status: 'DRAFT',
            author: 'Admin',
            createdAt: '2024-01-09T15:30:00Z',
            updatedAt: '2024-01-09T15:30:00Z',
            tags: ['oil', 'maintenance']
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
      // Use fallback data on error
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const handleCreatePost = () => {
    setEditingPost(null);
    setIsFormOpen(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setIsFormOpen(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await apiService.deleteBlogPost(postId);
        await loadBlogPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        // Remove from local state as fallback
        setPosts(prev => prev.filter(post => post.id !== postId));
      }
    }
  };

  const handleSavePost = async (postData: any) => {
    try {
      if (editingPost) {
        await apiService.updateBlogPost(editingPost.id, postData);
      } else {
        await apiService.createBlogPost(postData);
      }
      setIsFormOpen(false);
      setEditingPost(null);
      await loadBlogPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      setIsFormOpen(false);
    }
  };

  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await apiService.updateBlogPostStatus(postId, newStatus);
      await loadBlogPosts();
    } catch (error) {
      console.error('Error updating status:', error);
      // Update local state as fallback
      setPosts(prev => 
        prev.map(post => 
          post.id === postId ? { ...post, status: newStatus as any } : post
        )
      );
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-100 text-green-800';
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>
          <Button
            variant="outline"
            onClick={() => setIsFormOpen(false)}
          >
            Back to Posts
          </Button>
        </div>
        <BlogPostForm
          initialData={editingPost}
          onSave={handleSavePost}
          onCancel={() => setIsFormOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-600">Create and manage your blog content</p>
        </div>
        <Button onClick={handleCreatePost}>
          <PlusCircle size={20} />
          New Post
        </Button>
      </div>

      {/* AI Assistant Section - Prominent for Non-Tech Users */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 p-8 rounded-2xl text-white shadow-xl border border-purple-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
            <Sparkles size={32} className="text-yellow-300" />
            🤖 AI Blog Writer - Let AI Create Your Content!
            <Sparkles size={32} className="text-yellow-300" />
          </h2>
          <p className="text-purple-100 text-lg">Perfect for auto shop owners - No writing experience needed!</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Button 
            className="h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <Sparkles size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">✨ AI Create Title</div>
              <div className="text-xs opacity-90">Smart blog titles</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <Brain size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🧠 AI Write Summary</div>
              <div className="text-xs opacity-90">Perfect excerpts</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <FileText size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📝 AI Full Article</div>
              <div className="text-xs opacity-90">Complete posts</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <Image size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🖼️ AI Create Image</div>
              <div className="text-xs opacity-90">Blog photos</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <Upload size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">📷 Upload Photo</div>
              <div className="text-xs opacity-90">Add your images</div>
            </div>
          </Button>
          
          <Button 
            className="h-20 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-200"
            onClick={handleCreatePost}
          >
            <div className="text-center">
              <Video size={24} className="mx-auto mb-1" />
              <div className="text-sm font-bold">🎥 Upload Video</div>
              <div className="text-xs opacity-90">Add your videos</div>
            </div>
          </Button>
        </div>
        
        <div className="text-center mt-6">
          <p className="text-purple-100 text-sm">
            💡 <strong>Perfect for auto shop owners!</strong> Click any button above and AI will help you write professional blog posts about car repairs, maintenance tips, and more.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading posts...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery || statusFilter !== 'ALL' 
              ? 'No posts match your search criteria' 
              : 'No blog posts yet. Create your first post!'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>By {post.author}</span>
                      <span>Created {new Date(post.createdAt).toLocaleDateString()}</span>
                      {post.tags && post.tags.length > 0 && (
                        <span>Tags: {post.tags.join(', ')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {post.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                      >
                        Publish
                      </Button>
                    )}
                    {post.status === 'PUBLISHED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(post.id, 'ARCHIVED')}
                      >
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPost(post)}
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagementPage;