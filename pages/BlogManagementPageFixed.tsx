import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Send, 
  Trash2, 
  BookOpen, 
  Loader2,
  RefreshCcw,
  Check,
  X,
  Camera,
  Plus
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  date: string;
  slug?: string;
}

const BlogManagementPageFixed: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock blog posts for demo
  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Top 5 Car Maintenance Tips for 2024',
      content: 'Regular maintenance is key to keeping your vehicle running smoothly...',
      excerpt: 'Essential maintenance tips every car owner should know',
      category: 'Maintenance',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=300&fit=crop',
      date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Understanding Your Car\'s Warning Lights',
      content: 'Dashboard warning lights can be confusing. Here\'s what they mean...',
      excerpt: 'Decode the mysterious lights on your dashboard',
      category: 'Safety',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=300&fit=crop',
      date: new Date().toISOString()
    }
  ];

  useEffect(() => {
    setBlogPosts(mockPosts);
  }, []);

  const generateBlogPost = async () => {
    if (!topic.trim()) return;
    
    setIsGeneratingText(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newPost: Partial<BlogPost> = {
        title: `Complete Guide to ${topic}`,
        content: `This comprehensive guide covers everything you need to know about ${topic}. 

As automotive technology continues to evolve, understanding ${topic} becomes increasingly important for every car owner. Whether you're a seasoned driver or new to vehicle ownership, this guide will help you navigate the complexities.

## Key Points to Remember

1. **Regular Maintenance**: Consistent care prevents major issues
2. **Early Detection**: Recognizing problems early saves money
3. **Professional Service**: Know when to consult experts
4. **Safety First**: Never compromise on safety features

## Conclusion

By following these guidelines for ${topic}, you'll ensure your vehicle remains reliable, safe, and efficient for years to come.`,
        excerpt: `Everything you need to know about ${topic} in the automotive world`,
        category: 'Automotive',
        readTime: '8 min read',
        image: '', // Will be set by user choice
        date: new Date().toISOString()
      };
      
      setCurrentPost(newPost);
      setShowImageOptions(true);
    } catch (error) {
      console.error('Error generating blog post:', error);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const generateAIImage = async () => {
    if (!imagePrompt.trim()) return;
    
    setIsGeneratingImage(true);
    try {
      // Simulate AI image generation
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Mock generated image URL (using Unsplash for demo)
      const mockGeneratedImage = `https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=300&fit=crop&auto=format&q=80`;
      
      setCurrentPost(prev => prev ? {...prev, image: mockGeneratedImage} : null);
      setUploadedImage(mockGeneratedImage);
      setShowImageOptions(false);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUploadedImage(imageUrl);
        setCurrentPost(prev => prev ? {...prev, image: imageUrl} : null);
        setShowImageOptions(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const publishPost = () => {
    if (!currentPost || !currentPost.title || !currentPost.content) return;
    
    const newPost: BlogPost = {
      id: Date.now().toString(),
      title: currentPost.title,
      content: currentPost.content,
      excerpt: currentPost.excerpt || '',
      category: currentPost.category || 'General',
      readTime: currentPost.readTime || '5 min read',
      image: currentPost.image || '',
      date: new Date().toISOString()
    };
    
    setBlogPosts(prev => [newPost, ...prev]);
    setCurrentPost(null);
    setTopic('');
    setUploadedImage(null);
    setImagePrompt('');
    setShowImageOptions(false);
  };

  const deletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this blog post?')) {
      setBlogPosts(prev => prev.filter(post => post.id !== postId));
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-gray-500">Create and manage blog content with AI assistance.</p>
        </div>
      </div>

      {/* AI Blog Generator */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">AI Blog Generator</h2>
            <p className="text-sm text-gray-500">Generate automotive blog content automatically</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Topic</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., Engine Oil Changes, Brake Maintenance, Winter Driving Tips"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <button
            onClick={generateBlogPost}
            disabled={!topic.trim() || isGeneratingText}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingText ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Blog Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Post Preview */}
      {currentPost && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Generated Blog Post</h2>
            <button
              onClick={() => {
                setCurrentPost(null);
                setUploadedImage(null);
                setShowImageOptions(false);
              }}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={currentPost.title || ''}
                onChange={(e) => setCurrentPost(prev => prev ? {...prev, title: e.target.value} : null)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={currentPost.excerpt || ''}
                onChange={(e) => setCurrentPost(prev => prev ? {...prev, excerpt: e.target.value} : null)}
              />
            </div>

            {/* Image Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
              
              {uploadedImage ? (
                <div className="relative">
                  <img 
                    src={uploadedImage} 
                    alt="Featured" 
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setCurrentPost(prev => prev ? {...prev, image: ''} : null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">Add a featured image for your blog post</p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
                    >
                      <Upload size={16} />
                      Upload Image
                    </button>
                    
                    <button
                      onClick={() => setShowImageOptions(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
                    >
                      <Sparkles size={16} />
                      Generate with AI
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-64"
                value={currentPost.content || ''}
                onChange={(e) => setCurrentPost(prev => prev ? {...prev, content: e.target.value} : null)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setCurrentPost(null);
                  setUploadedImage(null);
                }}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200"
              >
                Discard
              </button>
              <button
                onClick={publishPost}
                disabled={!currentPost.title || !currentPost.content}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send size={16} />
                Publish Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Image Generation Modal */}
      {showImageOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Generate Image with AI</h3>
              <button
                onClick={() => setShowImageOptions(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe the image you want
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="e.g., Car engine maintenance, mechanic working on car, automotive tools, modern garage interior"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImageOptions(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={generateAIImage}
                  disabled={!imagePrompt.trim() || isGeneratingImage}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Camera size={16} />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Published Posts */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Published Posts</h2>
          <span className="text-sm text-gray-500">{blogPosts.length} posts</span>
        </div>

        <div className="space-y-4">
          {blogPosts.map(post => (
            <div key={post.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex gap-4">
                {post.image && (
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{post.category}</span>
                        <span>{post.readTime}</span>
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {blogPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No blog posts yet</h3>
              <p className="text-gray-500">Generate your first blog post using AI above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManagementPageFixed;