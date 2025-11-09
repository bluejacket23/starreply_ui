import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Dashboard() {
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [tone, setTone] = useState('Friendly');
  const [updatingTone, setUpdatingTone] = useState(false);

  useEffect(() => {
    // Get userId from URL params or localStorage (in production, use proper auth)
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    // Get or create userId
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'user-' + Date.now();
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    if (success) {
      alert('Subscription successful! Welcome to ReviewSaaS.');
    } else if (canceled) {
      alert('Subscription was canceled.');
    }

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINT}/userStats`, {
        params: { userId },
      });
      setStats(response.data);
      if (response.data.user?.tone) {
        setTone(response.data.user.tone);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      // First, get auth URL
      const response = await axios.post(`${API_ENDPOINT}/connect-google`, {
        userId,
        email: localStorage.getItem('email') || 'user@example.com',
      });

      // Redirect to Google OAuth
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error connecting Google:', error);
      alert('Error connecting Google account. Please try again.');
      setConnectingGoogle(false);
    }
  };

  const handleUpdateTone = async (newTone) => {
    setUpdatingTone(true);
    try {
      await axios.post(`${API_ENDPOINT}/update-tone`, {
        userId,
        tone: newTone,
      });
      setTone(newTone);
      alert('Tone updated successfully!');
    } catch (error) {
      console.error('Error updating tone:', error);
      alert('Error updating tone. Please try again.');
    } finally {
      setUpdatingTone(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">ReviewSaaS Dashboard</h1>
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-indigo-600">{stats.stats?.totalReviews || 0}</div>
              <div className="text-gray-600 mt-1">Total Reviews</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-green-600">{stats.stats?.postedReplies || 0}</div>
              <div className="text-gray-600 mt-1">Replies Posted</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-blue-600">{stats.stats?.responseRate || 0}%</div>
              <div className="text-gray-600 mt-1">Response Rate</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.stats?.avgRating || 0} ⭐</div>
              <div className="text-gray-600 mt-1">Avg Rating</div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Google Connection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Google Business Profile</h2>
            {stats?.user?.hasGoogleConnected ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-600">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Connected</span>
                </div>
                <p className="text-gray-600">Your Google Business Profile is connected and ready to process reviews.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your Google Business Profile to start automatically replying to reviews.
                </p>
                <button
                  onClick={handleConnectGoogle}
                  disabled={connectingGoogle}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {connectingGoogle ? 'Connecting...' : 'Connect Google Account'}
                </button>
              </div>
            )}
          </div>

          {/* Tone Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Reply Tone</h2>
            <p className="text-gray-600 mb-4">
              Choose the tone for AI-generated replies to your reviews.
            </p>
            <div className="space-y-2">
              {['Friendly', 'Professional', 'Casual', 'Formal', 'Enthusiastic'].map((toneOption) => (
                <button
                  key={toneOption}
                  onClick={() => handleUpdateTone(toneOption)}
                  disabled={updatingTone || tone === toneOption}
                  className={`w-full py-2 px-4 rounded-lg border-2 transition ${
                    tone === toneOption
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold'
                      : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                  } disabled:opacity-50`}
                >
                  {toneOption}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Reviews */}
        {stats?.recentReviews && stats.recentReviews.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Reviews</h2>
            <div className="space-y-4">
              {stats.recentReviews.map((review) => (
                <div key={review.reviewId} className="border-l-4 border-indigo-600 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-500 font-semibold mr-2">
                        {'⭐'.repeat(review.rating || 0)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.posted ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ✓ Replied
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{review.reviewText}</p>
                  {review.generatedReply && (
                    <div className="bg-indigo-50 p-3 rounded mt-2">
                      <p className="text-sm text-indigo-800">
                        <strong>Reply:</strong> {review.generatedReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

