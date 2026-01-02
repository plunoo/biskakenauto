import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Button, Input, Card } from '../components/UI';
import BlogPostForm from '../components/BlogPostForm';
import { apiService } from '../services/apiService';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorId: string;
  date: string;
  category: string;
  readTime: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  tags: string[];
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalViews: number;
}

const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      console.log('📚 Loading blog posts...');
      const response = await apiService.getBlogPosts();
      if (response.success) {
        setPosts(response.data);
        console.log('✅ Blog posts loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
      const response = await apiService.deleteBlogPost(postId);
      if (response.success) {
        setPosts(posts.filter(post => post.id !== postId));
        console.log('✅ Blog post deleted:', postId);
      }
    } catch (error) {
      console.error('❌ Failed to delete blog post:', error);
      alert('Failed to delete blog post');
    }
  };

  const handleUpdateStatus = async (postId: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const response = await apiService.updateBlogPostStatus(postId, newStatus);
      if (response.success) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, status: newStatus } : post
        ));
        console.log('✅ Blog post status updated:', postId, newStatus);
      }
    } catch (error) {
      console.error('❌ Failed to update blog post status:', error);
      alert('Failed to update blog post status');
    }
  };

  const handleSavePost = (savedPost: BlogPost) => {
    if (editingPost) {
      // Update existing post
      setPosts(posts.map(post => 
        post.id === savedPost.id ? savedPost : post
      ));
    } else {
      // Add new post
      setPosts([savedPost, ...posts]);
    }
    setIsCreating(false);
    setEditingPost(null);
  };

  const getStats = (): BlogStats => {
    return {
      totalPosts: posts.length,
      publishedPosts: posts.filter(p => p.status === 'published').length,
      draftPosts: posts.filter(p => p.status === 'draft').length,
      totalViews: posts.reduce((sum, post) => sum + post.views, 0)
    };
  };

  const getCategories = () => {
    const categories = Array.from(new Set(posts.map(post => post.category)));
    return categories.sort();
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(post => post.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(post => post.category === filterCategory);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'draft':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'archived':
        return <FileText size={16} className="text-gray-500" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const stats = getStats();
  const filteredPosts = getFilteredPosts();
  const categories = getCategories();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
            <BookOpen className="text-purple-600" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-purple-700 bg-clip-text text-transparent">
              Blog Management
            </h1>
            <p className="text-slate-600 mt-1">Create and manage your automotive blog content</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          icon={Plus}
        >
          Create New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700">Total Posts</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalPosts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-green-100/50 border-0 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700">Published</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.publishedPosts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-100/50 border-0 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700">Drafts</p>
              <p className="text-3xl font-bold text-amber-900">{stats.draftPosts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-violet-100/50 border-0 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">Total Views</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-8 bg-gradient-to-br from-slate-50 to-white border-0 shadow-lg rounded-2xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Input
                placeholder="Search posts by title, content, author, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <select
                className="px-6 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer font-medium text-slate-700 min-w-[140px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
            <div className="relative">
              <select
                className="px-6 py-4 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none cursor-pointer font-medium text-slate-700 min-w-[160px]"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <Tag className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
        
        {/* Filter Summary */}
        {(searchTerm || filterStatus !== 'all' || filterCategory !== 'all') && (
          <div className="flex items-center gap-2 mt-6 p-4 bg-purple-50 rounded-xl">
            <span className="text-sm text-purple-700 font-medium">Active filters:</span>
            {searchTerm && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Search: "{searchTerm}"
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Status: {filterStatus}
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                Category: {filterCategory}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterCategory('all');
              }}
              className="ml-2 text-purple-600 hover:text-purple-800 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        )}
      </Card>

      {/* Posts List */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Blog Posts ({filteredPosts.length})
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all' || filterCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first blog post'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && filterCategory === 'all' && (
              <Button 
                onClick={() => setIsCreating(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                icon={Plus}
              >
                Create First Post
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(post.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}>
                        {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-blue-600 font-medium">{post.category}</span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{post.views.toLocaleString()} views</span>
                      </div>
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        <Tag size={14} className="text-gray-400" />
                        <div className="flex gap-2">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{post.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPost(post)}
                      icon={Edit3}
                    >
                      Edit
                    </Button>
                    
                    <div className="relative">
                      <select
                        className="text-sm border border-gray-300 rounded px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
                        value={post.status}
                        onChange={(e) => handleUpdateStatus(post.id, e.target.value as any)}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePost(post.id)}
                      icon={Trash2}
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Blog Post Form */}
      <BlogPostForm
        post={editingPost}
        isOpen={isCreating || !!editingPost}
        onClose={() => {
          setIsCreating(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
      />
    </div>
  );
};

export default BlogPage;