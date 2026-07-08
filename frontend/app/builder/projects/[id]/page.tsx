'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface PackageItem {
  id: string;
  name: string;
  description: string;
  budget: string;
  timeline_start: string | null;
  timeline_end: string | null;
  scope: string;
  required_experience: string | null;
  skills: string[] | null;
  status: 'open' | 'awarded' | 'completed' | 'cancelled';
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string;
  budget: string;
  timeline_start: string | null;
  timeline_end: string | null;
  property_type: string | null;
  location: string;
  status: 'draft' | 'pending_approval' | 'published' | 'archived';
  packages: PackageItem[];
}

const ProjectDetailsPage = () => {
  const router = useRouter();
  const { id: projectId } = useParams();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Modal State
  const [selectedPkg, setSelectedPkg] = useState<PackageItem | null>(null);
  const [overallRating, setOverallRating] = useState(5);
  const [qualityScore, setQualityScore] = useState(5);
  const [commScore, setCommScore] = useState(5);
  const [timeScore, setTimeScore] = useState(5);
  const [profScore, setProfScore] = useState(5);
  const [safetyScore, setSafetyScore] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = (await axiosInstance.get(`/projects/${projectId}`)) as any;
      if (res.success) {
        setProject(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) return;

    if (!feedbackNotes.trim()) {
      alert('Please provide a feedback comment summarizing their performance.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = (await axiosInstance.post(`/reviews/packages/${selectedPkg.id}`, {
        rating: overallRating,
        feedback: feedbackNotes,
        ratings_breakdown: {
          quality: qualityScore,
          communication: commScore,
          timeliness: timeScore,
          professionalism: profScore,
          safety: safetyScore
        }
      })) as any;

      if (res.success) {
        alert('Work package marked completed and rating review logged successfully!');
        setSelectedPkg(null);
        setFeedbackNotes('');
        fetchProjectDetails(); // Reload page specifications
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit project review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !project) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-2xl text-red-400">
        <h3 className="font-bold text-lg mb-1">Project Not Found</h3>
        <p className="text-sm">{error || 'Could not retrieve project information.'}</p>
        <Button onClick={() => router.push('/builder/projects')} variant="outline" className="mt-4 border-red-500/30 text-red-300">
          Back to Projects List
        </Button>
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

  const packageStatusBadgeVariants = {
    open: 'neutral',
    awarded: 'primary',
    completed: 'success',
    cancelled: 'danger'
  } as const;

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/40 pb-6">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/builder/projects')}
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Projects list
          </button>
          
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">{project.name}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <Badge variant={statusBadgeVariants[project.status]}>
              {statusLabels[project.status]}
            </Badge>
            <span className="text-xs text-slate-500">Declared: {new Date(project.timeline_start || '').toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project framework summary */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description & Scope</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-slate-300 text-sm leading-relaxed">
              <p>{project.description}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-800/40">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Work Package Split</h4>
                <div className="flex flex-col gap-4">
                  {project.packages?.map((pkg, idx) => (
                    <div key={pkg.id} className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-sm text-slate-100">Package #{idx + 1}: {pkg.name}</h5>
                            <Badge variant={packageStatusBadgeVariants[pkg.status]} size="sm" className="capitalize">
                              {pkg.status}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-1">Exp Required: {pkg.required_experience || 'Not specified'}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="font-bold text-purple-400 text-sm">₹{Number(pkg.budget).toLocaleString('en-IN')}</span>
                          {pkg.status === 'awarded' && (
                            <Button
                              onClick={() => {
                                setSelectedPkg(pkg);
                                setOverallRating(5);
                                setQualityScore(5);
                                setCommScore(5);
                                setTimeScore(5);
                                setProfScore(5);
                                setSafetyScore(5);
                              }}
                              variant="primary"
                              size="sm"
                            >
                              Complete Work
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-slate-400">{pkg.description}</p>
                      
                      <div className="text-xs text-slate-300 mt-1">
                        <span className="font-semibold block text-slate-400 text-[10px] uppercase tracking-wider">Scope of Work</span>
                        <p className="mt-1 leading-relaxed">{pkg.scope}</p>
                      </div>

                      {/* Render Skill Tags */}
                      {pkg.skills && pkg.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {pkg.skills.map((skill, sIdx) => (
                            <Badge key={sIdx} variant="glass" size="sm" className="border-purple-500/20 text-purple-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info panel */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Metadata</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40">
                <span className="text-slate-500 font-medium">Aggregate Budget</span>
                <span className="text-white font-bold">₹{Number(project.budget).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40">
                <span className="text-slate-500 font-medium">Location</span>
                <span className="text-slate-200">{project.location}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-slate-800/40">
                <span className="text-slate-500 font-medium">Property Category</span>
                <span className="text-slate-200">{project.property_type || 'General'}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-slate-500 font-medium">Expected Timelines</span>
                <span className="text-slate-200">
                  {project.timeline_start ? new Date(project.timeline_start).toLocaleDateString() : 'N/A'} - {project.timeline_end ? new Date(project.timeline_end).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RATINGS REVIEW MODAL */}
      {selectedPkg && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPkg(null)}
          title="Mark Package Completed & Review"
          size="lg"
          footer={
            <div className="flex items-center gap-3 justify-end w-full">
              <Button onClick={() => setSelectedPkg(null)} variant="secondary" disabled={submittingReview}>
                Cancel
              </Button>
              <Button onClick={handleReviewSubmit} variant="primary" loading={submittingReview}>
                Submit Review & Complete
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-6 text-slate-300 text-xs">
            <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Completing Package</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{selectedPkg.name}</span>
            </div>

            {/* Overall Rating Slider */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-bold text-slate-200 text-sm">
                <span>Overall Star Rating</span>
                <span className="text-purple-400">★ {overallRating} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                value={overallRating}
                onChange={(e) => setOverallRating(parseInt(e.target.value, 10))}
                disabled={submittingReview}
                className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-900 rounded-full"
              />
            </div>

            {/* Performance Breakdowns sliders */}
            <div className="flex flex-col gap-4 border-t border-slate-800/40 pt-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">Performance Parameters</span>
              
              {/* Quality of Work */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-400 uppercase tracking-wider text-[9px]">
                  <span>Quality of Construction</span>
                  <span className="text-slate-200 font-bold">{qualityScore} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={qualityScore}
                  onChange={(e) => setQualityScore(parseInt(e.target.value, 10))}
                  disabled={submittingReview}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-full"
                />
              </div>

              {/* Communication */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-400 uppercase tracking-wider text-[9px]">
                  <span>Communication & Responsiveness</span>
                  <span className="text-slate-200 font-bold">{commScore} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={commScore}
                  onChange={(e) => setCommScore(parseInt(e.target.value, 10))}
                  disabled={submittingReview}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-full"
                />
              </div>

              {/* Timeliness */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-400 uppercase tracking-wider text-[9px]">
                  <span>Schedule & Timeliness</span>
                  <span className="text-slate-200 font-bold">{timeScore} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={timeScore}
                  onChange={(e) => setTimeScore(parseInt(e.target.value, 10))}
                  disabled={submittingReview}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-full"
                />
              </div>

              {/* Professionalism */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-400 uppercase tracking-wider text-[9px]">
                  <span>Professionalism & Business Conduct</span>
                  <span className="text-slate-200 font-bold">{profScore} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={profScore}
                  onChange={(e) => setProfScore(parseInt(e.target.value, 10))}
                  disabled={submittingReview}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-full"
                />
              </div>

              {/* Safety */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-slate-400 uppercase tracking-wider text-[9px]">
                  <span>Safety Compliance</span>
                  <span className="text-slate-200 font-bold">{safetyScore} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={safetyScore}
                  onChange={(e) => setSafetyScore(parseInt(e.target.value, 10))}
                  disabled={submittingReview}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-900 rounded-full"
                />
              </div>
            </div>

            {/* Written feedback textarea */}
            <div className="flex flex-col gap-1.5 border-t border-slate-800/40 pt-4">
              <label className="text-xs font-semibold text-slate-400">Written Feedback Statement</label>
              <textarea
                placeholder="Log a summary statement about contractor performance (e.g. delivered ahead of schedule)..."
                rows={3}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                disabled={submittingReview}
                className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none resize-none"
                required
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDetailsPage;
