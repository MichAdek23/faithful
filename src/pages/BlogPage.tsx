import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { supabase } from '../lib/supabase';
import { FooterSection } from '../sections/FooterSection';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
}

export function BlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useSEO({
    title: 'Blog - Faithful Auto Care',
    description: 'Read the latest tips, guides, and news about car care, detailing, and maintenance from Faithful Auto Care.',
    canonical: '/blog',
    keywords: 'car care blog, car detailing tips, car wash guide, auto care news, Faithful Auto Care blog',
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, author, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  const filtered = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-48 sm:h-64 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)' }}>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide">
              OUR <span className="text-[#1E90FF]">BLOG</span>
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-200 max-w-md mx-auto px-4">
              Tips, guides, and news about car care and detailing
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="shrink-0"
          >
            Back to Home
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchTerm ? 'No articles found' : 'No blog posts yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Try a different search term' : 'Check back soon for new content'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <article
                key={post.id}
                onClick={() => navigate(`/blog/${post.slug}`)}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#003366] to-[#1E90FF] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold opacity-30">FAC</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(post.published_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E90FF] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#1E90FF] group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <FooterSection />
    </div>
  );
}
