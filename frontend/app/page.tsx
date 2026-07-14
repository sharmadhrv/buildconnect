import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-950 relative overflow-hidden">
      {/* Decorative gradient background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />

      <main className="w-full max-w-4xl z-10 flex flex-col items-center text-center px-4 sm:px-6 lg:px-8">
        {/* Logo / Brand Header */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            BuildConnect
          </span>
        </div>

        {/* Hero Copy */}
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-tight">
          Enterprise Construction <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Management Platform
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
          Seamlessly connect builders with specialized contractors. Streamline bids, project quotes, compliance documents, and communication all in one place.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 font-semibold text-white transition-all shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="flex h-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left w-full">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 font-semibold">
              01
            </div>
            <h3 className="text-base font-bold text-white mb-2">Bidding & Quotations</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Submit, counter, and track project bids and contract budgets in real-time.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4 font-semibold">
              02
            </div>
            <h3 className="text-base font-bold text-white mb-2">Compliance Tracking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Verify builders and contractors with automated document flows and credential checks.
            </p>
          </div>
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-4 font-semibold">
              03
            </div>
            <h3 className="text-base font-bold text-white mb-2">Reviews & Trust</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Build partner reputability with multi-metric rating breakdowns and verified feedback.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}