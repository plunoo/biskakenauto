import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Eye, 
  Upload,
  Tag,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
  Brain,
  Wand2
} from 'lucide-react';
import { Button, Input, Card } from './UI';
import { apiService } from '../services/apiService';
// import { getAIInsights } from '../services/gemini';

interface BlogPost {
  id?: string;
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

interface BlogPostFormProps {
  post?: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
}

const CATEGORIES = [
  'General',
  'Technology', 
  'Maintenance',
  'Business',
  'Technical',
  'Guide',
  'News',
  'Tips & Tricks'
];

export const BlogPostForm: React.FC<BlogPostFormProps> = ({
  post,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    category: post?.category || 'General',
    tags: post?.tags?.join(', ') || '',
    status: post?.status || 'draft'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    } else if (formData.excerpt.length < 50) {
      newErrors.excerpt = 'Excerpt must be at least 50 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 200) {
      newErrors.content = 'Content must be at least 200 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime} min read`;
  };

  const handleSubmit = async (publishNow = false) => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const blogPostData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        tags,
        status: publishNow ? 'published' : formData.status,
        readTime: estimateReadTime(formData.content)
      };

      let response;
      if (post?.id) {
        // Update existing post
        response = await apiService.updateBlogPost(post.id, blogPostData);
      } else {
        // Create new post
        response = await apiService.createBlogPost(blogPostData);
      }

      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Failed to save blog post:', error);
      alert('Failed to save blog post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAIContent = async (type: 'title' | 'excerpt' | 'content') => {
    setAiGenerating(type);
    
    try {
      // Create a prompt based on the type and existing content
      let prompt = '';
      const category = formData.category.toLowerCase();
      
      switch (type) {
        case 'title':
          prompt = `Create an engaging blog post title about ${category} for an auto repair shop in Ghana. Make it catchy and SEO-friendly. Topic context: "${formData.excerpt || formData.content || 'automotive services'}"`;
          break;
        case 'excerpt':
          prompt = `Write a compelling 100-word excerpt for this blog post title: "${formData.title}" in the ${category} category for an auto repair business in Ghana.`;
          break;
        case 'content':
          prompt = `Write a detailed blog post about "${formData.title}" for an auto repair shop in Ghana. Category: ${category}. Make it informative, practical, and relevant to Ghanaian automotive culture. Include tips, insights, and local context. Aim for 500-800 words.`;
          break;
      }
      
      const response = await getAIInsights(prompt);
      const generatedContent = response[0] || 'AI content generation failed';
      
      // Update the form data with generated content
      handleInputChange(type, generatedContent);
      
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI content generation failed. Please try again or write manually.');
    } finally {
      setAiGenerating(null);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readTime = estimateReadTime(formData.content);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl my-8 relative shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              {post?.id ? '✏️ Edit Blog Post' : '✨ Create New Blog Post'}
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm text-slate-600 font-medium">
                {wordCount} words • {readTime}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-500">Auto-saving</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              icon={Eye}
              className="px-6 py-3 rounded-xl border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-medium"
            >
              {showPreview ? '📝 Edit' : '👁️ Preview'}
            </Button>
            <button
              onClick={onClose}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {showPreview ? (
            /* Preview Mode */
            <div className="prose max-w-none bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border-2 border-slate-200">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 text-sm font-bold rounded-full">
                    {formData.category}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sm text-slate-600 font-medium">{readTime}</span>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-purple-700 bg-clip-text text-transparent mb-4 leading-tight">
                  {formData.title || '✨ Untitled Post'}
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed mb-6">
                  {formData.excerpt || 'No excerpt provided'}
                </p>
                {formData.tags && (
                  <div className="flex items-center gap-3 mt-6">
                    <Tag size={16} className="text-purple-500" />
                    <div className="flex gap-2 flex-wrap">
                      {formData.tags.split(',').map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm rounded-full font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 pt-8">
                <div className="whitespace-pre-wrap text-slate-800 leading-relaxed text-lg">
                  {formData.content || 'No content provided'}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-6">
              {/* Title and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        label="Post Title *"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter an engaging title for your blog post..."
                        error={errors.title}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateAIContent('title')}
                      disabled={aiGenerating === 'title'}
                      className="mb-1 bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700 hover:from-purple-200 hover:to-blue-200 px-3 py-2 rounded-xl"
                      icon={aiGenerating === 'title' ? Loader : Sparkles}
                    >
                      AI
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Excerpt *
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIContent('excerpt')}
                    disabled={aiGenerating === 'excerpt' || !formData.title}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700 hover:from-purple-200 hover:to-blue-200 px-3 py-1 rounded-lg text-xs"
                    icon={aiGenerating === 'excerpt' ? Loader : Brain}
                  >
                    AI Generate
                  </Button>
                </div>
                <textarea
                  className={`w-full p-3 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.excerpt ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Write a compelling excerpt that summarizes your post..."
                  maxLength={200}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.excerpt ? (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.excerpt}
                    </p>
                  ) : (
                    <div></div>
                  )}
                  <span className="text-sm text-gray-500">
                    {formData.excerpt.length}/200
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <Input
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Enter tags separated by commas (e.g. Ghana, Auto Repair, Technology)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generateAIContent('content')}
                    disabled={aiGenerating === 'content' || !formData.title}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 text-purple-700 hover:from-purple-200 hover:to-blue-200 px-3 py-1 rounded-lg text-xs"
                    icon={aiGenerating === 'content' ? Loader : Wand2}
                  >
                    AI Generate Full Content
                  </Button>
                </div>
                <textarea
                  className={`w-full p-3 border rounded-md h-64 focus:ring-2 focus:ring-blue-500 resize-y ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog post content here..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.content ? (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle size={14} />
                      {errors.content}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Minimum 200 characters for good readability
                    </p>
                  )}
                  <span className="text-sm text-gray-500">
                    {wordCount} words
                  </span>
                </div>
              </div>

              {/* Status */}
              <Card className="p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Publication Status</h3>
                    <p className="text-sm text-gray-600">
                      Control when your post becomes visible to readers
                    </p>
                  </div>
                  <select
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
          <div className="flex items-center gap-3">
            {post?.id ? (
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">Last Updated</div>
                  <div className="text-xs text-slate-500">{new Date(post.date).toLocaleDateString()}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText size={16} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">New Blog Post</div>
                  <div className="text-xs text-slate-500">Ready to create</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </Button>
            
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              icon={isSubmitting ? Loader : Save}
              className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {isSubmitting ? 'Saving...' : '💾 Save Draft'}
            </Button>
            
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              icon={isSubmitting ? Loader : CheckCircle}
            >
              {isSubmitting ? 'Publishing...' : '🚀 Publish Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostForm;