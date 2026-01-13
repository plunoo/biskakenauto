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
import { generateAIContent, generateAIImage } from '../services/gemini';

interface BlogPost {
  id?: string;
  title: string;
  excerpt?: string;
  content: string;
  author?: string;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  readTime?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  views?: number;
  tags?: string[];
  featuredImage?: string;
}

interface BlogPostFormProps {
  initialData?: BlogPost | null;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
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
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    excerpt: initialData?.excerpt || '',
    content: initialData?.content || '',
    category: initialData?.category || 'General',
    tags: initialData?.tags?.join(', ') || '',
    status: initialData?.status || 'DRAFT',
    featuredImage: initialData?.featuredImage || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

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
        status: publishNow ? 'PUBLISHED' : formData.status,
        readTime: estimateReadTime(formData.content)
      };

      let response;
      if (initialData?.id) {
        // Update existing post
        response = await apiService.updateBlogPost(initialData.id, blogPostData);
      } else {
        // Create new post
        response = await apiService.createBlogPost(blogPostData);
      }

      if (response.success) {
        onSave(response.data);
        onCancel();
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

  const generateAIContentHandler = async (type: 'title' | 'excerpt' | 'content') => {
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
      
      const response = await generateAIContent(prompt, type);
      
      if (response.success && response.data) {
        // Update the form data with generated content
        handleInputChange(type, response.data);
      } else {
        throw new Error(response.error || 'AI generation failed');
      }
      
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('AI content generation failed. Please try again or write manually.');
    } finally {
      setAiGenerating(null);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageFile(file);
      const response = await apiService.uploadImage(file, formData.title);
      
      if (response.success && response.data?.imageUrl) {
        handleInputChange('featuredImage', response.data.imageUrl);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed. Please try again.');
    }
  };

  const generateAIImageHandler = async () => {
    setImageGenerating(true);
    
    try {
      const prompt = `${formData.category} automotive blog post illustration: ${formData.title || 'car maintenance'} - professional, clean, Ghana automotive context`;
      
      const response = await generateAIImage(prompt, 'illustration');
      
      if (response.success && response.data?.imageUrl) {
        handleInputChange('featuredImage', response.data.imageUrl);
      } else {
        throw new Error(response.error || 'AI image generation failed');
      }
      
    } catch (error) {
      console.error('AI image generation failed:', error);
      alert('AI image generation failed. Please try again or upload an image manually.');
    } finally {
      setImageGenerating(false);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const readTime = estimateReadTime(formData.content);

  // Component is always rendered when included

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl my-8 relative shadow-2xl border-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
              {initialData?.id ? '✏️ Edit Blog Post' : '✨ Create New Blog Post'}
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
              onClick={onCancel}
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
              
              {/* AI HELP SECTION - PROMINENT FOR NON-TECH USERS */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200 mb-8">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-purple-800 mb-2">🤖 AI Assistant - Let AI Write Your Blog Post!</h3>
                  <p className="text-purple-600">No writing experience needed! Choose what you want AI to create for you:</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => generateAIContentHandler('title')}
                    disabled={aiGenerating === 'title'}
                    className="h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    icon={aiGenerating === 'title' ? Loader : Sparkles}
                  >
                    {aiGenerating === 'title' ? 'Creating...' : '✨ Create Title'}
                  </Button>
                  
                  <Button
                    onClick={() => generateAIContentHandler('excerpt')}
                    disabled={aiGenerating === 'excerpt' || !formData.title}
                    className="h-16 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    icon={aiGenerating === 'excerpt' ? Loader : Brain}
                  >
                    {aiGenerating === 'excerpt' ? 'Creating...' : '🧠 Create Summary'}
                  </Button>
                  
                  <Button
                    onClick={() => generateAIContentHandler('content')}
                    disabled={aiGenerating === 'content' || !formData.title}
                    className="h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    icon={aiGenerating === 'content' ? Loader : Wand2}
                  >
                    {aiGenerating === 'content' ? 'Writing...' : '📝 Write Full Article'}
                  </Button>
                  
                  <Button
                    onClick={generateAIImageHandler}
                    disabled={imageGenerating || !formData.title}
                    className="h-16 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    icon={imageGenerating ? Loader : Sparkles}
                  >
                    {imageGenerating ? 'Creating...' : '🖼️ Create Image'}
                  </Button>
                </div>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-purple-600 font-medium">
                    💡 Tip: Start with "Create Title" then use other buttons. AI will create professional content for you!
                  </p>
                </div>
              </div>

              {/* Title and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Post Title *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter an engaging title for your blog post... (or use AI Create Title button above)"
                    error={errors.title}
                  />
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt * <span className="text-purple-600 text-xs">(or use "🧠 Create Summary" button above)</span>
                </label>
                <textarea
                  className={`w-full p-3 border rounded-md h-24 focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.excerpt ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="Write a compelling excerpt that summarizes your post... (or click 'Create Summary' above to let AI write it)"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content * <span className="text-green-600 text-xs">(or use "📝 Write Full Article" button above to let AI write everything)</span>
                </label>
                <textarea
                  className={`w-full p-3 border rounded-md h-64 focus:ring-2 focus:ring-blue-500 resize-y ${
                    errors.content ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog post content here... (or click 'Write Full Article' above to let AI create a complete professional article for you)"
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

              {/* Featured Image */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Featured Image <span className="text-orange-600 text-xs">(or use "🖼️ Create Image" button above to let AI create one)</span>
                </label>
                
                {formData.featuredImage && (
                  <div className="relative">
                    <img 
                      src={formData.featuredImage} 
                      alt="Featured" 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      onClick={() => handleInputChange('featuredImage', '')}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
                        <Upload size={20} className="text-gray-500" />
                        <span className="text-sm text-gray-700">Upload Image</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                  
                  <div className="bg-orange-50 border-2 border-dashed border-orange-300 rounded-lg p-4 text-center">
                    <p className="text-orange-600 font-medium">
                      💡 Use the big "🖼️ Create Image" button above to let AI create a professional image for your blog post!
                    </p>
                  </div>
                </div>
                
                {formData.featuredImage && !formData.featuredImage.startsWith('blob:') && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                    📷 Image URL: {formData.featuredImage}
                  </div>
                )}
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
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-8 bg-gradient-to-r from-slate-50 to-white border-t border-slate-200">
          <div className="flex items-center gap-3">
            {initialData?.id ? (
              <div className="flex items-center gap-2 text-slate-600">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">Last Updated</div>
                  <div className="text-xs text-slate-500">{new Date(initialData.createdAt || initialData.updatedAt || new Date()).toLocaleDateString()}</div>
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
              onClick={onCancel}
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