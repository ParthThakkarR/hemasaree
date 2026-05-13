'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Trash2, Loader2, Search } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return;

    setSending(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setSubject('');
        setContent('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error sending newsletter' });
    } finally {
      setSending(false);
    }
  };

  const deleteSubscriber = async (email: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSubscribers(subscribers.filter(s => s.email !== email));
      }
    } catch (error) {
      console.error('Failed to delete subscriber');
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#1A0A12]">Newsletter Management</h1>
          <p className="text-gray-500">Communicate with your {subscribers.length} subscribers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Send Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Send className="text-[#6B0F1A]" size={20} />
              Compose Newsletter
            </h2>

            <form onSubmit={handleSendNewsletter} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New Festive Collection is Here!"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message here..."
                  required
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B0F1A] focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-sm ${
                  message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={sending || subscribers.length === 0}
                className="w-full bg-[#1A0A12] text-white py-3 rounded-xl font-bold hover:bg-[#2D121E] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    Send to All Subscribers
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Subscriber List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-[#6B0F1A]" size={20} />
              Subscribers
            </h2>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B0F1A] outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[500px] space-y-2 pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-gray-300" />
                </div>
              ) : filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((sub) => (
                  <div key={sub.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors group">
                    <div className="truncate pr-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{sub.email}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSubscriber(sub.email)}
                      className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-gray-400 text-sm">No subscribers found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

