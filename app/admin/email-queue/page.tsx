"use client";

import { useState, useEffect } from 'react';

interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
}

interface EmailLog {
  id: string;
  email: string;
  subject: string;
  type: string;
  status: string;
  error?: string;
  attempts: number;
  createdAt: string;
}

export default function EmailQueuePage() {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/emails/queue-status');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch queue status', err);
    }
  };

  const fetchLogs = async () => {
    // We'll need an API for logs too, or we can fetch them here if we have one.
    // Let's create a simple API for email logs.
    try {
      const res = await fetch('/api/admin/email-logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch email logs', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStatus(), fetchLogs()]);
      setLoading(false);
    };
    loadData();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Email Queue & Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <StatusCard label="Waiting" count={status?.waiting || 0} color="bg-blue-100 text-blue-800" />
        <StatusCard label="Active" count={status?.active || 0} color="bg-yellow-100 text-yellow-800" />
        <StatusCard label="Completed" count={status?.completed || 0} color="bg-green-100 text-green-800" />
        <StatusCard label="Failed" count={status?.failed || 0} color="bg-red-100 text-red-800" />
        <StatusCard label="Delayed" count={status?.delayed || 0} color="bg-gray-100 text-gray-800" />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Email Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${log.status === 'sent' ? 'bg-green-100 text-green-800' : 
                        log.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {log.status}
                    </span>
                    {log.error && <p className="text-xs text-red-500 mt-1">{log.error}</p>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`p-4 rounded-lg shadow ${color}`}>
      <p className="text-sm font-medium uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold mt-1">{count}</p>
    </div>
  );
}
