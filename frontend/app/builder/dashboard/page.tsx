'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

import { BarChart } from '@/components/ui/Charts';

interface AnalyticsData {
  totalProjects: number;
  activeProjects: number;
  draftProjects: number;
  pendingApplications: number;
  trustScore: number;
  aiProfileScore: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

const BuilderDashboard = () => {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [projectChartData, setProjectChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [res, projRes] = await Promise.all([
          axiosInstance.get('/builders/analytics') as any,
          axiosInstance.get('/projects/list/builder') as any
        ]);

        if (res.success) {
          setData(res.data);
        }

        if (projRes.success && projRes.data) {
          const list = projRes.data;
          const sorted = [...list]
            .sort((a: any, b: any) => parseFloat(b.budget) - parseFloat(a.budget))
            .slice(0, 5)
            .map((p: any) => ({
              label: p.name.length > 8 ? p.name.slice(0, 8) + '..' : p.name,
              value: parseFloat(p.budget)
            }));
          setProjectChartData(sorted);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-2xl text-red-400">
        <h3 className="font-bold text-lg mb-1">Dashboard Error</h3>
        <p className="text-sm">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-red-500/30 hover:bg-red-500/10 text-red-300">
          Try Again
        </Button>
      </div>
    );
  }

  const verifBadgeVariant = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger'
  } as const;

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Manage project bids, verification papers, and active packages</p>
        </div>
        <Button
          onClick={() => router.push('/builder/projects/create')}
          variant="primary"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Post New Project
        </Button>
      </div>

      {/* VERIFICATION WARNING ALERT */}
      {data && data.verificationStatus !== 'approved' && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600/10 to-amber-700/5 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-200 text-sm">Company Verification Pending</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {data.verificationStatus === 'pending'
                  ? 'Your profile is awaiting verification by BuildConnect admins. Submit required papers (GST, PAN, Reg docs) to gain trust scores.'
                  : 'Your company verification has been rejected. Please update registration details and upload valid documents.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/builder/profile')}
            variant="glass"
            size="sm"
            className="border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
          >
            Review Profile
          </Button>
        </div>
      )}

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Projects</CardDescription>
            <span className="text-purple-400 bg-purple-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">{data?.totalProjects}</span>
            <div className="text-[11px] text-slate-500 mt-1.5">{data?.draftProjects} drafts saved</div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Bidding</CardDescription>
            <span className="text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">{data?.activeProjects}</span>
            <div className="text-[11px] text-slate-500 mt-1.5">published projects open for bids</div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Applications</CardDescription>
            <span className="text-sky-400 bg-sky-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">{data?.pendingApplications}</span>
            <div className="text-[11px] text-slate-500 mt-1.5">contractor bids awaiting review</div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trust Metrics</CardDescription>
            <span className="text-amber-400 bg-amber-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{data ? Math.round(data.trustScore) : 0}%</span>
              <span className="text-xs text-slate-500 font-semibold">(AI: {data ? Math.round(data.aiProfileScore) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[10px] text-slate-500">Status:</span>
              <Badge variant={data ? verifBadgeVariant[data.verificationStatus] : 'neutral'} size="sm" className="capitalize">
                {data?.verificationStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QUICK LINKS & CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top Project Budgets (INR)</CardTitle>
            <CardDescription>Comparative horizontal bar chart showing your top 5 highest-budget projects</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex justify-center items-end min-h-[220px]">
            {projectChartData.length > 0 ? (
              <BarChart data={projectChartData} />
            ) : (
              <span className="text-slate-500 text-xs italic py-12 block text-center w-full">No projects published yet to chart.</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick System Status</CardTitle>
            <CardDescription>Platform integrity metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
              <span className="text-slate-400">SMTP Notification Dispatcher</span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
              <span className="text-slate-400">PostgreSQL Connection Pool</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
              <span className="text-slate-400">Supabase Document Storage</span>
              <span className="text-emerald-400 font-semibold">Configured</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">AI Compatibility Engine</span>
              <span className="text-amber-400 font-semibold">Standalone Mock</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BuilderDashboard;
