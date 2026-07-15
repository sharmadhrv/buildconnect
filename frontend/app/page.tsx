import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-brand-cream text-brand-slate">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 h-[60px] flex items-center justify-between px-6 bg-white/95 backdrop-blur-md border-b border-brand-border">
        <div className="flex items-center gap-2">
          <div className="w-[26px] h-[26px] bg-brand-orange rounded-md flex items-center justify-center text-white font-syne font-extrabold text-sm">
            B
          </div>
          <span className="font-syne font-extrabold text-lg text-brand-slate tracking-tight">
            Build<span className="text-brand-orange">Connect</span>
          </span>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold px-4 py-2 rounded-lg text-brand-slate-light hover:bg-brand-slate-pale transition-all duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-xs font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-brand-slate text-white px-8 py-20 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-1.5 bg-brand-orange-light/10 text-brand-orange-light border border-brand-orange/30 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-6">
            🏗️ India's #1 Construction & Property Platform
          </div>
          <h1 className="font-syne font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight mb-6">
            Build. Connect.<br />
            <span className="text-brand-orange-light">Buy. Sell.</span><br />
            Smarter.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
            AI-matched contractors, verified real estate listings, end-to-end project management — and instant multi-channel contact via WhatsApp, Email & Call.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-medium text-sm px-6 py-3 rounded-lg transition-all duration-200 shadow-lg shadow-brand-orange/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Post a Project
            </Link>
            <Link
              href="/login"
              className="border border-white/30 hover:border-white/60 bg-white/5 hover:bg-white/10 text-white font-medium text-sm px-6 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Browse Bids
            </Link>
          </div>
        </div>

        {/* Hero Visual Statistics */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
            <div className="font-syne font-extrabold text-3xl text-brand-orange-light">4,800+</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Projects Completed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
            <div className="font-syne font-extrabold text-3xl text-brand-orange-light">2,100+</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Verified Contractors</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
            <div className="font-syne font-extrabold text-3xl text-brand-orange-light">1,240+</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Properties Listed</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
            <div className="font-syne font-extrabold text-3xl text-brand-orange-light">91.4%</div>
            <div className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">AI Match Accuracy</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-8 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-block bg-brand-orange-pale text-brand-orange border border-brand-orange/20 px-3.5 py-1.5 rounded-full text-2s font-bold tracking-wider uppercase mb-3">
            Our Services
          </div>
          <h2 className="font-syne font-extrabold text-3xl text-brand-slate mb-3">
            Everything Construction & Property
          </h2>
          <p className="text-brand-slate-light text-sm max-w-lg mx-auto">
            From AI contractor matching to verified real estate listings — all in one platform
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-brand-border p-6 rounded-2xl transition-all duration-250 hover:border-brand-orange hover:shadow-xl hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-pale flex items-center justify-center text-brand-orange mb-4 font-bold text-sm">
              01
            </div>
            <h3 className="font-syne font-bold text-base text-brand-slate mb-2">Bidding & Quotations</h3>
            <p className="text-xs text-brand-slate-light leading-relaxed">
              Submit, counter, and track project bids and contract budgets in real-time.
            </p>
          </div>

          <div className="bg-white border border-brand-border p-6 rounded-2xl transition-all duration-250 hover:border-brand-orange hover:shadow-xl hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-pale flex items-center justify-center text-brand-orange mb-4 font-bold text-sm">
              02
            </div>
            <h3 className="font-syne font-bold text-base text-brand-slate mb-2">Compliance Tracking</h3>
            <p className="text-xs text-brand-slate-light leading-relaxed">
              Verify builders and contractors with automated document flows and credential checks.
            </p>
          </div>

          <div className="bg-white border border-brand-border p-6 rounded-2xl transition-all duration-250 hover:border-brand-orange hover:shadow-xl hover:-translate-y-1">
            <div className="w-10 h-10 rounded-xl bg-brand-orange-pale flex items-center justify-center text-brand-orange mb-4 font-bold text-sm">
              03
            </div>
            <h3 className="font-syne font-bold text-base text-brand-slate mb-2">Reviews & Trust</h3>
            <p className="text-xs text-brand-slate-light leading-relaxed">
              Build partner reputability with multi-metric rating breakdowns and verified feedback.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-brand-slate text-slate-400 text-xs py-8 px-6 border-t border-white/5 text-center">
        <div>© 2026 BuildConnect Technologies Pvt. Ltd. Made with ❤️ in India</div>
      </footer>
    </div>
  );
}