import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Landing() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('services');
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visibleElements, setVisibleElements] = useState(new Set());

  const servicesRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const pricingRef = useRef(null);
  const faqRef = useRef(null);

  // Scroll-based section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      const sections = [
        { ref: faqRef, id: 'faq' },
        { ref: pricingRef, id: 'pricing' },
        { ref: howItWorksRef, id: 'how-it-works' },
        { ref: benefitsRef, id: 'benefits' },
        { ref: servicesRef, id: 'services' }
      ];

      for (const section of sections) {
        if (section.ref.current && scrollPosition >= section.ref.current.offsetTop) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for fade-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGetStarted = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const userId = email.split('@')[0] + '-' + Date.now();

      const response = await axios.post(`${API_ENDPOINT}/create-checkout-session`, {
        userId,
        email,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout session. Please try again.');
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: "Is it safe to connect my Google Business account?",
      answer: "Yes - we use Google's official OAuth authentication, the same secure method used by major apps. We never see or store your password, and you can revoke access anytime directly from your Google Account settings."
    },
    {
      question: "Will the AI post replies automatically?",
      answer: "You can choose between manual review mode (you approve each reply) or auto-reply mode (the AI posts instantly). Most users start in manual mode, then switch to auto once they trust the tone."
    },
    {
      question: "What kind of replies does the AI write?",
      answer: "Replies are professional, friendly, and customizable to your business tone. You can set your personality (e.g., \"warm and conversational\" or \"formal and concise\") and add your own keywords or phrases."
    },
    {
      question: "Can I try it before paying?",
      answer: "Absolutely! You get a free 7-day free trial - no credit card required. Connect your Google Account, generate real replies, and decide if it's right for you."
    },
    {
      question: "Does replying really help my Google Ranking?",
      answer: "Yes - Google confirms that responding to reviews helps local SEO. Businesses that consistently reply see 1.7x more visibility in the Local Pack and average rating increases of 0.3 stars over time."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes. There are no contracts or hidden fees. You can cancel from your dashboard with one click - and you'll keep access until your billing cycle ends."
    },
    {
      question: "Will it support Facebook or Yelp?",
      answer: "Coming soon! We are working on connecting Facebook and Yelp accounts so you can manage all your reviews automatically in one place."
    },
    {
      question: "What if the AI makes a mistake in a reply?",
      answer: "You can edit any reply before it's posted. In manual mode, nothing goes live without your approval."
    },
    {
      question: "How long does it take for my AI replies to appear?",
      answer: "Replies are typically posted within the hour after a new review comes in. We designed it this way so your responses feel authentic and thoughtfully timed, rather than robotic or instantaneous. This natural delay helps your business look more genuine while still keeping your review management fully automated."
    }
  ];

  const benefits = [
    {
      icon: '⏱️',
      title: 'Save Hours Every Week',
      description: 'Spend less time replying, more time running your business. The average small business gets 20-50 Google reviews per month. Replying manually takes ~3-5 minutes per review - that\'s up to 4 hours a month saved with automated, personalized replies.'
    },
    {
      icon: '🚀',
      title: 'Boost Local SEO & Visibility',
      description: 'More replies = higher search rankings. Google explicitly states that responding to reviews improves local search visibility. Businesses that respond to 100% of reviews are 1.7x more likely to appear in the Local Pack (top 3 results).* Source: Moz Local Search Ranking Factors 2024'
    },
    {
      icon: '💎',
      title: 'Build Trust and Loyalty',
      description: 'Customers feel heard - instantly. 89% of consumers read business responses before choosing where to spend their money. Fast, thoughtful replies can increase repeat visits by 33% and reduce negative review frequency.* Source: ReviewTrackers, 2023'
    },
    {
      icon: '🎯',
      title: 'Keep Your Brand Voice Consistent',
      description: 'Set your tone once, and our AI does the rest. Whether your brand is friendly, professional, or playful - every reply sounds natural and on-brand, ensuring consistent messaging across all locations or staff.'
    },
    {
      icon: '⭐',
      title: 'Improve Reputation and Conversion',
      description: 'Higher review response rates = more revenue. Responding to reviews leads to an average rating increase of 0.3 stars over time, and a 12% higher conversion rate for local service businesses.* Harvard Business Review "Responding to Online Reviews Boosts Ratings, 2022'
    }
  ];

  const howItWorksSteps = [
    {
      icon: '🔗',
      number: '1',
      title: 'Connect Your Google Account',
      description: 'Securely sign in with your Google Business profile. We pull in your existing reviews automatically - no setup headaches, no copy-pasting.'
    },
    {
      icon: '🎨',
      number: '2',
      title: 'Set Your Brand Voice and Preferences',
      description: 'Choose your tone - friendly, professional, playful, or custom.'
    },
    {
      icon: '🤖',
      number: '3',
      title: 'Let AI Handle the Replies',
      description: 'Sit back while our AI crafts and posts thoughtful responses to every new review - within minutes.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Star Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                            radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
                            radial-gradient(1px 1px at 50% 50%, white, transparent),
                            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6), transparent),
                            radial-gradient(2px 2px at 90% 40%, white, transparent),
                            radial-gradient(1px 1px at 33% 60%, rgba(255,255,255,0.7), transparent),
                            radial-gradient(2px 2px at 10% 80%, white, transparent)`,
          backgroundSize: '200% 200%',
          animation: 'twinkle 20s linear infinite'
        }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-wider" style={{ letterSpacing: '0.1em' }}>StarReply</h1>
            {/* Desktop Menu - moved more to the right */}
            <div className="hidden lg:flex items-center space-x-8 ml-auto mr-8">
              <button
                onClick={() => { scrollToSection(servicesRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'services' 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => { scrollToSection(benefitsRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'benefits' 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => { scrollToSection(howItWorksRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'how-it-works' 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => { scrollToSection(pricingRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'pricing' 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => { scrollToSection(faqRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'faq' 
                    ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' 
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
              >
                FAQ
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="hidden sm:block px-4 py-2 text-slate-300 hover:text-cyan-400 transition"
              >
                Sign In
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-slate-300 hover:text-cyan-400"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-slate-700">
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={() => { scrollToSection(servicesRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'services' 
                      ? 'text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => { scrollToSection(benefitsRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'benefits' 
                      ? 'text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => { scrollToSection(howItWorksRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'how-it-works' 
                      ? 'text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => { scrollToSection(pricingRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'pricing' 
                      ? 'text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => { scrollToSection(faqRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'faq' 
                      ? 'text-cyan-400 font-semibold' 
                      : 'text-slate-300 hover:text-cyan-400'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-left px-2 py-2 text-slate-300 hover:text-cyan-400 transition"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={servicesRef} className="pt-24 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div 
              data-animate
              id="hero-content"
              className={`transition-all duration-1000 overflow-visible ${
                visibleElements.has('hero-content') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent pb-3 overflow-visible" style={{ letterSpacing: '0.02em', lineHeight: '1.4' }}>
                Turn every review into a 5-star interaction - Without lifting a finger.
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Connect your Google Business account, set your tone, and our AI crafts personalized, on-brand replies to every review - immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 text-lg shadow-lg shadow-cyan-500/50"
                >
                  {loading ? 'Processing...' : 'Start Free Trial'}
                </button>
                <button
                  onClick={() => scrollToSection(howItWorksRef)}
                  className="bg-slate-800/50 text-cyan-400 border-2 border-cyan-400/50 px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 hover:border-cyan-400 transition text-lg backdrop-blur-sm"
                >
                  See how it works
                </button>
              </div>
            </div>
            {/* Right Video Placeholder */}
            <div 
              data-animate
              id="hero-video"
              className={`bg-slate-800/50 backdrop-blur-sm rounded-lg aspect-video flex items-center justify-center border border-slate-700/50 transition-all duration-1000 ${
                visibleElements.has('hero-video') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="text-center">
                <svg className="w-24 h-24 text-cyan-400/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-400 text-lg">How It Works Video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-cyan-600/20 border-y border-slate-700/50 py-8 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl font-bold text-cyan-400">4.2hr</div>
              <div className="text-slate-400">saved per month</div>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">+0.3⭐</div>
              <div className="text-slate-400">average rating</div>
            </div>
            <div className="hidden md:block text-slate-600">|</div>
            <div>
              <div className="text-3xl font-bold text-cyan-400">89%</div>
              <div className="text-slate-400">more consumer trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 
            data-animate
            id="benefits-title"
            className={`text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent transition-all duration-1000 ${
              visibleElements.has('benefits-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            Why StarReply?
          </h2>
          {/* Top 3 Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {benefits.slice(0, 3).map((benefit, index) => (
              <div
                key={index}
                data-animate
                id={`benefit-${index}`}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-700 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  visibleElements.has(`benefit-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
          {/* Bottom 2 Benefits - Centered */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {benefits.slice(3, 5).map((benefit, index) => (
              <div
                key={index + 3}
                data-animate
                id={`benefit-${index + 3}`}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-700 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  visibleElements.has(`benefit-${index + 3}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${(index + 3) * 100}ms` }}
              >
                <div className="text-5xl mb-4">{benefit.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-slate-300 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 bg-slate-800/30 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4">
          <h2 
            data-animate
            id="how-it-works-title"
            className={`text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent transition-all duration-1000 ${
              visibleElements.has('how-it-works-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {howItWorksSteps.map((step, index) => (
              <div
                key={index}
                data-animate
                id={`step-${index}`}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700/50 text-center hover:border-cyan-400/50 transition-all duration-700 hover:shadow-lg hover:shadow-cyan-500/20 ${
                  visibleElements.has(`step-${index}`) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-5xl mb-4">{step.icon}</div>
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-400/30">
                  <span className="text-2xl font-bold text-cyan-400">{step.number}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
          <p 
            data-animate
            id="how-it-works-footer"
            className={`text-center text-xl text-cyan-300 font-semibold transition-all duration-1000 ${
              visibleElements.has('how-it-works-footer') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            In just 2 minutes, your Google Reviews are handled - forever.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <h2 
            data-animate
            id="pricing-title"
            className={`text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent transition-all duration-1000 ${
              visibleElements.has('pricing-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            Pricing
          </h2>
          <div 
            data-animate
            id="pricing-card"
            className={`max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm border-2 border-cyan-400/30 rounded-lg shadow-xl p-8 hover:border-cyan-400/50 transition-all duration-1000 ${
              visibleElements.has('pricing-card') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <div className="text-center mb-8">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">$7</div>
              <div className="text-slate-400 text-lg">per month</div>
              <div className="text-xl font-semibold text-white mt-4">Starter Plan</div>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                'AI auto-replies to all your Google reviews',
                'Custom tone settings (friendly, professional, witty, etc.)',
                'Dashboard to view and edit replies',
                'Secure Google Business integration',
                'Cancel anytime - no contracts'
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-6 h-6 text-cyan-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-300">{feature}</span>
                </li>
              ))}
            </ul>
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4 mb-6 text-center">
              <p className="text-cyan-300 font-semibold">Free 7-day trial</p>
              <p className="text-slate-400 text-sm mt-1">Try it risk-free. No credit card required.</p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
              />
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 shadow-lg shadow-cyan-500/50"
              >
                {loading ? 'Processing...' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-20 bg-slate-800/30 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 
            data-animate
            id="faq-title"
            className={`text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent transition-all duration-1000 ${
              visibleElements.has('faq-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                data-animate
                id={`faq-${index}`}
                className={`bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden transition-all duration-700 ${
                  visibleElements.has(`faq-${index}`) ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-800/50 transition"
                >
                  <span className="font-semibold text-white pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-cyan-400 flex-shrink-0 transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 text-slate-300 leading-relaxed border-t border-slate-700/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-cyan-600/20 via-purple-600/20 to-cyan-600/20 border-t border-slate-700/50 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <h2 
            data-animate
            id="cta-title"
            className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-300 bg-clip-text text-transparent transition-all duration-1000 ${
              visibleElements.has('cta-title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ letterSpacing: '0.02em' }}
          >
            Ready to turn every review into a 5-star interaction?
          </h2>
          <p 
            data-animate
            id="cta-subtitle"
            className={`text-xl text-slate-300 mb-8 max-w-2xl mx-auto transition-all duration-1000 ${
              visibleElements.has('cta-subtitle') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Start your free 7-day trial today. No credit card required.
          </p>
          <div 
            data-animate
            id="cta-form"
            className={`max-w-md mx-auto transition-all duration-1000 ${
              visibleElements.has('cta-form') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500 mb-4 text-lg"
            />
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 text-lg shadow-lg shadow-cyan-500/50"
            >
              {loading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 text-slate-400 py-8 relative z-10">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 StarReply. All rights reserved.</p>
        </div>
      </footer>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default Landing;
