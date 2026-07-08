'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface ProjectListItem {
  id: string;
  name: string;
  location: string;
  budget: string;
  calculated_budget: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived';
  package_count: string;
  created_at: string;
}

const BuilderProjectsPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = (await axiosInstance.get('/projects/list/builder')) as any;
      if (res.success) {
        setProjects(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load projects list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handlePublishProject = async (projectId: string) => {
    try {
      // Transition status to published (or pending_approval for admin check)
      const res = (await axiosInstance.patch(`/projects/${projectId}/status`, { status: 'published' })) as any;
      if (res.success) {
        fetchProjects(); // Reload list
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to publish project.');
    }
  };

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

  const statusBadgeVariants = {
    draft: 'neutral',
    pending_approval: 'warning',
    published: 'success',
    archived: 'danger',
  } as const;

  const statusLabels = {
    draft: 'Draft',
    pending_approval: 'Awaiting Admin Approval',
    published: 'Published',
    archived: 'Archived',
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">My Project Frameworks</h1>
          <p className="text-slate-400 text-sm mt-1">Configure construction projects and manage work packages</p>
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

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* PROJECTS TABLE */}
      {projects.length === 0 ? (
        <Card className="py-12 border-dashed border-slate-800">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Projects Registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                Publish a construction project skeleton and define work packages to invite contractor bids.
              </p>
            </div>
            <Button onClick={() => router.push('/builder/projects/create')} variant="secondary" size="sm" className="mt-2">
              Post Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Framework Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Packages</TableHead>
              <TableHead>Declared Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((proj) => (
              <TableRow key={proj.id}>
                <TableCell className="font-bold text-white max-w-[200px] truncate">
                  {proj.name}
                </TableCell>
                <TableCell className="text-slate-400 text-xs">{proj.location}</TableCell>
                <TableCell>
                  <Badge variant="glass" size="sm" className="border-purple-500/20 text-purple-300">
                    {proj.package_count} Packages
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-slate-200">
                  ₹{Number(proj.calculated_budget || proj.budget).toLocaleString('en-IN')}
                </TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariants[proj.status]} size="sm">
                    {statusLabels[proj.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2.5">
                  {proj.status === 'draft' && (
                    <Button
                      onClick={() => handlePublishProject(proj.id)}
                      variant="glass"
                      size="sm"
                      className="border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Publish
                    </Button>
                  )}
                  <Button
                    onClick={() => router.push(`/builder/projects/${proj.id}`)}
                    variant="secondary"
                    size="sm"
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default BuilderProjectsPage;
