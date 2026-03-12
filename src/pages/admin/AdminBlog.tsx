import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog } from '@/components/ui/dialog';
import { Search, Plus, CreditCard as Edit2, Trash2, Eye, EyeOff, FileText, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author: string;
  status: string;
  published_at: string | null;
  created_at: string;
}

export const AdminBlog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'warning' | 'success';
    showCancel: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, cover_image, author, status, published_at, created_at')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
      setStats({
        total: data.length,
        published: data.filter((p) => p.status === 'published').length,
        drafts: data.filter((p) => p.status === 'draft').length,
      });
    }
  };

  const handleDelete = (id: string, title: string) => {
    setAlertDialog({
      isOpen: true,
      title: 'Delete Post',
      message: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      type: 'warning',
      showCancel: true,
      onConfirm: async () => {
        await supabase.from('blog_posts').delete().eq('id', id);
        fetchPosts();
      },
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const updateData: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'published') {
      updateData.published_at = new Date().toISOString();
    }
    await supabase.from('blog_posts').update(updateData).eq('id', id);
    fetchPosts();
  };

  const filtered = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || post.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Blog</h1>
            <p className="mt-1 text-sm md:text-base text-gray-600">Create, edit & manage blog posts</p>
          </div>
          <Button
            onClick={() => navigate('/admin/blog/new')}
            className="bg-[#003366] hover:bg-[#002855] gap-2"
          >
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-gray-300 px-3 md:px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Published</option>
            <option>Draft</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Total Posts</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Published</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-green-600">{stats.published}</p>
          </Card>
          <Card className="p-4 md:p-6 text-center">
            <p className="text-sm font-medium text-gray-600">Drafts</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-yellow-600">{stats.drafts}</p>
          </Card>
        </div>

        {filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">No posts found</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm ? 'Try a different search term' : 'Create your first blog post'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/admin/blog/new')} className="bg-[#003366] hover:bg-[#002855] gap-2">
                <Plus className="w-4 h-4" /> Create Post
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <Card key={post.id} className="p-4 md:p-5">
                <div className="flex items-start gap-4">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover shrink-0 hidden sm:block"
                    />
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 hidden sm:block">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{post.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{post.excerpt || 'No excerpt'}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{post.author}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => navigate(`/admin/blog/edit/${post.id}`)}
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs"
                        onClick={() => handleToggleStatus(post.id, post.status)}
                      >
                        {post.status === 'published' ? (
                          <><EyeOff className="w-3.5 h-3.5" /> Unpublish</>
                        ) : (
                          <><Eye className="w-3.5 h-3.5" /> Publish</>
                        )}
                      </Button>
                      {post.status === 'published' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-xs text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(post.id, post.title)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <AlertDialog
          isOpen={alertDialog.isOpen}
          onClose={() => setAlertDialog({ ...alertDialog, isOpen: false })}
          onConfirm={alertDialog.onConfirm}
          title={alertDialog.title}
          message={alertDialog.message}
          type={alertDialog.type}
          showCancel={alertDialog.showCancel}
        />
      </div>
    </AdminLayout>
  );
};
