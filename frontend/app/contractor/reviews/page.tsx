'use client';

import React, { useEffect, useState } from 'react';
import axiosInstance from '@/services/api/axiosInstance';
import Badge from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

interface ReviewItem {
  review_id: string;
  rating: string;
  feedback: string;
  ratings_breakdown: any; // JSON containing quality, communication, timeliness, professionalism, safety, budget
  created_at: string;
  project_name: string;
  builder_name: string;
}

const ContractorReviewsPage = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aggregated rating states
  const [averageRating, setAverageRating] = useState(0);
  const [metrics, setMetrics] = useState({
    quality: 0,
    communication: 0,
    timeliness: 0,
    professionalism: 0,
    safety: 0
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = (await axiosInstance.get('/contractors/reviews')) as any;
        if (res.success) {
          const list = res.data as ReviewItem[];
          setReviews(list);

          if (list.length > 0) {
            // Compute averages
            let totalScore = 0;
            let mQuality = 0, mComm = 0, mTime = 0, mProf = 0, mSafe = 0;

            list.forEach(r => {
              totalScore += Number(r.rating);
              const breakdown = r.ratings_breakdown || {};
              mQuality += Number(breakdown.quality || r.rating);
              mComm += Number(breakdown.communication || r.rating);
              mTime += Number(breakdown.timeliness || r.rating);
              mProf += Number(breakdown.professionalism || r.rating);
              mSafe += Number(breakdown.safety || r.rating);
            });

            const count = list.length;
            setAverageRating(totalScore / count);
            setMetrics({
              quality: mQuality / count,
              communication: mComm / count,
              timeliness: mTime / count,
              professionalism: mProf / count,
              safety: mSafe / count
            });
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve builder reviews.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
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

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white font-sans">Ratings & Written Feedbacks</h1>
        <p className="text-slate-400 text-sm mt-1">Review builder evaluations based on work quality, timeliness, and budget compliance</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {reviews.length === 0 ? (
        <Card className="py-12 border-dashed border-slate-800">
          <CardContent className="flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-slate-900 rounded-2xl text-slate-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.97 2.88a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.88a1 1 0 00-1.176 0l-3.97 2.88c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.88c-.783-.57-.372-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Reviews Logged Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1.5 leading-relaxed">
                When you complete awarded packages and builders file site reviews, your performance scores will display here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* RATINGS METRICS SLIDERS */}
          <div className="flex flex-col gap-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Score Breakdown</CardTitle>
                <CardDescription>Average: {averageRating.toFixed(1)} / 5.0</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-xs">
                {Object.entries(metrics).map(([key, val]) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-slate-400 font-semibold uppercase tracking-wider text-[9px]">
                      <span>{key}</span>
                      <span className="text-slate-200">{val.toFixed(1)}/5</span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* WRITTEN FEEDBACK LOGS */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <h3 className="text-base font-bold text-white uppercase tracking-wider px-1">Written Feedback Logs</h3>
            <div className="flex flex-col gap-4">
              {reviews.map((rev) => (
                <Card key={rev.review_id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-200">{rev.builder_name}</CardTitle>
                        <CardDescription className="text-[10px] mt-0.5">{rev.project_name}</CardDescription>
                      </div>
                      <Badge variant="primary" size="sm">
                        ★ {Number(rev.rating).toFixed(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
                      &quot;{rev.feedback}&quot;
                    </p>
                    <div className="text-right text-[10px] text-slate-500 mt-2.5">
                      Submitted on {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorReviewsPage;
