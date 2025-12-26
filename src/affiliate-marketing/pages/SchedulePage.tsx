import React, { useState } from 'react';
import { Calendar, Clock, Facebook, Instagram, MessageCircle, Edit3, Trash2, Plus, Eye, Send, Link2, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockPosts } from '../services/mockData';
import { Post, Platform } from '../types';

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');

  const PlatformIcon = ({ platform }: { platform: Platform }) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-4 h-4 text-blue-600" />;
      case 'instagram': return <Instagram className="w-4 h-4 text-pink-600" />;
      case 'line': return <MessageCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const StatusBadge = ({ status }: { status: Post['status'] }) => {
    const styles = { draft: 'bg-gray-100 text-gray-700', scheduled: 'bg-yellow-100 text-yellow-700', published: 'bg-green-100 text-green-700' };
    const labels = { draft: '草稿', scheduled: '已排程', published: '已發佈' };
    return <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status]}`}>{labels[status]}</span>;
  };

  const filteredPosts = posts.filter((post) => filterStatus === 'all' || post.status === filterStatus);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    setSelectedDate(newDate);
  };

  const getCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);
    return days;
  };

  const getPostsForDay = (day: number) => posts.filter((post) => {
    if (!post.scheduledTime) return false;
    const postDate = new Date(post.scheduledTime);
    return postDate.getDate() === day && postDate.getMonth() === selectedDate.getMonth() && postDate.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">自動發文排程</h1>
          <p className="text-gray-600">管理你的貼文草稿與排程發佈</p>
        </div>
        <button onClick={() => { setEditingPost(null); setShowPostModal(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-5 h-5" />新增貼文
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth('prev')} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft className="w-5 h-5" /></button>
            <h3 className="font-semibold text-gray-900">{selectedDate.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })}</h3>
            <button onClick={() => navigateMonth('next')} className="p-1 hover:bg-gray-100 rounded"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => <div key={day} className="text-xs text-gray-500 py-2">{day}</div>)}
            {getCalendarDays().map((day, index) => {
              const dayPosts = day ? getPostsForDay(day) : [];
              const isToday = day === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();
              return (
                <div key={index} className={`aspect-square flex flex-col items-center justify-center text-sm rounded-lg ${day ? isToday ? 'bg-indigo-100 text-indigo-600 font-semibold' : 'hover:bg-gray-100 cursor-pointer' : ''}`}>
                  {day && <><span>{day}</span>{dayPosts.length > 0 && <div className="flex gap-0.5 mt-1">{dayPosts.slice(0, 3).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />)}</div>}</>}
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">已綁定帳號</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><Facebook className="w-5 h-5 text-blue-600" /><span className="text-sm">我的粉絲專頁</span></div><span className="text-xs text-green-600">已連接</span></div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"><div className="flex items-center gap-2"><Instagram className="w-5 h-5 text-pink-600" /><span className="text-sm">@myshop_tw</span></div><span className="text-xs text-green-600">已連接</span></div>
              <button className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-300 hover:text-indigo-600 transition"><Plus className="w-4 h-4" />綁定更多帳號</button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2">
            {[{ id: 'all', label: '全部' }, { id: 'draft', label: '草稿' }, { id: 'scheduled', label: '已排程' }, { id: 'published', label: '已發佈' }].map((filter) => (
              <button key={filter.id} onClick={() => setFilterStatus(filter.id as typeof filterStatus)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterStatus === filter.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{filter.label}</button>
            ))}
          </div>
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PlatformIcon platform={post.platform} />
                      <StatusBadge status={post.status} />
                      {post.scheduledTime && <span className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(post.scheduledTime).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{post.contentText}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      {post.imageUrls.length > 0 && <span className="flex items-center gap-1"><Image className="w-4 h-4" />{post.imageUrls.length} 張圖片</span>}
                      {post.affiliateLinkIds.length > 0 && <span className="flex items-center gap-1"><Link2 className="w-4 h-4" />{post.affiliateLinkIds.length} 個連結</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => { setEditingPost(post); setShowPostModal(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                {post.status === 'draft' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"><Calendar className="w-4 h-4" />設定排程</button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"><Send className="w-4 h-4" />立即發佈</button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {filteredPosts.length === 0 && <div className="text-center py-12 bg-white rounded-xl border border-gray-200"><Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" /><p className="text-gray-500">沒有符合條件的貼文</p></div>}
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && <PostModal post={editingPost} onClose={() => { setShowPostModal(false); setEditingPost(null); }} onSave={(post) => { if (editingPost) { setPosts(posts.map((p) => (p.id === post.id ? post : p))); } else { setPosts([post, ...posts]); } setShowPostModal(false); setEditingPost(null); }} />}
    </div>
  );
}

function PostModal({ post, onClose, onSave }: { post: Post | null; onClose: () => void; onSave: (post: Post) => void }) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.contentText || '');
  const [platform, setPlatform] = useState<Platform>(post?.platform || 'facebook');
  const [scheduledTime, setScheduledTime] = useState(post?.scheduledTime ? new Date(post.scheduledTime).toISOString().slice(0, 16) : '');

  const handleSave = () => {
    const newPost: Post = {
      id: post?.id || Date.now().toString(),
      title, platform, contentText: content,
      imageUrls: post?.imageUrls || [],
      productIds: post?.productIds || [],
      affiliateLinkIds: post?.affiliateLinkIds || [],
      status: scheduledTime ? 'scheduled' : 'draft',
      scheduledTime: scheduledTime || undefined,
      createdAt: post?.createdAt || new Date().toISOString(),
    };
    onSave(newPost);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200"><h2 className="text-xl font-bold text-gray-900">{post ? '編輯貼文' : '新增貼文'}</h2></div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">標題</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" placeholder="貼文標題" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">發布平台</label>
            <div className="flex gap-2">
              {[{ id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' }, { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' }, { id: 'line', label: 'LINE', icon: MessageCircle, color: 'text-green-600' }].map((p) => (
                <button key={p.id} onClick={() => setPlatform(p.id as Platform)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${platform === p.id ? 'bg-gray-100 border-2 border-indigo-300' : 'border-2 border-gray-200 hover:bg-gray-50'}`}>
                  <p.icon className={`w-5 h-5 ${p.color}`} />{p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">內容</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" placeholder="輸入貼文內容..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">排程時間（選填）</label>
            <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">取消</button>
          <button onClick={handleSave} disabled={!title || !content} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed">{scheduledTime ? '設定排程' : '儲存草稿'}</button>
        </div>
      </div>
    </div>
  );
}
