import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://your-api-id.execute-api.us-east-1.amazonaws.com/dev';

function ToneSettings() {
  const { locationId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updatingTone, setUpdatingTone] = useState(false);
  
  // Tone sliders (1-10 scale with decimal precision)
  const [casualProfessional, setCasualProfessional] = useState(5.0);
  const [conciseFriendly, setConciseFriendly] = useState(5.0);
  const [humbleConfident, setHumbleConfident] = useState(5.0);
  const [shortDetailed, setShortDetailed] = useState(5.0);
  const [calmExcited, setCalmExcited] = useState(5.0);
  
  // Negative review settings
  const [empatheticNeutral, setEmpatheticNeutral] = useState(5.0);
  const [supportEmail, setSupportEmail] = useState('');
  const [includeSupportEmail, setIncludeSupportEmail] = useState(false);

  const [locationName, setLocationName] = useState('Business Location');

  useEffect(() => {
    // Load location data and tone settings
    const loadSettings = async () => {
      try {
        // TODO: Fetch location-specific settings from API
        // For now, load from localStorage or use defaults
        const savedSettings = localStorage.getItem(`toneSettings_${locationId}`);
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setCasualProfessional(settings.casualProfessional || 5.0);
          setConciseFriendly(settings.conciseFriendly || 5.0);
          setHumbleConfident(settings.humbleConfident || 5.0);
          setShortDetailed(settings.shortDetailed || 5.0);
          setCalmExcited(settings.calmExcited || 5.0);
          setEmpatheticNeutral(settings.empatheticNeutral || 5.0);
          setSupportEmail(settings.supportEmail || '');
          setIncludeSupportEmail(settings.includeSupportEmail || false);
        }
        
        // Set location name (for dummy data)
        if (locationId === 'dummy-1') {
          setLocationName('Downtown Coffee Shop');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [locationId]);

  const handleSaveToneSettings = async () => {
    setUpdatingTone(true);
    try {
      // TODO: Save to API with locationId
      const settings = {
        casualProfessional,
        conciseFriendly,
        humbleConfident,
        shortDetailed,
        calmExcited,
        empatheticNeutral,
        supportEmail,
        includeSupportEmail,
      };
      
      // Save to localStorage for now
      localStorage.setItem(`toneSettings_${locationId}`, JSON.stringify(settings));
      
      // TODO: API call
      // await axios.post(`${API_ENDPOINT}/update-tone-settings`, {
      //   locationId,
      //   toneSettings: settings,
      // });
      
      alert('Tone settings saved successfully!');
    } catch (error) {
      console.error('Error updating tone settings:', error);
      alert('Error saving tone settings. Please try again.');
    } finally {
      setUpdatingTone(false);
    }
  };

  const presets = {
    corporate: {
      name: 'Corporate Professional',
      icon: '💼',
      values: {
        casualProfessional: 9.0,
        conciseFriendly: 2.0,
        humbleConfident: 7.5,
        shortDetailed: 4.0,
        calmExcited: 2.0,
      }
    },
    warm: {
      name: 'Warm & Welcoming',
      icon: '🤗',
      popular: true,
      values: {
        casualProfessional: 4.0,
        conciseFriendly: 9.5,
        humbleConfident: 3.5,
        shortDetailed: 6.0,
        calmExcited: 7.0,
      }
    },
    startup: {
      name: 'Startup Energy',
      icon: '🚀',
      values: {
        casualProfessional: 2.0,
        conciseFriendly: 5.0,
        humbleConfident: 1.5,
        shortDetailed: 4.0,
        calmExcited: 5.0,
      }
    },
    local: {
      name: 'Local Business Casual',
      icon: '🏪',
      values: {
        casualProfessional: 3.0,
        conciseFriendly: 7.0,
        humbleConfident: 4.0,
        shortDetailed: 8.0,
        calmExcited: 7.0,
      }
    }
  };

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    if (preset) {
      setCasualProfessional(preset.values.casualProfessional);
      setConciseFriendly(preset.values.conciseFriendly);
      setHumbleConfident(preset.values.humbleConfident);
      setShortDetailed(preset.values.shortDetailed);
      setCalmExcited(preset.values.calmExcited);
    }
  };

  const Slider = ({ label, leftLabel, rightLabel, value, onChange, min = 1, max = 10, step = 0.01 }) => {
    const sliderRef = useRef(null);
    const [localValue, setLocalValue] = useState(value);
    const [isDragging, setIsDragging] = useState(false);
    
    // Sync local value when prop changes (but not during drag)
    useEffect(() => {
      if (!isDragging) {
        setLocalValue(value);
      }
    }, [value, isDragging]);
    
    // Add native input event listener for smooth dragging
    useEffect(() => {
      const slider = sliderRef.current;
      if (!slider) return;
      
      const handleInput = (e) => {
        const newValue = parseFloat(e.target.value);
        const clampedValue = Math.max(min, Math.min(max, newValue));
        setLocalValue(clampedValue);
      };
      
      slider.addEventListener('input', handleInput);
      
      return () => {
        slider.removeEventListener('input', handleInput);
      };
    }, [min, max]);
    
    const percentage = Math.max(0, Math.min(100, ((localValue - min) / (max - min)) * 100));
    
    const handleMouseDown = () => {
      setIsDragging(true);
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      // Update parent with final value
      onChange(localValue);
    };
    
    const handleChange = (e) => {
      const newValue = parseFloat(e.target.value);
      const clampedValue = Math.max(min, Math.min(max, newValue));
      setLocalValue(clampedValue);
      // Only update parent if not dragging (for click events)
      if (!isDragging) {
        onChange(clampedValue);
      }
    };
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <span className="text-xs text-cyan-400 font-semibold bg-slate-900/50 px-2 py-1 rounded">
            {localValue.toFixed(2)}
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
              value={localValue}
              onChange={handleChange}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-slate-300 hover:text-cyan-400 transition"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white tracking-wider" style={{ letterSpacing: '0.1em' }}>StarReply</h1>
            </div>
            <div className="text-slate-300 text-sm">{locationName}</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Tone Settings */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700/50 mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 text-white">Reply Tone Settings</h2>
              <p className="text-slate-300 text-sm">
                Adjust the tone of AI-generated replies using the sliders below. Each slider ranges from 1 to 10.
              </p>
            </div>
            {/* Presets */}
            <div className="flex gap-1.5 lg:ml-4 flex-shrink-0">
              {Object.entries(presets).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => applyPreset(key)}
                  className={`relative px-2 py-1 bg-slate-700/50 hover:bg-slate-700 border rounded transition text-[10px] font-medium text-slate-200 hover:text-white ${
                    preset.popular 
                      ? 'border-cyan-400/50 hover:border-cyan-400 shadow-lg shadow-cyan-500/20' 
                      : 'border-slate-600/50 hover:border-slate-600'
                  }`}
                >
                  {preset.popular && (
                    <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-[8px] px-1 py-0.5 rounded-full font-bold whitespace-nowrap">
                      Most Popular
                    </span>
                  )}
                  <span className="mr-1 text-xs">{preset.icon}</span>
                  <span className="whitespace-nowrap">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
          
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

export default ToneSettings;

