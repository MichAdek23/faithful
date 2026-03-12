import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog } from '@/components/ui/dialog';
import { ArrowLeft, Save, Eye, Image, Bold, Italic, Heading1, Heading2, List, Link as LinkIcon, Code } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PostFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  status: string;
}

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const AdminBlogEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState<PostFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author: 'Faithful Auto Care',
    status: 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
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
    if (isEditing) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || '',
        content: data.content,
        cover_image: data.cover_image || '',
        author: data.author,
        status: data.status,
      });
    }
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : generateSlug(title),
    }));
  };

  const insertTag = (openTag: string, closeTag: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.substring(start, end);
    const replacement = `${openTag}${selected}${closeTag}`;
    const newContent = form.content.substring(0, start) + replacement + form.content.substring(end);

    setForm((prev) => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + openTag.length;
      textarea.selectionEnd = start + openTag.length + selected.length;
    }, 0);
  };

  const handleSave = async (publishNow = false) => {
    if (!form.title.trim()) {
      setAlertDialog({
        isOpen: true,
        title: 'Missing Title',
        message: 'Please enter a title for the blog post.',
        type: 'error',
        showCancel: false,
      });
      return;
    }

    if (!form.content.trim()) {
      setAlertDialog({
        isOpen: true,
        title: 'Missing Content',
        message: 'Please enter some content for the blog post.',
        type: 'error',
        showCancel: false,
      });
      return;
    }

    setSaving(true);

    const status = publishNow ? 'published' : form.status;
    const postData: Record<string, unknown> = {
      title: form.title.trim(),
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt.trim(),
      content: form.content,
      cover_image: form.cover_image.trim(),
      author: form.author.trim() || 'Faithful Auto Care',
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'published') {
      postData.published_at = new Date().toISOString();
    }

    let error;
    if (isEditing) {
      ({ error } = await supabase.from('blog_posts').update(postData).eq('id', id));
    } else {
      ({ error } = await supabase.from('blog_posts').insert(postData));
    }

    setSaving(false);

    if (error) {
      setAlertDialog({
        isOpen: true,
        title: 'Error',
        message: error.code === '23505'
          ? 'A post with this slug already exists. Please change the title or slug.'
          : `Failed to save: ${error.message}`,
        type: 'error',
        showCancel: false,
      });
      return;
    }

    navigate('/admin/blog');
  };

  return (
    <AdminLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/blog')}
              className="gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Post' : 'New Post'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPreview(!preview)}
              className="gap-1"
            >
              <Eye className="w-4 h-4" /> {preview ? 'Editor' : 'Preview'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="gap-1"
            >
              <Save className="w-4 h-4" /> Save Draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-[#003366] hover:bg-[#002855] gap-1"
            >
              <Eye className="w-4 h-4" /> Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-slug"
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Short summary of the post..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
              </div>

              <div className="flex items-center gap-1 mb-2 flex-wrap border-b border-gray-200 pb-2">
                <button
                  type="button"
                  onClick={() => insertTag('<strong>', '</strong>')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<em>', '</em>')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<h2>', '</h2>\n')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Heading 2"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<h3>', '</h3>\n')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Heading 3"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<ul>\n<li>', '</li>\n</ul>\n')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<a href="">', '</a>')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<code>', '</code>')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<img src="', '" alt="" class="rounded-lg" />')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                  title="Image"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTag('<p>', '</p>\n')}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-600 text-xs font-medium"
                  title="Paragraph"
                >
                  P
                </button>
              </div>

              {preview ? (
                <div
                  className="prose prose-lg max-w-none min-h-[400px] border border-gray-200 rounded-lg p-4 overflow-auto prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-[#1E90FF]"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              ) : (
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content in HTML..."
                  rows={20}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y min-h-[400px]"
                />
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 md:p-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Post Settings</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="Author name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
                <Input
                  value={form.cover_image}
                  onChange={(e) => setForm((prev) => ({ ...prev, cover_image: e.target.value }))}
                  placeholder="https://images.pexels.com/..."
                />
                {form.cover_image && (
                  <img
                    src={form.cover_image}
                    alt="Cover preview"
                    className="mt-2 w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
              </div>
            </Card>
          </div>
        </div>

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
