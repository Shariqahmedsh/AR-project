import React, { useState, useEffect, useRef } from 'react';
import '../styles/pages.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Camera, 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import { progressTracker } from '../lib/progressTracker';
import API_CONFIG from '../lib/api';

const ARScenarios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  // Threat overlays removed per requirements
  const modelViewerRef = useRef(null);
  const [isARSupported, setIsARSupported] = useState(null); // null=unknown, true/false after check
  const [scenarioStartTime, setScenarioStartTime] = useState(null);
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Record scenario completion
  const recordScenarioCompletion = async (scenarioKey, score = 85) => {
    const timeSpent = scenarioStartTime ? Math.round((Date.now() - scenarioStartTime) / 1000) : 0;
    
    // Record locally first
    progressTracker.recordScenarioCompletion(scenarioKey, score, timeSpent);
    
    // Try to record on server if user is logged in
    if (userData.token && !userData.isGuest) {
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.progress.recordScenarioCompletion), {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(userData.token),
          body: JSON.stringify({
            scenarioKey,
            score,
            timeSpent
          })
        });
        
        if (response.ok) {
          console.log('Scenario completion recorded on server');
        } else {
          console.log('Server recording failed, using local storage');
        }
      } catch (error) {
        console.log('Server recording failed, using local storage:', error);
      }
    }
    
    toast({
      title: "Scenario Completed!",
      description: `You've completed the ${scenarioKey} scenario. Great job!`,
      duration: 3000
    });
  };

  const scenarios = {
    'phishing': {
      title: 'Phishing Email Detection',
      description: 'Learn to identify suspicious emails through AR visualization',
      steps: [
        'View email AR model',
        'AR model highlights suspicious elements',
        'Learn what makes it dangerous',
        'Practice identifying threats'
      ],
      threats: [
        { type: 'Suspicious sender', position: 'top-left', color: 'red' },
        { type: 'Urgent language', position: 'center', color: 'orange' },
        { type: 'Suspicious link', position: 'bottom-right', color: 'red' }
      ]
    },
    'social-engineering': {
      title: 'Social Engineering Attack',
      description: 'Recognize manipulation tactics through AR visualization',
      steps: [
        'View social engineering AR model',
        'AR model shows manipulation techniques',
        'Identifies psychological triggers',
        'Learn to resist manipulation'
      ],
      threats: [
        { type: 'Authority pressure', position: 'top-left', color: 'red' },
        { type: 'Urgency tactics', position: 'center', color: 'orange' },
        { type: 'Emotional manipulation', position: 'bottom-right', color: 'red' }
      ]
    },
    'ransomware': {
      title: 'Ransomware Attack Simulation',
      description: 'Understand ransomware threats through AR demonstration',
      steps: [
        'View ransomware AR model',
        'AR model shows attack vectors',
        'Demonstrates encryption process',
        'Learn prevention strategies'
      ],
      threats: [
        { type: 'File encryption', position: 'top-center', color: 'red' },
        { type: 'Ransom demand', position: 'center', color: 'orange' },
        { type: 'Data hostage', position: 'bottom-center', color: 'red' }
      ]
    },
    'public-wifi': {
      title: 'Public WiFi Security',
      description: 'Learn about public WiFi risks through AR visualization',
      steps: [
        'View public WiFi AR model',
        'AR model shows security risks',
        'Identifies potential threats',
        'Learn safe browsing practices'
      ],
      threats: [
        { type: 'Unencrypted network', position: 'top-left', color: 'red' },
        { type: 'Man-in-the-middle', position: 'center', color: 'orange' },
        { type: 'Data interception', position: 'bottom-right', color: 'red' }
      ]
    },
    'social-media': {
      title: 'Social Media Security',
      description: 'Protect yourself from social media threats with AR guidance',
      steps: [
        'View social media AR model',
        'AR model shows privacy settings',
        'Identifies sharing risks',
        'Learn secure social practices'
      ],
      threats: [
        { type: 'Oversharing', position: 'top-left', color: 'orange' },
        { type: 'Privacy exposure', position: 'center', color: 'red' },
        { type: 'Identity theft', position: 'bottom-right', color: 'red' }
      ]
    }
  };

  useEffect(() => {
    if (location.state?.scenario) {
      setSelectedScenario(location.state.scenario);
    }
  }, [location.state]);

  // Detect AR capability (WebXR / Scene Viewer / Quick Look)
  useEffect(() => {
    let cancelled = false;
    const checkARSupport = async () => {
      try {
        // Prefer WebXR immersive-ar capability when available
        if (navigator && 'xr' in navigator && navigator.xr?.isSessionSupported) {
          const supported = await navigator.xr.isSessionSupported('immersive-ar');
          if (!cancelled) setIsARSupported(!!supported);
          return;
        }
      } catch {}
      // Fallback to model-viewer heuristic once element exists
      const el = modelViewerRef.current;
      if (el && typeof el.canActivateAR !== 'undefined') {
        setIsARSupported(!!el.canActivateAR);
      } else {
        setIsARSupported(false);
      }
    };
    checkARSupport();
    return () => { cancelled = true; };
  }, [selectedScenario]);

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setScenarioStartTime(Date.now()); // Record start time
    // no threat overlays
    
    // Attempt to launch AR session via model-viewer when available
    const el = modelViewerRef.current;
    if (el && typeof el.activateAR === 'function') {
      // give the UI a tick to ensure element is ready
      setTimeout(() => {
        const launched = el.activateAR();
        if (launched === false) {
          toast({
            title: 'AR not supported',
            description: 'Your device/browser may not support AR mode. Showing 3D preview instead.'
          });
        }
      }, 50);
    } else {
      toast({
        title: 'AR not available',
        description: 'Model viewer AR interface is unavailable. Showing 3D preview instead.'
      });
    }

    // Simulate AR model presentation progression
    const interval = setInterval(() => {
      setSimulationStep(prev => {
        if (prev >= 3) {
          clearInterval(interval);
          // Record scenario completion when simulation completes
          if (selectedScenario) {
            recordScenarioCompletion(selectedScenario);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationStep(0);
    // no threat overlays
  };

  const resetSimulation = () => {
    stopSimulation();
    setTimeout(() => startSimulation(), 500);
  };

  const handleTakeQuiz = () => {
    navigate(`/quiz/${selectedScenario}`);
  };

  const renderARView = () => {
    if (!selectedScenario || !scenarios[selectedScenario]) return null;

    const scenario = scenarios[selectedScenario];

    // Pick model per scenario (no backups/fallbacks)
    const scenarioToModel = {
      phishing: {
        glb: '/models/phishing_email_.glb',
        usdz: null
      },
      'social-engineering': {
        glb: '/models/social_engineering.glb',
        usdz: null
      },
      ransomware: {
        glb: '/models/ransomware_attack2.glb',
        usdz: null
      },
      'public-wifi': {
        glb: '/models/public_wifi.glb',
        usdz: null
      },
      'social-media': {
        glb: '/models/social_media.glb',
        usdz: null
      }
    };

    const mapping = scenarioToModel[selectedScenario] || { glb: null, usdz: null };
    const modelSrc = mapping.glb;
    const iosSrc = mapping.usdz;

    return (
      <div className="relative w-full ar-view-height rounded-lg overflow-hidden border-2 border-purple-500/30">
        {/* Web AR Viewer (model-viewer) */}
        {modelSrc ? (
          <model-viewer
            ref={modelViewerRef}
            src={modelSrc}
            {...(iosSrc ? { 'ios-src': iosSrc } : {})}
            poster="/models/loading_screen.gif"
            alt="A 3D model"
            ar
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-black/20 text-white/80 text-sm">
            AR model for this scenario is coming soon.
          </div>
        )}

        {/* AR capability fallback */}
        {isARSupported === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white p-4 text-center">
            <div>
              <p className="font-medium">AR is not supported on this device or browser.</p>
              <p className="text-white/80 text-sm mt-1">Try a WebXR-capable browser on Android (Chrome), iOS Quick Look with USDZ, or a device that supports AR.</p>
            </div>
          </div>
        )}

        {/* Attribution bar removed per request */}

        {/* Threat indicators removed */}

        {/* Removed bottom AR status bar for a cleaner viewer */}
      </div>
    );
  };

  const getPositionClass = (position) => {
    const positions = {
      'top-left': 'top-1/4 left-1/4',
      'top-center': 'top-1/4 left-1/2',
      'top-right': 'top-1/4 right-1/4',
      'center': 'top-1/2 left-1/2',
      'center-right': 'top-1/2 right-1/4',
      'bottom-left': 'bottom-1/4 left-1/4',
      'bottom-center': 'bottom-1/4 left-1/2',
      'bottom-right': 'bottom-1/4 right-1/4',
      'left': 'top-1/2 left-1/4',
      'right': 'top-1/2 right-1/4'
    };
    return positions[position] || 'top-1/2 left-1/2';
  };

  const getThreatColor = (color) => {
    const colors = {
      'red': 'border-red-500 text-red-400 bg-red-500/10',
      'orange': 'border-orange-500 text-orange-400 bg-orange-500/10',
      'yellow': 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
    };
    return colors[color] || colors.red;
  };

  if (!selectedScenario) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="glass-effect mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold cyber-text mb-2">
              AR Cyber Threat Scenarios
            </h1>
            <p className="text-muted-foreground">
              Select a scenario to begin your AR cybersecurity training
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(scenarios).map(([key, scenario]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer"
                onClick={() => setSelectedScenario(key)}
              >
                <Card className="glass-effect cyber-border hover:glow-effect transition-all duration-300 h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      Start Scenario
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scenario = scenarios[selectedScenario];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => setSelectedScenario(null)}
            className="glass-effect mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Scenarios
          </Button>
          <h1 className="text-4xl font-bold cyber-text mb-2">
            {scenario.title}
          </h1>
          <p className="text-muted-foreground">
            {scenario.description}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AR View */}
          <div className="lg:col-span-2">
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="w-6 h-6 text-purple-400" />
                  <CardTitle>AR Preview</CardTitle>
                </div>
                  <div className="flex items-center space-x-2">
                    {!isSimulating ? (
                      <Button
                        onClick={startSimulation}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start AR
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={stopSimulation}
                          className="glass-effect"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                        <Button
                          variant="outline"
                          onClick={resetSimulation}
                          className="glass-effect"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderARView()}
              </CardContent>
            </Card>
          </div>

          {/* Controls and Info */}
          <div className="space-y-6">
            {/* Scenario Steps */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scenario.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                        isSimulating && simulationStep >= index
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-muted/20'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSimulating && simulationStep >= index
                          ? 'bg-purple-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Threat detection UI removed */}

            {/* Actions */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleTakeQuiz}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  Take Quiz
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "🚧 Feature Coming Soon!",
                      description: "Advanced AR features will be available in the next update! 🚀"
                    });
                  }}
                  className="w-full glass-effect"
                >
                  Advanced Mode
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARScenarios;