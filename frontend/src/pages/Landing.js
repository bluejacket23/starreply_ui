import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Landing() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('services');
  const [openFaq, setOpenFaq] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const servicesRef = useRef(null);
  const benefitsRef = useRef(null);
  const howItWorksRef = useRef(null);
  const pricingRef = useRef(null);
  const faqRef = useRef(null);

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
    handleScroll(); // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">StarReply</h1>
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => { scrollToSection(servicesRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'services' 
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Services
              </button>
              <button
                onClick={() => { scrollToSection(benefitsRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'benefits' 
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => { scrollToSection(howItWorksRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'how-it-works' 
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                How It Works
              </button>
              <button
                onClick={() => { scrollToSection(pricingRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'pricing' 
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => { scrollToSection(faqRef); setMobileMenuOpen(false); }}
                className={`transition ${
                  activeSection === 'faq' 
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                FAQ
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="hidden sm:block px-4 py-2 text-gray-600 hover:text-indigo-600 transition"
              >
                Sign In
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-indigo-600"
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
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3 pt-4">
                <button
                  onClick={() => { scrollToSection(servicesRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'services' 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => { scrollToSection(benefitsRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'benefits' 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => { scrollToSection(howItWorksRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'how-it-works' 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  How It Works
                </button>
                <button
                  onClick={() => { scrollToSection(pricingRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'pricing' 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  Pricing
                </button>
                <button
                  onClick={() => { scrollToSection(faqRef); setMobileMenuOpen(false); }}
                  className={`text-left px-2 py-2 transition ${
                    activeSection === 'faq' 
                      ? 'text-indigo-600 font-semibold' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                >
                  FAQ
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="text-left px-2 py-2 text-gray-600 hover:text-indigo-600 transition"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={servicesRef} className="pt-24 pb-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Turn every review into a 5-star interaction - Without lifting a finger.
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect your Google Business account, set your tone, and our AI crafts personalized, on-brand replies to every review - immediately.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 text-lg"
                >
                  {loading ? 'Processing...' : 'Start Free Trial'}
                </button>
                <button
                  onClick={() => scrollToSection(howItWorksRef)}
                  className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition text-lg"
                >
                  See how it works
                </button>
              </div>
            </div>
            {/* Right Video Placeholder */}
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">How It Works Video</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center">
            <div>
              <div className="text-3xl font-bold">4.2hr</div>
              <div className="text-indigo-200">saved per month</div>
            </div>
            <div className="hidden md:block">|</div>
            <div>
              <div className="text-3xl font-bold">+0.3⭐</div>
              <div className="text-indigo-200">average rating</div>
            </div>
            <div className="hidden md:block">|</div>
            <div>
              <div className="text-3xl font-bold">89%</div>
              <div className="text-indigo-200">more consumer trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Why StarReply?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Save Hours Every Week</h3>
              <p className="text-gray-600 leading-relaxed">
                Spend less time replying, more time running your business. The average small business gets 20-50 Google reviews per month. Replying manually takes ~3-5 minutes per review - that's up to 4 hours a month saved with automated, personalized replies.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Boost Local SEO & Visibility</h3>
              <p className="text-gray-600 leading-relaxed">
                More replies = higher search rankings. Google explicitly states that responding to reviews improves local search visibility. Businesses that respond to 100% of reviews are 1.7x more likely to appear in the Local Pack (top 3 results).* Source: Moz Local Search Ranking Factors 2024
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Build Trust and Loyalty</h3>
              <p className="text-gray-600 leading-relaxed">
                Customers feel heard - instantly. 89% of consumers read business responses before choosing where to spend their money. Fast, thoughtful replies can increase repeat visits by 33% and reduce negative review frequency.* Source: ReviewTrackers, 2023
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Keep Your Brand Voice Consistent</h3>
              <p className="text-gray-600 leading-relaxed">
                Set your tone once, and our AI does the rest. Whether your brand is friendly, professional, or playful - every reply sounds natural and on-brand, ensuring consistent messaging across all locations or staff.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Improve Reputation and Conversion</h3>
              <p className="text-gray-600 leading-relaxed">
                Higher review response rates = more revenue. Responding to reviews leads to an average rating increase of 0.3 stars over time, and a 12% higher conversion rate for local service businesses.* Harvard Business Review "Responding to Online Reviews Boosts Ratings, 2022
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section ref={howItWorksRef} className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Google Account</h3>
              <p className="text-gray-600 leading-relaxed">
                Securely sign in with your Google Business profile. We pull in your existing reviews automatically - no setup headaches, no copy-pasting.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Set Your Brand Voice and Preferences</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose your tone - friendly, professional, playful, or custom.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Let AI Handle the Replies</h3>
              <p className="text-gray-600 leading-relaxed">
                Sit back while our AI crafts and posts thoughtful responses to every new review - within minutes.
              </p>
            </div>
          </div>
          <p className="text-center text-xl text-gray-700 font-semibold">
            In just 2 minutes, your Google Reviews are handled - forever.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section ref={pricingRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Pricing</h2>
          <div className="max-w-md mx-auto bg-white border-2 border-indigo-200 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-indigo-600 mb-2">$7</div>
              <div className="text-gray-600 text-lg">per month</div>
              <div className="text-xl font-semibold text-gray-900 mt-4">Starter Plan</div>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">AI auto-replies to all your Google reviews</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Custom tone settings (friendly, professional, witty, etc.)</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Dashboard to view and edit replies</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Secure Google Business integration</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Cancel anytime - no contracts</span>
              </li>
            </ul>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <p className="text-green-800 font-semibold">Free 7-day trial</p>
              <p className="text-green-700 text-sm mt-1">Try it risk-free. No credit card required.</p>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Start Free Trial'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-indigo-600 flex-shrink-0 transition-transform ${
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
                  <div className="px-6 py-4 text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to turn every review into a 5-star interaction?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start your free 7-day trial today. No credit card required.
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white mb-4 text-lg"
            />
            <button
              onClick={handleGetStarted}
              disabled={loading}
              className="w-full bg-white text-indigo-600 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50 text-lg"
            >
              {loading ? 'Processing...' : 'Start Free Trial'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 StarReply. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
