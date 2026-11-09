"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

interface StudentRecord {
  _id: string;
  name: string;
  rollNumber: string;
  email: string;
  createdAt: string;
  totalBookings: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("/api/admin/students");
        const data = await res.json();
        if (data.success) {
          setStudents(data.data);
        } else {
          setError(data.error || "Failed to load students");
        }
      } catch {
        setError("Network error fetching students");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      s.rollNumber.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Registered Students Directory
          </h1>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          View all students enrolled for digital mess meals, coupon issuance, and counter check-ins.
        </p>
      </div>

      {error && (
        <div
          className="p-4 rounded-xl text-xs font-bold"
          style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)' }}
        >
          ✕ {error}
        </div>
      )}

      <div
        className="p-4 rounded-2xl max-w-md"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
      >
        <Input
          placeholder="Search by student name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students Directory ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Loading student directory...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-16 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No students found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" style={{ color: 'var(--text-secondary)' }}>
                <thead
                  className="text-xs uppercase font-bold"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-muted)' }}
                >
                  <tr>
                    <th className="px-6 py-3.5">Roll Number</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Email Address</th>
                    <th className="px-6 py-3.5">Registered On</th>
                    <th className="px-6 py-3.5 text-right">Total Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-muted)' }}>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s._id}
                      className="transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-mono font-bold" style={{ color: 'var(--brand-blue)' }}>
                        {s.rollNumber}
                      </td>
                      <td className="px-6 py-4 font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {s.email}
                      </td>
                      <td className="px-6 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className="font-bold px-2.5 py-1 rounded-full text-xs"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-muted)' }}
                        >
                          {s.totalBookings}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
