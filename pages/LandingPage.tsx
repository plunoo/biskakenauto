import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  Smartphone, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Package,
  FileText,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/UI';
import { useStore } from '../store/useStore';
import { apiService } from '../services/apiService';

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="p-6 md:p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed text-sm md:text-base">{description}</p>
  </div>
);

const BlogCard = ({ image, category, title, date, readTime, slug, id, excerpt }: any) => (
  <Link to={`/blog/${slug || id}`} className="block">
    <div className="group cursor-pointer bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="aspect-video overflow-hidden">
        <img 
          src={image || `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800`} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">{category || 'Automotive'}</span>
          <div className="flex items-center text-gray-400 text-xs gap-1">
            <Clock size={12} />
            {readTime || '3 min read'}
          </div>
        </div>
        <h4 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-snug">{title}</h4>
        {excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{excerpt}</p>
        )}
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Calendar size={12} />
          {new Date(date).toLocaleDateString()}
        </div>
      </div>
    </div>
  </Link>
);

const LandingPage: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLandingBlogData();
  }, []);

  const loadLandingBlogData = async () => {
    try {
      console.log('🌐 Loading landing page blog data...');
      
      // Try to load from admin blog management (published posts only)
      const blogRes = await apiService.getBlogPosts();
      
      if (blogRes.success && blogRes.data) {
        // Filter to only show published posts on landing page
        const publishedPosts = blogRes.data
          .filter((post: any) => post.status === 'PUBLISHED')
          .slice(0, 3) // Show only latest 3 posts
          .map((post: any) => ({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.tags?.[0] || 'Automotive',
            date: post.createdAt,
            readTime: `${Math.ceil((post.content?.length || 500) / 200)} min read`,
            slug: post.title?.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
            image: post.imageUrl || null
          }));
          
        setBlogPosts(publishedPosts);
        console.log('✅ Landing blog data loaded:', publishedPosts.length, 'published posts');
      } else {
        // Fallback demo data if API fails
        setBlogPosts([
          {
            id: 'demo-1',
            title: 'Essential Car Maintenance Tips for Ghana\'s Climate',
            excerpt: 'Learn how to keep your vehicle running smoothly in tropical weather conditions.',
            category: 'Maintenance',
            date: new Date().toISOString(),
            readTime: '4 min read',
            slug: 'essential-car-maintenance-tips-ghana',
            image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800'
          },
          {
            id: 'demo-2',
            title: 'Choosing Quality Auto Parts in Accra',
            excerpt: 'A guide to finding reliable automotive parts and avoiding counterfeits.',
            category: 'Parts',
            date: new Date(Date.now() - 86400000).toISOString(),
            readTime: '3 min read',
            slug: 'choosing-quality-auto-parts-accra',
            image: 'https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=800'
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Failed to load landing blog data:', error);
      // Use fallback demo data
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl">B</div>
              <span className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">BISKAKEN</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
              <a href="#blog" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Blog</a>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-48 md:pb-32 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 md:space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs md:text-sm font-semibold mx-auto lg:mx-0">
                <Sparkles size={14} className="md:size-4" />
                AI-Powered Shop Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
                Modernizing <span className="text-blue-600 text-nowrap">Auto Shops</span> in Ghana.
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Smart diagnosis, inventory control, and professional invoicing tailored for our local mechanics and workshop owners.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto px-10 h-14" icon={ArrowRight}>
                    Get Started Free
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button variant="ghost" size="lg" className="w-full px-10 h-14 border border-gray-200">
                    See Features
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?auto=format&fit=crop&q=80&w=1200" 
                  alt="Modern Auto Workshop" 
                  className="rounded-xl object-cover h-[400px] w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats (Mobile Scroll) */}
      <section className="py-12 md:py-16 bg-gray-900 text-white overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex lg:grid lg:grid-cols-4 gap-8 min-w-max lg:min-w-0 justify-between text-center">
            <div className="px-8 lg:px-0">
              <p className="text-3xl md:text-4xl font-extrabold mb-1">40%</p>
              <p className="text-gray-400 text-sm">Productivity Boost</p>
            </div>
            <div className="px-8 lg:px-0 border-l border-gray-800 lg:border-l-0">
              <p className="text-3xl md:text-4xl font-extrabold mb-1">10k+</p>
              <p className="text-gray-400 text-sm">Jobs Managed</p>
            </div>
            <div className="px-8 lg:px-0 border-l border-gray-800 lg:border-l-0">
              <p className="text-3xl md:text-4xl font-extrabold mb-1">₵0</p>
              <p className="text-gray-400 text-sm">Hidden Costs</p>
            </div>
            <div className="px-8 lg:px-0 border-l border-gray-800 lg:border-l-0">
              <p className="text-3xl md:text-4xl font-extrabold mb-1">24/7</p>
              <p className="text-gray-400 text-sm">Ghanaian Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
            <h2 className="text-blue-600 font-bold uppercase tracking-wider text-xs md:text-sm mb-4">Core Capabilities</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 md:mb-6 leading-tight">Everything you need to run a professional workshop.</h3>
            <p className="text-gray-600 text-base md:text-lg">Tailored for the unique needs of auto repair businesses in Accra, Kumasi, and beyond.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Sparkles}
              title="AI Diagnosis"
              description="Instantly identify car issues using plain text or voice. Get suggested parts and cost estimates in GHS."
            />
            <FeatureCard 
              icon={Package}
              title="Stock Management"
              description="Monitor parts in real-time. Receive alerts for low stock items like filters, oil, and brake pads."
            />
            <FeatureCard 
              icon={FileText}
              title="Smart Invoicing"
              description="Create professional invoices with local tax settings. Share via WhatsApp for faster payments."
            />
            <FeatureCard 
              icon={Smartphone}
              title="MoMo Integrated"
              description="Easily track payments made via MTN Mobile Money and Telecel Cash alongside cash transactions."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Business Reports"
              description="View your daily revenue and job history clearly. Make data-driven decisions for your shop's growth."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Access"
              description="Dedicated views for shop owners and mechanics. Protect your sensitive financial data."
            />
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-blue-600 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
                <BookOpen size={16} /> Latest Insights
              </h2>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">Grow Your Knowledge.</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <BlogCard 
                key={post.id}
                image={post.image}
                category={post.category}
                title={post.title}
                excerpt={post.excerpt}
                date={post.date}
                readTime={post.readTime}
                slug={post.slug}
                id={post.id}
              />
            ))}
          </div>
          
          {blogPosts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="bg-white rounded-xl p-8 border border-gray-200">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No Published Posts Yet</h4>
                <p className="text-gray-600 mb-4">Our team is working on bringing you valuable automotive insights.</p>
                <div className="text-center">
                  <p className="text-gray-500 text-sm">Coming soon...</p>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                      <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl md:rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
              <Wrench size={180} />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 md:mb-6">Ready to scale your workshop?</h2>
            <p className="text-lg md:text-xl text-blue-100 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              Join professional auto shops across Ghana using Biskaken to drive efficiency and happy customers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-blue-600 hover:bg-gray-100 h-14 font-bold text-lg">
                  Start Now
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full text-white hover:bg-blue-700 border border-blue-400 h-14">
                  Request Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
              <span className="text-lg font-bold">BISKAKEN</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm text-gray-500 font-medium">
              <a href="#blog" className="hover:text-blue-600 transition-colors">Blog</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
              <Link to="/admin-login" className="hover:text-blue-600 transition-colors text-xs">•</Link>
            </div>
            <p className="text-sm text-gray-400 text-center">
              © 2024 Biskaken Ghana. Built for local shops. 🇬🇭
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;