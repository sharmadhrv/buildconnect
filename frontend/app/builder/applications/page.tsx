'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface ApplicationListItem {
  quotation_id: string;
  proposed_budget: string;
  proposed_timeline_start: string;
  proposed_timeline_end: string;
  proposal_notes: string;
  breakdown: any; // Detailed cost breakdown array
  quotation_status: 'pending' | 'countered' | 'accepted' | 'rejected';
  counter_budget: string | null;
  counter_notes: string | null;
  counter_by: 'builder' | 'contractor' | null;
  applied_at: string;
  package_id: string;
  package_name: string;
  package_budget: string;
  package_status: string;
  project_id: string;
  project_name: string;
  contractor_id: string;
  contractor_name: string;
  contractor_trust_score: string;
  contractor_success_rate: string;
  contractor_projects_count: number;
}

const BuilderApplicationsPage = () => {
  const [bids, setBids] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected bid detail modal state
  const [selectedBid, setSelectedBid] = useState<ApplicationListItem | null>(null);
  const [reviewing, setReviewing] = useState(false);

  // Counter Offer form state
  const [counterBudget, setCounterBudget] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = (await axiosInstance.get('/builders/applications')) as any;
      if (res.success) {
        setBids(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load contractor bids.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Propose Counter-Offer
  const handleProposeCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBid) return;

    const budgetVal = parseFloat(counterBudget);
    if (!budgetVal || budgetVal <= 0) {
      alert('Please enter a valid positive counter budget.');
      return;
    }

    if (!counterNotes.trim()) {
      alert('Please provide descriptions/notes explaining this counter-offer.');
      return;
    }

    setSubmittingCounter(true);
    try {
      const res = (await axiosInstance.post(`/negotiation/${selectedBid.quotation_id}/counter`, {
        budget: budgetVal,
        notes: counterNotes
      })) as any;

      if (res.success) {
        alert('Counter-offer submitted to contractor successfully!');
        setCounterBudget('');
        setCounterNotes('');
        setSelectedBid(null);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit counter-offer.');
    } finally {
      setSubmittingCounter(false);
    }
  };

  // Accept/Reject initial bids or contractor counters
  const handleReviewBid = async (bidId: string, decision: 'accepted' | 'rejected') => {
    const confirmation = window.confirm(
      decision === 'accepted'
        ? 'Are you sure you want to ACCEPT this bid? Accepting will award this package and automatically reject all other pending bids.'
        : 'Are you sure you want to REJECT this bid?'
    );
    if (!confirmation) return;

    setReviewing(true);
    try {
      // Use original endpoint if pending, or negotiation endpoint if countered
      const isCountered = selectedBid?.quotation_status === 'countered';
      const endpoint = isCountered 
        ? `/negotiation/${bidId}/respond` 
        : `/builders/applications/${bidId}/review`;
      const payload = isCountered 
        ? { action: decision === 'accepted' ? 'accept' : 'reject' } 
        : { status: decision };

      const res = (await axiosInstance.post(endpoint, payload)) as any;
      if (res.success) {
        setSelectedBid(null);
        fetchApplications(); // Reload list
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to process bid review.');
    } finally {
      setReviewing(false);
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

  const bidStatusBadgeVariants = {
    pending: 'warning',
    countered: 'primary',
    accepted: 'success',
    rejected: 'danger'
  } as const;

  const statusLabels = {
    pending: 'Pending',
    countered: 'Countered',
    accepted: 'Accepted',
    rejected: 'Declined'
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Contractor Applications</h1>
        <p className="text-slate-400 text-sm mt-1">Review contractor timelines, proposals, cost breakdowns, and negotiate budgets</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* APPLICATIONS TABLE */}
      {bids.length === 0 ? (
        <Card className="py-12 border-dashed border-slate-800">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Bids Submitted</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                When contractors apply for your published project packages, their timeline proposals and cost breakdowns will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Target Project / Package</TableHead>
              <TableHead>Package Budget</TableHead>
              <TableHead>Bid Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.map((bid) => (
              <TableRow key={bid.quotation_id}>
                <TableCell className="font-bold text-white">
                  <div>
                    <span className="block">{bid.contractor_name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Trust Score: {Math.round(Number(bid.contractor_trust_score))}%</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[250px] truncate text-slate-300 text-xs">
                  <div>
                    <span className="block font-bold text-slate-400">{bid.project_name}</span>
                    <span className="block text-slate-200 mt-0.5">{bid.package_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400">
                  ₹{Number(bid.package_budget).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="font-bold text-purple-400">
                  {bid.quotation_status === 'countered' && bid.counter_budget ? (
                    <div>
                      <span className="block line-through text-slate-500 text-xs">₹{Number(bid.proposed_budget).toLocaleString('en-IN')}</span>
                      <span className="block text-indigo-400">₹{Number(bid.counter_budget).toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <span>₹{Number(bid.proposed_budget).toLocaleString('en-IN')}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={bidStatusBadgeVariants[bid.quotation_status]} size="sm" className="capitalize">
                    {statusLabels[bid.quotation_status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={() => {
                      setSelectedBid(bid);
                      setCounterBudget(bid.counter_budget ? String(bid.counter_budget) : String(bid.proposed_budget));
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Review Bid
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* DETAILED BID REVIEW MODAL */}
      {selectedBid && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBid(null)}
          title="Contractor Bid Review & Negotiation"
          size="lg"
          footer={
            selectedBid.quotation_status === 'pending' ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <Button
                  onClick={() => handleReviewBid(selectedBid.quotation_id, 'rejected')}
                  variant="danger"
                  loading={reviewing}
                >
                  Reject Proposal
                </Button>
                <Button
                  onClick={() => handleReviewBid(selectedBid.quotation_id, 'accepted')}
                  variant="primary"
                  loading={reviewing}
                >
                  Accept & Award Package
                </Button>
              </div>
            ) : selectedBid.quotation_status === 'countered' && selectedBid.counter_by === 'contractor' ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <Button
                  onClick={() => handleReviewBid(selectedBid.quotation_id, 'rejected')}
                  variant="danger"
                  loading={reviewing}
                >
                  Reject Contractor Offer
                </Button>
                <Button
                  onClick={() => handleReviewBid(selectedBid.quotation_id, 'accepted')}
                  variant="primary"
                  loading={reviewing}
                >
                  Accept Contractor Offer
                </Button>
              </div>
            ) : (
              <Button onClick={() => setSelectedBid(null)} variant="secondary">
                Close Review
              </Button>
            )
          }
        >
          <div className="flex flex-col gap-6 text-slate-300">
            {/* Contractor Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Contractor</span>
                <span className="text-white font-bold text-sm block">{selectedBid.contractor_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Platform Trust Score</span>
                <Badge variant="primary" size="sm" className="mt-0.5">
                  {Math.round(Number(selectedBid.contractor_trust_score))}%
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Success Rate</span>
                <span className="text-slate-200 text-sm block">{Math.round(Number(selectedBid.contractor_success_rate))}% ({selectedBid.contractor_projects_count} projects)</span>
              </div>
            </div>

            {/* Negotiation History Banner */}
            {selectedBid.quotation_status === 'countered' && (
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-xl text-xs">
                <h5 className="font-bold text-sm text-indigo-200 mb-1">Active Negotiation Counter-Offer</h5>
                <p>
                  Latest proposal: <span className="font-bold text-white">₹{Number(selectedBid.counter_budget).toLocaleString('en-IN')}</span> proposed by <span className="font-bold uppercase">{selectedBid.counter_by}</span>.
                </p>
                {selectedBid.counter_notes && (
                  <p className="mt-2 text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800">
                    &quot;{selectedBid.counter_notes}&quot;
                  </p>
                )}
                {selectedBid.counter_by === 'builder' && (
                  <span className="block mt-2 font-semibold text-slate-400">Awaiting Contractor response...</span>
                )}
              </div>
            )}

            {/* Target package details */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Target Package Scope</span>
              <span className="text-slate-200 text-sm font-semibold">{selectedBid.project_name} &gt; {selectedBid.package_name}</span>
              <div className="flex gap-4 text-xs text-slate-400 mt-1">
                <span>Allocated Budget: ₹{Number(selectedBid.package_budget).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Proposal values */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-bold">Initial Bid Budget</span>
                <span className="text-purple-300 font-extrabold text-lg">₹{Number(selectedBid.proposed_budget).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold">Proposed Timelines</span>
                <span className="text-indigo-300 font-semibold text-xs block mt-1">
                  {new Date(selectedBid.proposed_timeline_start).toLocaleDateString()} to {new Date(selectedBid.proposed_timeline_end).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Proposal notes */}
            {selectedBid.proposal_notes && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Proposal Statement</span>
                <p className="p-4 bg-slate-950/20 border border-slate-900 rounded-xl text-xs text-slate-300 leading-relaxed italic">
                  &quot;{selectedBid.proposal_notes}&quot;
                </p>
              </div>
            )}

            {/* Itemized Cost Breakdown */}
            {selectedBid.breakdown && Array.isArray(selectedBid.breakdown) && selectedBid.breakdown.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Itemized Cost Breakdown</span>
                <div className="overflow-hidden border border-slate-800 rounded-xl text-xs">
                  <Table className="bg-transparent border-none">
                    <TableHeader className="bg-slate-950/40">
                      <TableRow>
                        <TableHead className="py-2.5 px-4">Line Item / Description</TableHead>
                        <TableHead className="py-2.5 px-4 text-center">Qty</TableHead>
                        <TableHead className="py-2.5 px-4">Unit Rate</TableHead>
                        <TableHead className="py-2.5 px-4 text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedBid.breakdown.map((item: any, index: number) => (
                        <TableRow key={index} className="hover:bg-transparent">
                          <TableCell className="py-2.5 px-4 font-semibold text-slate-200">{item.item || item.description}</TableCell>
                          <TableCell className="py-2.5 px-4 text-center text-slate-400">{item.quantity} {item.unit}</TableCell>
                          <TableCell className="py-2.5 px-4 text-slate-400">₹{Number(item.rate || item.unitRate).toLocaleString('en-IN')}</TableCell>
                          <TableCell className="py-2.5 px-4 text-right font-bold text-slate-300">₹{Number(item.total || (item.quantity * (item.rate || item.unitRate))).toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* PROPOSE COUNTER OFFER SECTION */}
            {(selectedBid.quotation_status === 'pending' || 
              (selectedBid.quotation_status === 'countered' && selectedBid.counter_by === 'contractor')) && (
              <div className="border-t border-slate-800/40 pt-6">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Send Counter Offer</h5>
                <form onSubmit={handleProposeCounter} className="flex flex-col gap-4">
                  <Input
                    label="Counter Budget Offer (INR)"
                    type="number"
                    value={counterBudget}
                    onChange={(e) => setCounterBudget(e.target.value)}
                    disabled={submittingCounter}
                    required
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Counter Description Notes</label>
                    <textarea
                      placeholder="Explain requested budget reduction or scope changes..."
                      rows={2}
                      value={counterNotes}
                      onChange={(e) => setCounterNotes(e.target.value)}
                      disabled={submittingCounter}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" variant="secondary" loading={submittingCounter} className="self-start">
                    Propose Counter
                  </Button>
                </form>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BuilderApplicationsPage;
