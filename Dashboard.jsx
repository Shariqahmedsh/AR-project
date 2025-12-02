import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Brain, 
  Gamepad2, 
  Shield, 
  Mail, 
  Lock, 
  Usb, 
  Globe,
  User,
  LogOut,
  Settings,
  Key,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import '../styles/pages.css';
import PasswordChangeModal from '../components/PasswordChangeModal';
import API_CONFIG from '../lib/api';
import { progressTracker } from '../lib/progressTracker';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [progress, setProgress] = useState({
    scenariosCompleted: 0,
    quizzesPassed: 0,
    totalScore: 0
  });
  const [loading, setLoading] = useState(true);
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Fetch user progress
  const fetchProgress = async () => {
    setLoading(true);
    
    try {
      // Try to fetch from server first (if user is logged in)
      if (userData.token && !userData.isGuest) {
        try {
          const response = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.progress.getProgress), {
            method: 'GET',
            headers: API_CONFIG.getAuthHeaders(userData.token)
          });
          
          if (response.ok) {
            const data = await response.json();
            setProgress(data);
            return;
          }
        } catch (error) {
          console.log('Server progress fetch failed, using local storage');
        }
      }
      
      // Fallback to local storage
      const localProgress = progressTracker.getProgressSummary();
      setProgress(localProgress);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out."
    });
    navigate('/');
  };

  const arScenarios = [
    {
      id: 'phishing',
      title: 'Phishing Email Detection',
      description: 'Learn to identify suspicious emails through AR visualization',
      icon: Mail,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Beginner'
    },
    {
      id: 'social-engineering',
      title: 'Social Engineering Attack',
      description: 'Recognize manipulation tactics through AR visualization',
      icon: User,
      color: 'from-orange-500 to-red-500',
      difficulty: 'Intermediate'
    },
    {
      id: 'ransomware',
      title: 'Ransomware Attack Simulation',
      description: 'Understand ransomware threats through AR demonstration',
      icon: Shield,
      color: 'from-yellow-500 to-orange-500',
      difficulty: 'Advanced'
    },
    {
      id: 'public-wifi',
      title: 'Public WiFi Security',
      description: 'Learn about public WiFi risks through AR visualization',
      icon: Globe,
      color: 'from-purple-500 to-pink-500',
      difficulty: 'Intermediate'
    },
    {
      id: 'social-media',
      title: 'Social Media Security',
      description: 'Protect yourself from social media threats with AR guidance',
      icon: User,
      color: 'from-blue-500 to-purple-500',
      difficulty: 'Beginner'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="page-container">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1 sm:mb-2">
              <img src="/models/cyberLogo.png" alt="Cyber Logo" className="w-10 h-10 object-contain" />
              <h1 className="text-3xl sm:text-4xl font-bold cyber-text">
                AR CyberGuard Dashboard
              </h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Welcome back, {userData.username || 'User'}! Ready to explore cybersecurity through AR?
            </p>
          </div>
          
          <div className="flex items-center sm:space-x-4 gap-2 sm:gap-0 flex-wrap">
            <div className="flex items-center space-x-2 glass-effect px-3 sm:px-4 py-2 rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{userData.username || 'Guest'}</span>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="glass-effect w-full sm:w-auto"
            >
              <Key className="w-4 h-4 mr-2" />
              Change Password
            </Button>
            {userData.role === 'admin' && (
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="glass-effect w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="glass-effect w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </motion.div>

        {/* Main Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {/* AR Scenarios Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="glass-effect cyber-border h-full">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 glow-effect">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">AR Cyber Threat Scenarios</CardTitle>
                    <CardDescription>
                      Experience realistic cybersecurity threats through augmented reality
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {arScenarios.map((scenario, index) => (
                    <motion.div
                      key={scenario.id}
                      variants={itemVariants}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group cursor-pointer"
                      onClick={() => {
                        try {
                          navigate('/ar-scenarios', { state: { scenario: scenario.id } });
                        } catch (error) {
                          console.error('Navigation error:', error);
                          toast({
                            title: "Navigation Error",
                            description: "Unable to navigate to AR scenario. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      <Card className="glass-effect hover:glow-effect transition-all duration-300 h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-r ${scenario.color} glow-effect`}>
                              <scenario.icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                                {scenario.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                {scenario.description}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${scenario.color} text-white`}>
                                  {scenario.difficulty}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-400 hover:text-purple-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    try {
                                      navigate(`/quiz/${scenario.id}`);
                                    } catch (error) {
                                      console.error('Quiz navigation error:', error);
                                      toast({
                                        title: "Navigation Error",
                                        description: "Unable to navigate to quiz. Please try again.",
                                        variant: "destructive"
                                      });
                                    }
                                  }}
                                >
                                  Take Quiz
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Side Panel */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Quiz Section */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 glow-effect">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Cybersecurity Quiz</CardTitle>
                    <CardDescription>Test your knowledge</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Challenge yourself with interactive cybersecurity questions and get instant feedback.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 glow-effect"
                  onClick={() => navigate('/quiz')}
                >
                  Start General Quiz
                </Button>
              </CardContent>
            </Card>

            {/* Game Section */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 glow-effect">
                    <Gamepad2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Interactive Games</CardTitle>
                    <CardDescription>Learn through play</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Engage with fun mini-games designed to reinforce cybersecurity concepts.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 glow-effect"
                  onClick={() => navigate('/game')}
                >
                  Play Games
                </Button>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Your Progress</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchProgress}
                    disabled={loading}
                    className="p-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Scenarios Completed</span>
                      <span>{progress.scenariosCompleted}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.scenariosCompleted / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quizzes Passed</span>
                      <span>{progress.quizzesPassed}/5</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(progress.quizzesPassed / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-muted">
                    <div className="flex justify-between text-sm">
                      <span>Total Score</span>
                      <span className="font-semibold text-green-400">{progress.totalScore}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;