'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface PackageDetails {
  id: string;
  name: string;
  description: string;
  budget: string;
  scope: string;
  required_experience: string | null;
  timeline_start: string | null;
  timeline_end: string | null;
  project_name: string;
  project_description: string;
  project_location: string;
  project_property_type: string | null;
  builder_name: string;
  builder_trust_score: string;
  skills: string[] | null;
}

interface CostBreakdownRow {
  item: string;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
}

const PackageBiddingPage = () => {
  const router = useRouter();
  const { packageId } = useParams();

  const [details, setDetails] = useState<PackageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Bidding Form Fields
  const [proposedBudget, setProposedBudget] = useState('');
  const [timelineStart, setTimelineStart] = useState('');
  const [timelineEnd, setTimelineEnd] = useState('');
  const [notes, setNotes] = useState('');

  // Cost Breakdown Repeater (Default has one row)
  const [breakdown, setBreakdown] = useState<CostBreakdownRow[]>([
    { item: 'Initial Setup & Materials', quantity: 1, unit: 'LumpSum', rate: 0, total: 0 }
  ]);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        setLoading(true);
        const res = (await axiosInstance.get(`/discovery/packages/${packageId}`)) as any;
        if (res.success) {
          setDetails(res.data);
          // Set timeline placeholders if present in builder specs
          if (res.data.timeline_start) {
            setTimelineStart(res.data.timeline_start.split('T')[0]);
          }
          if (res.data.timeline_end) {
            setTimelineEnd(res.data.timeline_end.split('T')[0]);
          }
        }
      } catch (err: any) {
        setErrorMsg(err?.message || 'Failed to retrieve work package specifications.');
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackageDetails();
    }
  }, [packageId]);

  // Handle updates to breakdown rows
  const handleBreakdownChange = (index: number, field: keyof CostBreakdownRow, value: any) => {
    setBreakdown((prev) => {
      const updated = [...prev];
      const row = { ...updated[index] };

      if (field === 'quantity') {
        row.quantity = Math.max(1, parseInt(value, 10) || 1);
        row.total = row.quantity * row.rate;
      } else if (field === 'rate') {
        row.rate = Math.max(0, parseFloat(value) || 0);
        row.total = row.quantity * row.rate;
      } else if (field === 'item' || field === 'unit') {
        (row as any)[field] = value;
      }

      updated[index] = row;
      return updated;
    });
  };

  const addBreakdownRow = () => {
    setBreakdown((prev) => [
      ...prev,
      { item: '', quantity: 1, unit: 'Qty', rate: 0, total: 0 }
    ]);
  };

  const removeBreakdownRow = (index: number) => {
    if (breakdown.length === 1) return;
    setBreakdown((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Calculate sum of breakdown items
  const breakdownSum = breakdown.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const budgetVal = parseFloat(proposedBudget);
    if (!budgetVal || budgetVal <= 0) {
      setErrorMsg('Proposed budget must be a positive number.');
      return;
    }

    if (!timelineStart || !timelineEnd) {
      setErrorMsg('Please specify both timeline start and end parameters.');
      return;
    }

    // Check if total items match proposed cost
    if (Math.abs(breakdownSum - budgetVal) > 0.01) {
      setErrorMsg(`Itemized cost breakdown sum (₹${breakdownSum.toLocaleString('en-IN')}) must exactly match the proposed budget (₹${budgetVal.toLocaleString('en-IN')}).`);
      return;
    }

    // Validate breakdown rows description
    const hasEmptyItem = breakdown.some(r => !r.item.trim());
    if (hasEmptyItem) {
      setErrorMsg('All cost breakdown lines must have description text.');
      return;
    }

    setSaving(true);
    try {
      const res = (await axiosInstance.post(`/discovery/packages/${packageId}/bid`, {
        proposed_budget: budgetVal,
        proposed_timeline_start: timelineStart,
        proposed_timeline_end: timelineEnd,
        proposal_notes: notes,
        breakdown
      })) as any;

      if (res.success) {
        setSuccessMsg('Your quotation bid has been successfully submitted to the builder!');
        setTimeout(() => {
          router.push('/contractor/applications');
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit quotation proposal.');
    } finally {
      setSaving(false);
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

  if (errorMsg && !details) {
    return (
      <div className="p-6 bg-red-950/20 border border-red-900/30 rounded-2xl text-red-400 max-w-lg mx-auto">
        <h3 className="font-bold text-lg mb-1 font-sans">Specifications Error</h3>
        <p className="text-sm">{errorMsg}</p>
        <Button onClick={() => router.push('/contractor/discovery')} variant="outline" className="mt-4 border-red-500/30 text-red-300">
          Back to Discovery Board
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-2 border-b border-slate-800/40 pb-6">
        <button
          onClick={() => router.push('/contractor/discovery')}
          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Bidding Board
        </button>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Submit Work Proposal</h1>
        <p className="text-slate-400 text-sm">Review package requirements and compile your cost breakdown quotation</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {details && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* LEFT COLUMN: PACKAGE SPECIFICATIONS */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Package Requirements</CardTitle>
                <CardDescription>Published by {details.builder_name} ({Math.round(Number(details.builder_trust_score))}% verified)</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-slate-300 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Project Category</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{details.project_name}</span>
                  <span className="text-slate-400 mt-1 block">Location: {details.project_location}</span>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Package Name</span>
                  <span className="text-indigo-400 font-extrabold text-sm block mt-0.5">{details.name}</span>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Package Budget limit</span>
                  <span className="text-purple-400 font-extrabold text-base block mt-0.5">₹{Number(details.budget).toLocaleString('en-IN')}</span>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Required Contractor Experience</span>
                  <span className="text-slate-200 font-semibold block mt-0.5">{details.required_experience || 'Open to all experience levels'}</span>
                </div>

                <div className="border-t border-slate-800/40 pt-4">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Scope of Work</span>
                  <p className="mt-1 leading-relaxed text-slate-400">{details.scope}</p>
                </div>

                {details.skills && details.skills.length > 0 && (
                  <div className="border-t border-slate-800/40 pt-4">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1.5">Required Skills / trades</span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.skills.map((skill, idx) => (
                        <Badge key={idx} variant="glass" size="sm" className="border-purple-500/20 text-purple-300">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: PROPOSAL BID FORM */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Proposal Form</CardTitle>
                <CardDescription>Itemize costs to match your bidding budget</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitBid} className="flex flex-col gap-6">
                  {/* Budget and timeline parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Proposed Budget (INR)"
                      type="number"
                      placeholder="E.g. 500000"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      disabled={saving}
                      required
                    />
                    <Input
                      label="Est. Start Date"
                      type="date"
                      value={timelineStart}
                      onChange={(e) => setTimelineStart(e.target.value)}
                      disabled={saving}
                      required
                    />
                    <Input
                      label="Est. End Date"
                      type="date"
                      value={timelineEnd}
                      onChange={(e) => setTimelineEnd(e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>

                  {/* Proposal notes */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Proposal Description & Notes</label>
                    <textarea
                      placeholder="Outline your methodologies, machinery to be deployed, or safety assurances..."
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={saving}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500/80 focus:ring-purple-500/30 focus:ring-4 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  {/* Itemized Cost Breakdown repeater */}
                  <div className="flex flex-col gap-2.5 border-t border-slate-800/40 pt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Itemized Cost Breakdown</span>
                        <span className="text-[10px] text-slate-500">Break costs into line items (must sum to proposed budget)</span>
                      </div>
                      <Button
                        type="button"
                        onClick={addBreakdownRow}
                        variant="secondary"
                        size="sm"
                        disabled={saving}
                      >
                        + Add Row
                      </Button>
                    </div>

                    <div className="overflow-hidden border border-slate-800 rounded-xl mt-2 text-xs">
                      <Table className="bg-transparent border-none">
                        <TableHeader className="bg-slate-950/40">
                          <TableRow>
                            <TableHead className="py-2.5 px-3">Item Name/Description</TableHead>
                            <TableHead className="py-2.5 px-3 w-16 text-center">Qty</TableHead>
                            <TableHead className="py-2.5 px-3 w-16">Unit</TableHead>
                            <TableHead className="py-2.5 px-3 w-28">Rate</TableHead>
                            <TableHead className="py-2.5 px-3 w-24 text-right">Subtotal</TableHead>
                            <TableHead className="py-2.5 px-3 w-12 text-center"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {breakdown.map((row, index) => (
                            <TableRow key={index} className="hover:bg-transparent">
                              <TableCell className="p-1 px-3">
                                <input
                                  type="text"
                                  placeholder="E.g. Steel rebar supply"
                                  value={row.item}
                                  onChange={(e) => handleBreakdownChange(index, 'item', e.target.value)}
                                  disabled={saving}
                                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                                />
                              </TableCell>
                              <TableCell className="p-1 px-3">
                                <input
                                  type="number"
                                  placeholder="1"
                                  value={row.quantity}
                                  onChange={(e) => handleBreakdownChange(index, 'quantity', e.target.value)}
                                  disabled={saving}
                                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 text-center outline-none"
                                />
                              </TableCell>
                              <TableCell className="p-1 px-3">
                                <input
                                  type="text"
                                  placeholder="Kg"
                                  value={row.unit}
                                  onChange={(e) => handleBreakdownChange(index, 'unit', e.target.value)}
                                  disabled={saving}
                                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                                />
                              </TableCell>
                              <TableCell className="p-1 px-3">
                                <input
                                  type="number"
                                  placeholder="Rate"
                                  value={row.rate || ''}
                                  onChange={(e) => handleBreakdownChange(index, 'rate', e.target.value)}
                                  disabled={saving}
                                  className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                                />
                              </TableCell>
                              <TableCell className="p-1 px-3 text-right font-bold text-slate-300">
                                ₹{row.total.toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="p-1 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => removeBreakdownRow(index)}
                                  disabled={breakdown.length === 1 || saving}
                                  className="text-slate-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Breakdown validation totals */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-950/60 border border-slate-900 rounded-xl mt-3 text-xs gap-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Calculated sum of items</span>
                        <span className="text-white font-extrabold text-sm">₹{breakdownSum.toLocaleString('en-IN')}</span>
                      </div>
                      
                      {proposedBudget && Math.abs(breakdownSum - parseFloat(proposedBudget)) > 0.01 && (
                        <div className="text-amber-400 font-medium text-[11px] flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>Sum must equal proposed budget (₹{Number(proposedBudget).toLocaleString('en-IN')})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    disabled={Math.abs(breakdownSum - parseFloat(proposedBudget)) > 0.01 || saving}
                    className="mt-4"
                  >
                    File Work Proposal
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageBiddingPage;
