'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { DonutChart } from '@/components/ui/Charts';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface VerificationDoc {
  file_name: string;
  file_url: string;
  file_type: string;
}

interface PendingVerificationItem {
  id: string;
  name: string;
  pan_no: string | null;
  reg_no: string | null;
  gst_no: string | null;
  aadhaar_no: string | null;
  website: string | null;
  address: string | null;
  verification_status: string;
  type: 'builder' | 'contractor';
  created_at: string;
  documents: VerificationDoc[];
}

interface PlatformUserItem {
  id: string;
  email: string;
  role: 'builder' | 'contractor' | 'admin';
  is_suspended: boolean;
  name: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface PlatformReviewItem {
  id: string;
  project_id: string;
  rating: number;
  feedback: string;
  created_at: string;
  reviewer_name: string;
  reviewee_name: string;
}

interface PlatformStats {
  totals: {
    builders: number;
    contractors: number;
    projects: number;
    packages: number;
    quotations: number;
  };
  verifications: {
    builders: { [key: string]: number };
    contractors: { [key: string]: number };
  };
  quotations: { [key: string]: number };
  packages: { [key: string]: number };
}

const AdminDashboard = () => {
  // Tabs State
  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'reviews'>('overview');

  // Diagnostics & Verifications Data States
  const [pendingReviews, setPendingReviews] = useState<PendingVerificationItem[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [usersList, setUsersList] = useState<PlatformUserItem[]>([]);
  const [reviewsList, setReviewsList] = useState<PlatformReviewItem[]>([]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Review Verification Modal State
  const [selectedItem, setSelectedItem] = useState<PendingVerificationItem | null>(null);
  const [remarks, setRemarks] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [verifRes, statsRes] = await Promise.all([
        axiosInstance.get('/admin/verifications') as any,
        axiosInstance.get('/admin/analytics') as any
      ]);
      if (verifRes.success) setPendingReviews(verifRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch platform overview data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await axiosInstance.get('/admin/users')) as any;
      if (res.success) setUsersList(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = (await axiosInstance.get('/admin/reviews')) as any;
      if (res.success) setReviewsList(res.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch reviews list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'verifications') {
      fetchOverviewData();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab]);

  // Verification Review Action
  const handleReviewAction = async (action: 'approve' | 'reject') => {
    if (!selectedItem) return;

    if (action === 'reject' && !remarks.trim()) {
      alert('Please specify the reason/remarks for profile rejection.');
      return;
    }

    const confirmMsg = action === 'approve' 
      ? `Are you sure you want to APPROVE this ${selectedItem.type}'s verification status?`
      : `Are you sure you want to REJECT this ${selectedItem.type}'s verification?`;
      
    if (!window.confirm(confirmMsg)) return;

    setReviewing(true);
    try {
      const res = (await axiosInstance.post(`/admin/verifications/${selectedItem.id}/review`, {
        entityType: selectedItem.type,
        action,
        remarks: action === 'reject' ? remarks : undefined
      })) as any;

      if (res.success) {
        alert(res.message || 'Verification updated successfully!');
        setSelectedItem(null);
        setRemarks('');
        fetchOverviewData();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update verification status.');
    } finally {
      setReviewing(false);
    }
  };

  // Toggle User Suspension status
  const handleToggleSuspension = async (user: PlatformUserItem) => {
    const actionLabel = user.is_suspended ? 'ACTIVATE' : 'SUSPEND';
    const confirmMsg = `Are you sure you want to ${actionLabel} user account: ${user.email}?`;
    if (!window.confirm(confirmMsg)) return;

    setSubmittingAction(true);
    try {
      const res = (await axiosInstance.post(`/admin/users/${user.id}/suspend`, {
        suspend: !user.is_suspended
      })) as any;

      if (res.success) {
        alert(res.message || 'User status updated successfully.');
        fetchUsers(); // Reload
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to toggle user suspension.');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    const confirmMsg = 'Are you sure you want to DELETE this contractor review? This action is permanent.';
    if (!window.confirm(confirmMsg)) return;

    setSubmittingAction(true);
    try {
      const res = (await axiosInstance.delete(`/admin/reviews/${reviewId}`)) as any;
      if (res.success) {
        alert(res.message || 'Review deleted successfully.');
        fetchReviews(); // Reload
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete review.');
    } finally {
      setSubmittingAction(false);
    }
  };

  if (loading && !stats && usersList.length === 0 && reviewsList.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  // Verification donut chart mapping
  const builderVerifChartData = [
    { label: 'Verified', value: stats?.verifications.builders.approved || 0, color: 'stroke-emerald-500' },
    { label: 'Pending', value: stats?.verifications.builders.pending || 0, color: 'stroke-amber-500' },
    { label: 'Rejected', value: stats?.verifications.builders.rejected || 0, color: 'stroke-rose-500' }
  ];

  const contractorVerifChartData = [
    { label: 'Verified', value: stats?.verifications.contractors.approved || 0, color: 'stroke-emerald-500' },
    { label: 'Pending', value: stats?.verifications.contractors.pending || 0, color: 'stroke-amber-500' },
    { label: 'Rejected', value: stats?.verifications.contractors.rejected || 0, color: 'stroke-rose-500' }
  ];

  const verifBadgeVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  } as const;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Command Operations Center</h1>
        <p className="text-slate-400 text-sm mt-1">Suspend platform users, moderate offensive reviews, and process registrations approvals</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ADMIN TABS NAVIGATION */}
      <div className="flex border-b border-slate-800/80 gap-6">
        {[
          { id: 'overview', label: 'Platform Diagnostics' },
          { id: 'verifications', label: `Pending Reviews (${pendingReviews.length})` },
          { id: 'users', label: 'Platform Users' },
          { id: 'reviews', label: 'Moderate Reviews' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-sm font-semibold tracking-wide transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENTS: 1. platform overview stats */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-8">
          {/* Counters */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: 'Builders', value: stats?.totals.builders, desc: 'registered companies', color: 'text-purple-400' },
              { label: 'Contractors', value: stats?.totals.contractors, desc: 'active tradesmen', color: 'text-indigo-400' },
              { label: 'Projects', value: stats?.totals.projects, desc: 'published projects', color: 'text-sky-400' },
              { label: 'Packages', value: stats?.totals.packages, desc: 'awarded work units', color: 'text-emerald-400' },
              { label: 'Quotations', value: stats?.totals.quotations, desc: 'quotation bids filed', color: 'text-amber-400' }
            ].map((counter, idx) => (
              <Card key={idx}>
                <CardContent className="pt-5 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{counter.label}</span>
                  <span className={`text-3xl font-black ${counter.color} block mt-1`}>{counter.value}</span>
                  <span className="text-[10px] text-slate-500 block mt-1.5">{counter.desc}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Verification Ratio Rings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Builder Verifications Ratio</CardTitle>
                <CardDescription>Approved vs Pending vs Rejected Builder filings</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-4">
                <DonutChart data={builderVerifChartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contractor Verifications Ratio</CardTitle>
                <CardDescription>Approved vs Pending vs Rejected Contractor filings</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-4">
                <DonutChart data={contractorVerifChartData} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENTS: 2. pending reviews checklist */}
      {activeTab === 'verifications' && (
        <div className="flex flex-col gap-4">
          {pendingReviews.length === 0 ? (
            <Card className="py-12 border-dashed border-slate-800">
              <CardContent className="flex flex-col items-center gap-3 text-slate-500 text-center">
                <svg className="w-8 h-8 text-slate-650" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h3 className="text-base font-bold text-white mt-1">All Profiles Verified</h3>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">No builders or contractors have submitted verification credentials awaiting checkup.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingReviews.map((item) => (
                <Card key={item.id} hoverEffect className="flex flex-col justify-between">
                  <div>
                    <CardHeader className="pb-3 flex flex-row justify-between items-start">
                      <div>
                        <Badge variant={item.type === 'builder' ? 'success' : 'primary'} size="sm" className="capitalize mb-1.5">
                          {item.type}
                        </Badge>
                        <CardTitle className="text-base font-bold text-white block truncate">{item.name}</CardTitle>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold">{new Date(item.created_at).toLocaleDateString()}</span>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col gap-3 text-slate-400 text-xs">
                      <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
                        <div>
                          <span className="text-[9px] text-slate-500 block font-semibold uppercase">GSTIN / AADHAAR</span>
                          <span className="text-slate-300 font-mono font-medium">{item.gst_no || item.aadhaar_no || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block font-semibold uppercase">PAN</span>
                          <span className="text-slate-300 font-mono font-medium">{item.pan_no || 'N/A'}</span>
                        </div>
                      </div>
                      {item.address && <div className="line-clamp-2 text-slate-400 mt-1 leading-relaxed">Address: {item.address}</div>}
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-800/40 mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500 font-semibold">{item.documents.length} document files uploaded</span>
                    <Button onClick={() => setSelectedItem(item)} variant="primary" size="sm">Review Details</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENTS: 3. platform users listing */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <CardTitle>Registered Platform Users</CardTitle>
            <CardDescription>Monitor credentials, suspension states, and registration dates</CardDescription>
          </CardHeader>
          <CardContent>
            {usersList.length === 0 ? (
              <span className="text-slate-500 text-xs italic py-8 block text-center w-full">No users registered on the platform.</span>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade / Company Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Verification Status</TableHead>
                    <TableHead>Account Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersList.map((usr) => (
                    <TableRow key={usr.id}>
                      <TableCell className="font-bold text-white truncate max-w-[150px]">{usr.name}</TableCell>
                      <TableCell className="text-slate-400">{usr.email}</TableCell>
                      <TableCell className="capitalize text-slate-300 font-semibold text-xs">{usr.role}</TableCell>
                      <TableCell>
                        {usr.role !== 'admin' ? (
                          <Badge variant={verifBadgeVariant[usr.verification_status]} size="sm" className="capitalize">
                            {usr.verification_status}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {usr.is_suspended ? (
                          <Badge variant="danger" size="sm">Suspended</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {usr.role !== 'admin' && (
                          <Button
                            onClick={() => handleToggleSuspension(usr)}
                            variant={usr.is_suspended ? 'primary' : 'danger'}
                            size="sm"
                            disabled={submittingAction}
                          >
                            {usr.is_suspended ? 'Activate' : 'Suspend'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB CONTENTS: 4. moderate posted reviews */}
      {activeTab === 'reviews' && (
        <Card>
          <CardHeader>
            <CardTitle>Posted Contractor Reviews</CardTitle>
            <CardDescription>Moderate ratings, review items, and delete offensive content</CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsList.length === 0 ? (
              <span className="text-slate-500 text-xs italic py-8 block text-center w-full">No feedback ratings posted yet.</span>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer (Builder)</TableHead>
                    <TableHead>Reviewee (Contractor)</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Written Comment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewsList.map((rev) => (
                    <TableRow key={rev.id}>
                      <TableCell className="font-bold text-white max-w-[120px] truncate">{rev.reviewer_name}</TableCell>
                      <TableCell className="text-slate-300 max-w-[120px] truncate">{rev.reviewee_name}</TableCell>
                      <TableCell className="font-bold text-indigo-400">★ {rev.rating} / 5</TableCell>
                      <TableCell className="text-slate-400 max-w-[250px] truncate italic">&quot;{rev.feedback}&quot;</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleDeleteReview(rev.id)}
                          variant="danger"
                          size="sm"
                          disabled={submittingAction}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* DETAIL VERIFICATION REVIEW MODAL */}
      {selectedItem && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedItem(null)}
          title={`Review ${selectedItem.type === 'builder' ? 'Builder Company' : 'Contractor Identity'} Registration`}
          size="lg"
          footer={
            <div className="flex items-center gap-3 w-full justify-between">
              <Button onClick={() => handleReviewAction('reject')} variant="danger" loading={reviewing}>Reject Profile</Button>
              <Button onClick={() => handleReviewAction('approve')} variant="primary" loading={reviewing}>Approve Verification</Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6 text-slate-300 text-xs">
            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Registered Name</span>
              <span className="text-white font-bold text-sm block">{selectedItem.name}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">GSTIN / AADHAAR</span>
                <span className="text-slate-200 font-mono block mt-0.5">{selectedItem.gst_no || selectedItem.aadhaar_no || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">PAN Card</span>
                <span className="text-slate-200 font-mono block mt-0.5">{selectedItem.pan_no || 'N/A'}</span>
              </div>
            </div>

            {selectedItem.address && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Declared Address</span>
                <p className="text-slate-200 bg-slate-950/20 border border-slate-900 p-3 rounded-xl leading-relaxed">{selectedItem.address}</p>
              </div>
            )}

            {/* Document Scans */}
            <div className="flex flex-col gap-2 border-t border-slate-800/40 pt-6">
              <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">Uploaded PDF / Image Scans</span>
              {selectedItem.documents.length === 0 ? (
                <span className="text-slate-500 italic block">No document files uploaded.</span>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedItem.documents.map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 rounded-xl flex items-center justify-between gap-3 text-slate-300 transition-all duration-200"
                    >
                      <span className="text-xs truncate">{doc.file_name}</span>
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* REJECTION REMARKS */}
            <div className="flex flex-col gap-1.5 border-t border-slate-800/40 pt-6">
              <label className="text-xs font-semibold text-slate-400">Rejection Remarks (Required if rejecting profile)</label>
              <textarea
                placeholder="Log specific reasons for rejecting profile registration files (e.g. Aadhaar number mismatch)..."
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={reviewing}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none resize-none"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminDashboard;
