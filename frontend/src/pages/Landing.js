import React, { useState } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Landing() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetStarted = async () => {
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      // Generate a simple userId (in production, use proper auth)
      const userId = email.split('@')[0] + '-' + Date.now();

      const response = await axios.post(`${API_ENDPOINT}/create-checkout-session`, {
        userId,
        email,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
      });

      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error creating checkout session. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">ReviewSaaS</h1>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 text-white hover:text-indigo-200 transition"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Automatically Reply to Google Reviews
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Save time and improve your online reputation with AI-powered responses
            to every customer review.
          </p>

          {/* Pricing Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-12 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-indigo-600 mb-2">$7</div>
              <div className="text-gray-600">per month</div>
            </div>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Auto-reply to all Google reviews
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                AI-powered response generation
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Daily summary emails
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Customizable tone & style
              </li>
            </ul>
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
                {loading ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-indigo-100">
                GPT-4 generates polite, brand-safe replies automatically
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-white mb-2">Fast & Reliable</h3>
              <p className="text-indigo-100">
                Replies are posted within hours of receiving reviews
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Daily Reports</h3>
              <p className="text-indigo-100">
                Get daily summaries of your review activity and performance
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-indigo-200">
        <p>&copy; 2024 ReviewSaaS. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Landing;

