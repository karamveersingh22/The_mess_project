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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registered Students Directory</h1>
        <p className="text-sm text-gray-600">
          View all students registered for online mess booking and coupon management.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-gray-200 max-w-md">
        <Input
          placeholder="Search by student name, roll number, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading student directory...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                  <tr>
                    <th className="px-6 py-3">Roll Number</th>
                    <th className="px-6 py-3">Student Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Registered On</th>
                    <th className="px-6 py-3">Total Bookings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono font-bold text-blue-900">
                        {s.rollNumber}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {s.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{s.email}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(s.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-full text-xs">
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

