import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function Dashboard() {
  const [userId, setUserId] = useState('');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [updatingTone, setUpdatingTone] = useState(false);
  
  // Tone sliders (1-5 scale with decimal precision)
  const [casualProfessional, setCasualProfessional] = useState(3.0);
  const [conciseFriendly, setConciseFriendly] = useState(3.0);
  const [humbleConfident, setHumbleConfident] = useState(3.0);
  const [shortDetailed, setShortDetailed] = useState(3.0);
  const [calmExcited, setCalmExcited] = useState(3.0);
  
  // Negative review settings
  const [empatheticNeutral, setEmpatheticNeutral] = useState(3.0);
  const [supportEmail, setSupportEmail] = useState('');
  const [includeSupportEmail, setIncludeSupportEmail] = useState(false);

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
      // Load saved tone settings if available
      if (response.data.user?.toneSettings) {
        const settings = response.data.user.toneSettings;
        setCasualProfessional(settings.casualProfessional || 3.0);
        setConciseFriendly(settings.conciseFriendly || 3.0);
        setHumbleConfident(settings.humbleConfident || 3.0);
        setShortDetailed(settings.shortDetailed || 3.0);
        setCalmExcited(settings.calmExcited || 3.0);
        setEmpatheticNeutral(settings.empatheticNeutral || 3.0);
        setSupportEmail(settings.supportEmail || '');
        setIncludeSupportEmail(settings.includeSupportEmail || false);
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

  const handleSaveToneSettings = async () => {
    setUpdatingTone(true);
    try {
      await axios.post(`${API_ENDPOINT}/update-tone-settings`, {
        userId,
        toneSettings: {
          casualProfessional,
          conciseFriendly,
          humbleConfident,
          shortDetailed,
          calmExcited,
          empatheticNeutral,
          supportEmail,
          includeSupportEmail,
        },
      });
      alert('Tone settings saved successfully!');
    } catch (error) {
      console.error('Error updating tone settings:', error);
      alert('Error saving tone settings. Please try again.');
    } finally {
      setUpdatingTone(false);
    }
  };

  const Slider = ({ label, leftLabel, rightLabel, value, onChange, min = 1, max = 5, step = 0.01 }) => {
    const sliderRef = useRef(null);
    const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    
    const handleChange = (e) => {
      const newValue = parseFloat(e.target.value);
      const clampedValue = Math.max(min, Math.min(max, newValue));
      onChange(clampedValue);
    };
    
    // Use native input event for continuous updates during drag
    useEffect(() => {
      const slider = sliderRef.current;
      if (!slider) return;
      
      const handleInput = (e) => {
        const newValue = parseFloat(e.target.value);
        const clampedValue = Math.max(min, Math.min(max, newValue));
        onChange(clampedValue);
      };
      
      // Add native input event listener for smooth dragging
      slider.addEventListener('input', handleInput);
      
      return () => {
        slider.removeEventListener('input', handleInput);
      };
    }, [min, max, onChange]);
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <span className="text-xs text-cyan-400 font-semibold bg-slate-900/50 px-2 py-1 rounded">
            {value.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400 w-20 text-right">{leftLabel}</span>
          <div className="flex-1 relative">
            <input
              ref={sliderRef}
              type="range"
              min={min}
              max={max}
              step={step}
              value={value}
              onChange={handleChange}
              className="slider-input w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{ '--slider-progress': `${percentage}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 w-20">{rightLabel}</span>
        </div>
      </div>
    );
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
        {/* Stats Cards */}
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

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Google Connection */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50">
            <h2 className="text-xl font-semibold mb-4 text-white">Google Business Profile</h2>
            {stats?.user?.hasGoogleConnected ? (
              <div className="space-y-4">
                <div className="flex items-center text-green-400">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-semibold">Connected</span>
                </div>
                <p className="text-slate-300">Your Google Business Profile is connected and ready to process reviews.</p>
              </div>
            ) : (
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
            )}
          </div>
        </div>

        {/* Tone Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-white">Reply Tone Settings</h2>
          <p className="text-slate-300 mb-6">
            Adjust the tone of AI-generated replies using the sliders below. Each slider ranges from 1 to 5.
          </p>
          
          <div className="space-y-6 mb-6">
            <Slider
              label="Casual to Professional"
              leftLabel="Casual"
              rightLabel="Professional"
              value={casualProfessional}
              onChange={setCasualProfessional}
            />
            <Slider
              label="Concise to Friendly"
              leftLabel="Concise"
              rightLabel="Friendly"
              value={conciseFriendly}
              onChange={setConciseFriendly}
            />
            <Slider
              label="Humble to Confident"
              leftLabel="Humble"
              rightLabel="Confident"
              value={humbleConfident}
              onChange={setHumbleConfident}
            />
            <Slider
              label="Short to Detailed"
              leftLabel="Short"
              rightLabel="Detailed"
              value={shortDetailed}
              onChange={setShortDetailed}
            />
            <Slider
              label="Calm to Excited"
              leftLabel="Calm"
              rightLabel="Excited"
              value={calmExcited}
              onChange={setCalmExcited}
            />
          </div>

          <button
            onClick={handleSaveToneSettings}
            disabled={updatingTone}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 shadow-lg shadow-cyan-500/50 font-semibold"
          >
            {updatingTone ? 'Saving...' : 'Save Tone Settings'}
          </button>
        </div>

        {/* Negative Review Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-white">Negative Review Settings</h2>
          
          <div className="space-y-6 mb-6">
            <Slider
              label="Empathetic to Neutral"
              leftLabel="Empathetic"
              rightLabel="Neutral"
              value={empatheticNeutral}
              onChange={setEmpatheticNeutral}
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Support Email</label>
              <input
                type="email"
                placeholder="support@yourbusiness.com"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-slate-500"
              />
              <p className="text-xs text-slate-400">Enter an email address to include in negative review replies</p>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="includeSupportEmail"
                checked={includeSupportEmail}
                onChange={(e) => setIncludeSupportEmail(e.target.checked)}
                className="w-5 h-5 rounded border-slate-700 bg-slate-900/50 text-cyan-500 focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="includeSupportEmail" className="text-sm text-slate-300 cursor-pointer">
                Include support email in negative review replies
              </label>
            </div>
          </div>

          <button
            onClick={handleSaveToneSettings}
            disabled={updatingTone}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition disabled:opacity-50 shadow-lg shadow-cyan-500/50 font-semibold"
          >
            {updatingTone ? 'Saving...' : 'Save Negative Review Settings'}
          </button>
        </div>

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
        .slider-input {
          background: linear-gradient(to right, rgb(6, 182, 212) 0%, rgb(6, 182, 212) var(--slider-progress, 50%), rgb(51, 65, 85) var(--slider-progress, 50%), rgb(51, 65, 85) 100%);
          -webkit-appearance: none;
          appearance: none;
          outline: none;
        }
        .slider-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          cursor: grab;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.3);
          border: 2px solid rgb(8, 145, 178);
          transition: transform 0.1s ease;
          pointer-events: auto;
        }
        .slider-input::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        .slider-input::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(6, 182, 212);
          cursor: grab;
          border: 2px solid rgb(8, 145, 178);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.6), 0 0 20px rgba(6, 182, 212, 0.3);
          transition: transform 0.1s ease;
          pointer-events: auto;
        }
        .slider-input::-moz-range-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        .slider-input::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .slider-input::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: transparent;
          cursor: pointer;
        }
        .slider-input:focus {
          outline: none;
        }
        .slider-input:focus::-webkit-slider-thumb {
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.8), 0 0 25px rgba(6, 182, 212, 0.4);
        }
        .slider-input:focus::-moz-range-thumb {
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.8), 0 0 25px rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
