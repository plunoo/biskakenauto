import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
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
  Check
} from 'lucide-react';
import { apiService } from '../services/apiService';

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

const BlogManagementPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost> | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      console.log('🔄 Loading blog posts...');
      const response = await apiService.getBlogPosts();
      if (response.success) {
        setBlogPosts(response.data);
        console.log('✅ Blog posts loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Failed to load blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateText = async () => {
    if (!topic) return;
    setIsGeneratingText(true);
    try {
      // Simple content generation - you can integrate with Gemini API here
      const result = {
        title: `How to: ${topic}`,
        content: `This is auto-generated content about ${topic}. In the context of Ghanaian auto repair shops, this topic is particularly relevant because...`,
        excerpt: `Learn everything about ${topic} in this comprehensive guide.`,
        category: 'Automotive Tips',
        readTime: '5 min read',
        imagePrompt: `Professional auto workshop showing ${topic} in action`
      };
      
      setCurrentPost({
        ...result,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      });
    } catch (error) {
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!currentPost?.imagePrompt) return;
    setIsGeneratingImage(true);
    try {
      // Use a placeholder image for now - you can integrate with Gemini Image generation here
      const imageUrl = `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800&h=400&sig=${Date.now()}`;
      setCurrentPost(prev => prev ? { ...prev, image: imageUrl } : null);
    } catch (error) {
      alert("Failed to generate image.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPost(prev => prev ? { ...prev, image: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!currentPost?.title || !currentPost?.content || !currentPost?.image) {
      alert("Please ensure title, content, and image are ready.");
      return;
    }
    
    try {
      const newPost: BlogPost = {
        id: Math.random().toString(36).substr(2, 9),
        title: currentPost.title!,
        content: currentPost.content!,
        excerpt: currentPost.excerpt || currentPost.content!.substring(0, 150) + '...',
        image: currentPost.image!,
        category: currentPost.category || 'General',
        date: new Date().toISOString(),
        readTime: currentPost.readTime || '3 min read',
        slug: currentPost.title!.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
      };

      const response = await apiService.createBlogPost(newPost);
      if (response.success) {
        setBlogPosts(prev => [newPost, ...prev]);
        setCurrentPost(null);
        setTopic('');
        alert("Post published successfully!");
      } else {
        alert("Failed to publish post. Please try again.");
      }
    } catch (error) {
      console.error('Error publishing post:', error);
      alert("Failed to publish post. Please try again.");
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await apiService.deleteBlogPost(id);
      if (response.success) {
        setBlogPosts(prev => prev.filter(post => post.id !== id));
      } else {
        alert("Failed to delete post.");
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert("Failed to delete post.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Blog Manager</h1>
        <p className="text-gray-500">Generate professional content for your shop's landing page.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Editor Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Generator Settings">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Post Topic / Caption</label>
                <textarea 
                  className="w-full p-3 border rounded-lg h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Benefits of regular oil changes during the rainy season in Accra..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  onClick={handleGenerateText} 
                  loading={isGeneratingText}
                  icon={Sparkles}
                >
                  Generate Content
                </Button>
              </div>

              {currentPost && (
                <div className="pt-4 border-t space-y-4 animate-in fade-in duration-300">
                  <p className="text-sm font-semibold">Visual Representation</p>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      className="flex-1 border border-gray-200" 
                      icon={Upload}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload}
                    />
                    <Button 
                      variant="secondary" 
                      className="flex-1" 
                      icon={RefreshCcw}
                      loading={isGeneratingImage}
                      onClick={handleGenerateImage}
                    >
                      AI Generate
                    </Button>
                  </div>
                  {currentPost.imagePrompt && (
                    <p className="text-[10px] text-gray-400 italic">Prompt: {currentPost.imagePrompt}</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {currentPost && (
            <Button size="lg" className="w-full h-14 text-lg" icon={Send} onClick={handlePublish}>
              Publish Post
            </Button>
          )}
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          {currentPost ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="aspect-[21/9] bg-gray-100 relative group">
                {currentPost.image ? (
                  <img src={currentPost.image} className="w-full h-full object-cover" alt="Post preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon size={48} />
                    <span>No image selected</span>
                  </div>
                )}
                {isGeneratingImage && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white">
                    <div className="text-center">
                      <Loader2 className="animate-spin mx-auto mb-2" size={32} />
                      <p className="text-sm font-bold">Dreaming up your image...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <Badge variant="success">{currentPost.category || 'Category'}</Badge>
                  <span className="text-sm text-gray-400">{currentPost.readTime || '3 min read'}</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                  {currentPost.title || 'Post Title will appear here'}
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {currentPost.content || 'Start generating to see your story take shape...'}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-4">
              <BookOpen size={64} strokeWidth={1} />
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">Ready to create?</h3>
                <p className="text-sm">Enter a topic on the left to generate your first blog post.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Published Posts */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Posts</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-2" size={32} />
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No blog posts published yet. Create your first post above!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2} 
                      onClick={() => handleDeletePost(post.id)}
                      className="text-red-500 hover:text-red-700"
                    >
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