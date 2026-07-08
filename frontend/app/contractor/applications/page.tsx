'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface ApplicationItem {
  quotation_id: string;
  proposed_budget: string;
  proposed_timeline_start: string;
  proposed_timeline_end: string;
  proposal_notes: string;
  quotation_status: 'pending' | 'countered' | 'accepted' | 'rejected';
  counter_budget: string | null;
  counter_notes: string | null;
  counter_by: 'builder' | 'contractor' | null;
  applied_at: string;
  breakdown: any;
  package_name: string;
  package_budget: string;
  project_name: string;
  project_location: string;
  builder_name: string;
}

const ContractorApplicationsPage = () => {
  const [bids, setBids] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected bid detail modal state
  const [selectedBid, setSelectedBid] = useState<ApplicationItem | null>(null);
  const [reviewing, setReviewing] = useState(false);

  // Counter Offer form state
  const [counterBudget, setCounterBudget] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = (await axiosInstance.get('/contractors/applications')) as any;
      if (res.success) {
        setBids(res.data);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load contractor applications history.');
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
        alert('Counter-offer submitted to builder successfully!');
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

  // Respond to Builder Counter-Offer (Accept/Reject)
  const handleRespondCounter = async (decision: 'accept' | 'reject') => {
    if (!selectedBid) return;

    const confirmation = window.confirm(
      decision === 'accept'
        ? 'Are you sure you want to ACCEPT this counter-offer? Accepting will award the package to you at this budget.'
        : 'Are you sure you want to REJECT this counter-offer?'
    );
    if (!confirmation) return;

    setReviewing(true);
    try {
      const res = (await axiosInstance.post(`/negotiation/${selectedBid.quotation_id}/respond`, {
        action: decision
      })) as any;

      if (res.success) {
        alert(decision === 'accept' ? 'Counter-offer accepted! Package won.' : 'Counter-offer rejected.');
        setSelectedBid(null);
        fetchApplications();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to respond to counter-offer.');
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

  const badgeStatusVariants = {
    pending: 'warning',
    countered: 'primary',
    accepted: 'success',
    rejected: 'danger'
  } as const;

  const statusLabels = {
    pending: 'Pending Review',
    countered: 'Counter Offer',
    accepted: 'Accepted',
    rejected: 'Declined'
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Bids Log History</h1>
        <p className="text-slate-400 text-sm mt-1">Track proposals filed for open packages, review builder decisions and negotiate budgets</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* APPLICATIONS LIST */}
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
                You have not bid on any project packages yet. Go to discovery boards to search and apply for open packages.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Project / Package</TableHead>
              <TableHead>Builder Company</TableHead>
              <TableHead>Package Budget</TableHead>
              <TableHead>Proposed Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.map((bid) => (
              <TableRow key={bid.quotation_id}>
                <TableCell className="max-w-[200px] truncate text-slate-300">
                  <div>
                    <span className="block font-bold text-white">{bid.project_name}</span>
                    <span className="block text-slate-400 text-xs mt-0.5">{bid.package_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-slate-400 text-xs font-semibold">
                  {bid.builder_name}
                </TableCell>
                <TableCell className="text-slate-400">
                  ₹{Number(bid.package_budget).toLocaleString('en-IN')}
                </TableCell>
                <TableCell className="font-bold text-indigo-400">
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
                  <Badge variant={badgeStatusVariants[bid.quotation_status]} size="sm" className="capitalize">
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
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* BID DETAIL MODAL */}
      {selectedBid && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedBid(null)}
          title="Quotation Bid Review & Negotiation"
          size="lg"
          footer={
            selectedBid.quotation_status === 'countered' && selectedBid.counter_by === 'builder' ? (
              <div className="flex items-center gap-3 w-full justify-between">
                <Button
                  onClick={() => handleRespondCounter('reject')}
                  variant="danger"
                  loading={reviewing}
                >
                  Reject Builder Offer
                </Button>
                <Button
                  onClick={() => handleRespondCounter('accept')}
                  variant="primary"
                  loading={reviewing}
                >
                  Accept Builder Offer
                </Button>
              </div>
            ) : (
              <Button onClick={() => setSelectedBid(null)} variant="secondary">
                Close Detail
              </Button>
            )
          }
        >
          <div className="flex flex-col gap-6 text-slate-300">
            {/* Bid Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Builder Account</span>
                <span className="text-white font-bold text-sm block">{selectedBid.builder_name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Bidding Status</span>
                <Badge variant={badgeStatusVariants[selectedBid.quotation_status]} size="sm" className="mt-1 capitalize">
                  {statusLabels[selectedBid.quotation_status]}
                </Badge>
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
                {selectedBid.counter_by === 'contractor' && (
                  <span className="block mt-2 font-semibold text-slate-400">Awaiting Builder response...</span>
                )}
              </div>
            )}

            {/* Target package details */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Bidding Framework</span>
              <span className="text-slate-200 text-sm font-semibold">{selectedBid.project_name} &gt; {selectedBid.package_name}</span>
              <span className="text-xs text-slate-400 mt-0.5">Package Budget: ₹{Number(selectedBid.package_budget).toLocaleString('en-IN')}</span>
            </div>

            {/* Proposal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                <span className="text-[10px] text-indigo-400 uppercase tracking-wider block font-bold">Initial Proposed Budget</span>
                <span className="text-indigo-300 font-extrabold text-lg">₹{Number(selectedBid.proposed_budget).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <span className="text-[10px] text-purple-400 uppercase tracking-wider block font-bold">Proposed Timelines</span>
                <span className="text-purple-300 font-semibold text-xs block mt-1">
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

            {/* Cost Breakdown */}
            {selectedBid.breakdown && Array.isArray(selectedBid.breakdown) && selectedBid.breakdown.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Itemized Cost Breakdown</span>
                <div className="overflow-hidden border border-slate-800 rounded-xl text-xs">
                  <Table className="bg-transparent border-none">
                    <TableHeader className="bg-slate-950/40">
                      <TableRow>
                        <TableHead className="py-2.5 px-4">Line Item / Description</TableHead>
                        <TableHead className="py-2.5 px-4 text-center">Qty</TableHead>
                        <TableHead className="py-2.5 px-4">Rate</TableHead>
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

            {/* PROPOSE COUNTER OFFER BACK SECTION */}
            {selectedBid.quotation_status === 'countered' && selectedBid.counter_by === 'builder' && (
              <div className="border-t border-slate-800/40 pt-6">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-3">Send Counter Offer back</h5>
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
                    <label className="text-xs font-semibold text-slate-400">Counter Notes / Explanation</label>
                    <textarea
                      placeholder="Propose a revised compromise price or terms..."
                      rows={2}
                      value={counterNotes}
                      onChange={(e) => setCounterNotes(e.target.value)}
                      disabled={submittingCounter}
                      className="w-full bg-slate-900/60 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 outline-none resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" variant="secondary" loading={submittingCounter} className="self-start">
                    Submit Counter
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

export default ContractorApplicationsPage;
