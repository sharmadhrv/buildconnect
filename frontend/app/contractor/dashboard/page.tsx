'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

import { DonutChart } from '@/components/ui/Charts';

interface ContractorAnalytics {
  totalApplications: number;
  totalWon: number;
  activeProjects: number;
  completedProjects: number;
  successRate: number;
  trustScore: number;
  aiProfileScore: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

const ContractorDashboard = () => {
  const router = useRouter();
  const [data, setData] = useState<ContractorAnalytics | null>(null);
  const [bidsChartData, setBidsChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [res, bidsRes] = await Promise.all([
          axiosInstance.get('/contractors/analytics') as any,
          axiosInstance.get('/contractors/applications') as any
        ]);

        if (res.success) {
          setData(res.data);
        }

        if (bidsRes.success && bidsRes.data) {
          const list = bidsRes.data;
          const statusCounts: { [key: string]: number } = {
            pending: 0,
            countered: 0,
            accepted: 0,
            rejected: 0
          };
          list.forEach((b: any) => {
            if (statusCounts[b.quotation_status] !== undefined) {
              statusCounts[b.quotation_status]++;
            }
          });
          setBidsChartData([
            { label: 'Accepted / Won', value: statusCounts.accepted, color: 'stroke-emerald-500' },
            { label: 'Counter Offer', value: statusCounts.countered, color: 'stroke-indigo-500' },
            { label: 'Pending Review', value: statusCounts.pending, color: 'stroke-amber-500' },
            { label: 'Declined', value: statusCounts.rejected, color: 'stroke-rose-500' }
          ]);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load contractor statistics.');
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
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-red-500/30 text-red-300">
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
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Review active won contracts, submitted bids, and trust metrics</p>
        </div>
        <Button
          onClick={() => router.push('/contractor/discovery')}
          variant="primary"
          className="w-full sm:w-auto"
        >
          Browse Bidding Board
        </Button>
      </div>

      {/* ALERT BOXES FOR OUTSTANDING ITEMS */}
      {data && data.verificationStatus !== 'approved' && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-600/10 to-amber-700/5 border border-amber-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-amber-200 text-sm">Identity Verification Required</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {data.verificationStatus === 'pending'
                  ? 'Your profile is awaiting identity verification by BuildConnect admins. Submit required papers (Aadhaar, PAN, Licenses) to gain trust score badges.'
                  : 'Your contractor identity verification has been rejected. Please re-submit valid registration and trade license documents.'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/contractor/profile')}
            variant="glass"
            size="sm"
            className="border-amber-500/20 text-amber-300 hover:bg-amber-500/10"
          >
            Review Verification
          </Button>
        </div>
      )}

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Bids Sent</CardDescription>
            <span className="text-purple-400 bg-purple-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">{data?.totalApplications}</span>
            <div className="text-[11px] text-slate-500 mt-1.5">{data?.totalWon} bids accepted by builders</div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bidding Success Rate</CardDescription>
            <span className="text-emerald-400 bg-emerald-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">
              {data ? Math.round(data.successRate) : 0}%
            </span>
            <div className="text-[11px] text-slate-500 mt-1.5">ratio of bids won to bids submitted</div>
          </CardContent>
        </Card>

        <Card hoverEffect>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Awarded Projects</CardDescription>
            <span className="text-sky-400 bg-sky-500/10 p-2 rounded-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </span>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-extrabold text-white">{data?.activeProjects}</span>
            <div className="text-[11px] text-slate-500 mt-1.5">{data?.completedProjects} completed projects logged</div>
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

      {/* CHARTS & DIAGNOSTICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Bidding Status Distribution</CardTitle>
            <CardDescription>Visual segment analysis of submitted bids by approval states</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 flex justify-center items-center min-h-[220px]">
            {bidsChartData.length > 0 ? (
              <DonutChart data={bidsChartData} />
            ) : (
              <span className="text-slate-500 text-xs italic py-12 block text-center w-full">No bids submitted yet to chart.</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Diagnostic Status</CardTitle>
            <CardDescription>Platform components check</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
              <span className="text-slate-400">Supabase Database</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
              <span className="text-slate-400">Supabase Document Storage</span>
              <span className="text-emerald-400 font-semibold">Configured</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">AI Compatibility Matcher</span>
              <span className="text-amber-400 font-semibold">Rule-Based Mock</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorDashboard;
