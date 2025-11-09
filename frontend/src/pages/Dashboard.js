import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState(new Set());

  // Dummy business locations for now
  const [businessLocations, setBusinessLocations] = useState([
    {
      id: 'dummy-1',
      name: 'Downtown Coffee Shop',
      address: '123 Main St, City, State 12345',
      autoReplyActive: false,
      totalReviews: 0,
      avgRating: 0,
    }
  ]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');

    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = 'user-' + Date.now();
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);

    if (success) {
      alert('Subscription successful! Welcome to StarReply.');
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
      // TODO: Load business locations from API
      // if (response.data.locations) {
      //   setBusinessLocations(response.data.locations);
      // }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Continue with dummy data on error
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const response = await axios.post(`${API_ENDPOINT}/connect-google`, {
        userId,
        email: localStorage.getItem('email') || 'user@example.com',
      });
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Error connecting Google:', error);
      alert('Error connecting Google account. Please try again.');
      setConnectingGoogle(false);
    }
  };

  const toggleLocationExpanded = (locationId) => {
    setExpandedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  const toggleAutoReply = (locationId) => {
    setBusinessLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, autoReplyActive: !loc.autoReplyActive }
        : loc
    ));
    // TODO: Save to API
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Star Background Effect */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                              radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
                              radial-gradient(1px 1px at 50% 50%, white, transparent)`,
            backgroundSize: '200% 200%',
            animation: 'twinkle 20s linear infinite'
          }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading...</p>
        </div>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
        `}</style>
      </div>
    );
  }

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

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 relative z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white tracking-wider" style={{ letterSpacing: '0.1em' }}>StarReply</h1>
            <button
              onClick={() => window.location.href = '/'}
              className="text-slate-300 hover:text-cyan-400 transition"
            >
              Home
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Google Connection Status */}
        {!stats?.user?.hasGoogleConnected && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-white">Google Business Profile</h2>
            <div className="space-y-4">
              <p className="text-slate-300">
                Connect your Google Business Profile to start automatically replying to reviews.
              </p>
              <button
                onClick={handleConnectGoogle}
                disabled={connectingGoogle}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 shadow-lg shadow-cyan-500/50"
              >
                {connectingGoogle ? 'Connecting...' : 'Connect Google Account'}
              </button>
            </div>
          </div>
        )}

        {/* Business Locations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Business Locations</h2>
          <div className="space-y-4">
            {businessLocations.map((location) => (
              <div
                key={location.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/50 overflow-hidden hover:border-cyan-400/50 transition-all"
              >
                {/* Location Header - Always Visible */}
                <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => toggleLocationExpanded(location.id)}>
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedLocations.has(location.id) ? 'transform rotate-90' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">{location.name}</h3>
                      <p className="text-sm text-slate-400 truncate">{location.address}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {/* Auto Reply Status */}
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          location.autoReplyActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {location.autoReplyActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {/* Toggle Switch */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAutoReply(location.id);
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          location.autoReplyActive ? 'bg-cyan-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            location.autoReplyActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedLocations.has(location.id) && (
                  <div className="px-4 pb-4 border-t border-slate-700/50 pt-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Total Reviews</div>
                        <div className="text-xl font-bold text-cyan-400">{location.totalReviews}</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Avg Rating</div>
                        <div className="text-xl font-bold text-yellow-400">{location.avgRating.toFixed(1)} ⭐</div>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <div className="text-sm text-slate-400">Response Rate</div>
                        <div className="text-xl font-bold text-green-400">0%</div>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/tone-settings/${location.id}`)}
                      className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition shadow-lg shadow-cyan-500/50 font-semibold"
                    >
                      Configure Tone Settings
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Cards - Overall */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{stats.stats?.totalReviews || 0}</div>
              <div className="text-slate-400 mt-1">Total Reviews</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
              <div className="text-2xl font-bold text-green-400">{stats.stats?.postedReplies || 0}</div>
              <div className="text-slate-400 mt-1">Replies Posted</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
              <div className="text-2xl font-bold text-cyan-400">{stats.stats?.responseRate || 0}%</div>
              <div className="text-slate-400 mt-1">Response Rate</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
              <div className="text-2xl font-bold text-yellow-400">{stats.stats?.avgRating || 0} ⭐</div>
              <div className="text-slate-400 mt-1">Avg Rating</div>
            </div>
          </div>
        )}

        {/* Recent Reviews */}
        {stats?.recentReviews && stats.recentReviews.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Reviews</h2>
            <div className="space-y-4">
              {stats.recentReviews.map((review) => (
                <div key={review.reviewId} className="border-l-4 border-cyan-400 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400 font-semibold mr-2">
                        {'⭐'.repeat(review.rating || 0)}
                      </span>
                      <span className="text-sm text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.posted ? (
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded border border-green-500/30">
                        ✓ Replied
                      </span>
                    ) : (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 mb-2">{review.reviewText}</p>
                  {review.generatedReply && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded mt-2">
                      <p className="text-sm text-cyan-300">
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

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
