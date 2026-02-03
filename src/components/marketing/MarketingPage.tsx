'use client';

interface MarketingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function MarketingPage({ onSignIn, onSignUp }: MarketingPageProps) {
  return (
    <div className="min-h-screen bg-[#0f0f10] flex flex-col">
      {/* Navigation */}
      <header className="relative z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-xl font-bold text-white">
            TrueSignal<span className="text-violet-500">.</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSignIn}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={onSignUp}
              className="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 bg-emerald-500/10 rounded-full">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-emerald-400">Start free with 5 credits</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Find businesses that
            <br />
            <span className="text-violet-400">actually need</span> your services
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing which leads to chase. TrueSignal analyzes real business signals to find companies with weak online presence, poor SEO, and low engagement — your ideal prospects.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onSignUp}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 flex items-center justify-center gap-3"
            >
              <span>Get Started Free</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={onSignIn}
              className="w-full sm:w-auto px-8 py-4 text-lg font-medium text-zinc-300 hover:text-white transition-colors"
            >
              I have an account
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div>
              <div className="text-3xl font-bold text-white">5</div>
              <div className="text-sm text-zinc-500">Free Credits</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">20+</div>
              <div className="text-sm text-zinc-500">Leads per Search</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10+</div>
              <div className="text-sm text-zinc-500">Data Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 border-t border-zinc-800/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            How TrueSignal Works
          </h2>
          <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
            Three steps to find businesses that need your services
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Search Your Niche</h3>
              <p className="text-sm text-zinc-500">
                Enter a business type and location. We&apos;ll find all relevant businesses in that market.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analyze Signals</h3>
              <p className="text-sm text-zinc-500">
                Our Lead Intel scans each business for SEO weaknesses, poor review response, and engagement gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <span className="text-xl font-bold text-violet-400">3</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Find Opportunities</h3>
              <p className="text-sm text-zinc-500">
                Get a prioritized list of businesses most likely to need your services. Export and start outreach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            What You&apos;ll Discover
          </h2>
          <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
            Real signals that indicate a business needs help
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
                title: 'Search Visibility',
                description: "See if they're ranking for their own niche — or invisible to customers.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                ),
                title: 'Review Response Rate',
                description: 'Find businesses ignoring their reviews — a clear sign of disengagement.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Owner Activity',
                description: "Track when they last engaged. Dormant profiles mean they're not paying attention.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: 'Website Analysis',
                description: 'Detect outdated tech, missing SEO basics, and poor mobile experience.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Claim Status',
                description: 'Unclaimed profiles are businesses not managing their online presence at all.',
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                ),
                title: 'Opportunity Score',
                description: 'We rank each business by how much they need help — focus on the highest scores.',
              },
            ].map((feature, index) => (
              <div key={index} className="flex gap-4 p-4 rounded-xl bg-zinc-800/30">
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-zinc-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to find your next clients?
          </h2>
          <p className="text-zinc-500 mb-8 max-w-xl mx-auto">
            Start with 5 free credits. No credit card required.
          </p>
          <button
            onClick={onSignUp}
            className="px-8 py-4 text-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 inline-flex items-center gap-3"
          >
            <span>Create Free Account</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-600">
            © {new Date().getFullYear()} TrueSignal. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
