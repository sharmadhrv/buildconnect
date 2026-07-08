'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface AwardedProject {
  package_id: string;
  package_name: string;
  package_desc: string;
  package_budget: string;
  package_scope: string;
  package_status: 'awarded' | 'completed';
  package_start: string | null;
  package_end: string | null;
  project_name: string;
  project_location: string;
  builder_name: string;
  builder_email: string;
}

const ContractorProjectsPage = () => {
  const [projects, setProjects] = useState<AwardedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State: 'active' | 'completed'
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = (await axiosInstance.get('/contractors/projects')) as any;
        if (res.success) {
          setProjects(res.data);
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve won projects list.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
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

  // Filter projects by active ('awarded') or completed
  const filteredProjects = projects.filter((proj) => {
    if (activeTab === 'active') return proj.package_status === 'awarded';
    return proj.package_status === 'completed';
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Awarded Project Work</h1>
        <p className="text-slate-400 text-sm mt-1">Manage active site locations and track package timelines</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* TABS BUTTONS */}
      <div className="flex border-b border-slate-800/80 gap-6">
        <button
          onClick={() => setActiveTab('active')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'active'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Won Packages ({projects.filter(p => p.package_status === 'awarded').length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`py-3 px-1 text-sm font-semibold border-b-2 transition-all duration-200 ${
            activeTab === 'completed'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Completed Packages ({projects.filter(p => p.package_status === 'completed').length})
        </button>
      </div>

      {/* PROJECTS LIST GRID */}
      {filteredProjects.length === 0 ? (
        <Card className="py-12 border-dashed border-slate-800">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Packages in this segment</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                {activeTab === 'active'
                  ? 'Bids accepted by builders will appear as active won projects here.'
                  : 'Contracts marked as completed by builders will transition to your history log.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <Card key={proj.package_id} hoverEffect>
              <CardHeader className="flex flex-col gap-1.5 pb-3">
                <div className="flex justify-between items-start gap-4">
                  <Badge variant="glass" size="sm" className="border-indigo-500/20 text-indigo-300">
                    ₹{Number(proj.package_budget).toLocaleString('en-IN')}
                  </Badge>
                  <Badge variant={proj.package_status === 'awarded' ? 'success' : 'neutral'} size="sm" className="capitalize">
                    {proj.package_status === 'awarded' ? 'In Progress' : 'Completed'}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-white mt-1">
                  {proj.package_name}
                </CardTitle>
                <CardDescription className="text-xs truncate">
                  {proj.project_name} &bull; {proj.project_location}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col gap-4 text-slate-300 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Scope of Work</span>
                  <p className="line-clamp-3 leading-relaxed">{proj.package_scope}</p>
                </div>

                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex flex-col gap-2">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Builder Account</span>
                    <span className="text-white font-bold text-xs">{proj.builder_name}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">Contact Details</span>
                    <span className="text-slate-400 font-semibold">{proj.builder_email}</span>
                  </div>
                </div>

                {proj.package_start && proj.package_end && (
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 border-t border-slate-800/40 pt-3">
                    <span>Est Start: {new Date(proj.package_start).toLocaleDateString()}</span>
                    <span>Est End: {new Date(proj.package_end).toLocaleDateString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractorProjectsPage;
