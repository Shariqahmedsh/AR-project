import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Smartphone, 
  Eye, 
  Lock, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/button';

const IntroductionPage = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

  const sections = [
    {
      id: 'cybersecurity',
      title: 'What is Cybersecurity?',
      content: 'Protecting your digital life from threats',
      icon: Shield,
      animation: 'shield'
    },
    {
      id: 'ar',
      title: 'What is Augmented Reality?',
      content: 'Digital content overlaid on the real world',
      icon: Smartphone,
      animation: 'ar'
    },
    {
      id: 'difference',
      title: 'How They Work Together',
      content: 'AR makes cybersecurity threats visible and understandable',
      icon: Eye,
      animation: 'connection'
    },
    {
      id: 'project',
      title: 'This Project',
      content: 'Experience cyber threats through AR simulations',
      icon: Play,
      animation: 'demo'
    },
    {
      id: 'safety',
      title: 'Stay Safe Online',
      content: 'Learn essential cybersecurity practices',
      icon: CheckCircle,
      animation: 'safety'
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      navigate('/dashboard');
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const renderAnimation = (animationType) => {
    // Standardized container size for all animations - fixed dimensions
    const containerClass = "relative w-60 h-40 mx-auto";
    
    switch (animationType) {
      case 'shield':
        return (
          <div className={containerClass}>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <Shield className="w-16 h-16 text-blue-400" />
            </motion.div>
            <motion.div
              className="absolute inset-0 border-4 border-blue-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            />
            <motion.div
              className="absolute inset-0 border-2 border-purple-400 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 1 }}
            />
          </div>
        );
      
      case 'ar':
        return (
          <div className={containerClass}>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Smartphone className="w-24 h-24 text-cyan-400" />
            </motion.div>
            <motion.div
              className="absolute top-16 left-16 w-6 h-6 bg-purple-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            />
            <motion.div
              className="absolute top-20 right-20 w-4 h-4 bg-blue-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-8 h-8 bg-cyan-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            />
          </div>
        );
      
      case 'connection':
        return (
          <div className={containerClass}>
            <div className="absolute inset-0 flex justify-between items-center px-12">
              <motion.div
                className="flex flex-col items-center space-y-2"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Shield className="w-16 h-16 text-blue-400" />
                <span className="text-xs text-blue-400">Cybersecurity</span>
              </motion.div>
              
              <motion.div
                className="flex items-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <ArrowRight className="w-6 h-6 text-purple-400" />
              </motion.div>
              
              <motion.div
                className="flex flex-col items-center space-y-2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                <Eye className="w-16 h-16 text-cyan-400" />
                <span className="text-xs text-cyan-400 flex justify-center items-center w-full text-center">AR Visualization</span>
              </motion.div>
            </div>
          </div>
        );
      
      case 'demo':
        return (
          <div className={containerClass}>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Smartphone className="w-24 h-24 text-cyan-400" />
            </motion.div>
            <motion.div
              className="absolute top-12 right-12 flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full border border-red-500"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-400">Phishing</span>
            </motion.div>
            <motion.div
              className="absolute bottom-12 left-12 flex items-center space-x-1 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <Lock className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">Malware</span>
            </motion.div>
          </div>
        );
      
      case 'safety':
        return (
          <div className={containerClass}>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <CheckCircle className="w-24 h-24 text-green-400" />
            </motion.div>
            <motion.div
              className="absolute top-16 left-16 w-3 h-3 bg-green-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            />
            <motion.div
              className="absolute top-20 right-20 w-3 h-3 bg-green-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            />
            <motion.div
              className="absolute bottom-20 left-20 w-3 h-3 bg-green-500 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, duration: 0.3 }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderContent = (section) => {
    switch (section.id) {
      case 'cybersecurity':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Cybersecurity is the practice of protecting digital systems, networks, and data from cyber threats.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="flex items-center space-x-3 p-4 rounded-lg glass-effect"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <Lock className="w-6 h-6 text-blue-400" />
                <span className="text-sm">Data Protection</span>
              </motion.div>
              <motion.div
                className="flex items-center space-x-3 p-4 rounded-lg glass-effect"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Wifi className="w-6 h-6 text-purple-400" />
                <span className="text-sm">Network Security</span>
              </motion.div>
            </div>
          </div>
        );
      
      case 'ar':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Augmented Reality overlays digital information onto the real world, creating interactive experiences.
            </p>
            <motion.div
              className="p-6 rounded-lg glass-effect text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <p className="text-cyan-400 font-medium">AR overlay → Explore interactive content</p>
            </motion.div>
          </div>
        );
      
      case 'difference':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              By combining AR with cybersecurity education, we make invisible threats visible and understandable.
            </p>
            <div className="space-y-4">
              <motion.div
                className="p-4 rounded-lg glass-effect border-l-4 border-blue-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <p className="text-blue-400 font-medium">Traditional Learning</p>
                <p className="text-sm text-muted-foreground">Abstract concepts, hard to visualize</p>
              </motion.div>
              <motion.div
                className="p-4 rounded-lg glass-effect border-l-4 border-purple-400"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-purple-400 font-medium">AR Learning</p>
                <p className="text-sm text-muted-foreground">Interactive, visual, memorable</p>
              </motion.div>
            </div>
          </div>
        );
      
      case 'project':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Experience realistic cyber threat scenarios with AR overlays and learn how to identify and prevent them.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="p-4 rounded-lg glass-effect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                <p className="text-cyan-400 font-medium">📧 Phishing Email Detection</p>
                <p className="text-sm text-muted-foreground">Learn to spot suspicious emails</p>
              </motion.div>
              <motion.div
                className="p-4 rounded-lg glass-effect"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <p className="text-purple-400 font-medium">🔒 Password Security</p>
                <p className="text-sm text-muted-foreground">Understand password vulnerabilities</p>
              </motion.div>
            </div>
          </div>
        );
      
      case 'safety':
        return (
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground">
              Master essential cybersecurity practices to protect yourself in the digital world.
            </p>
            <div className="space-y-3">
              {[
                'Use strong, unique passwords',
                'Verify links before clicking',
                'Keep software updated',
                'Be cautious with public Wi-Fi'
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg glass-effect"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.2, duration: 0.5 }}
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">{tip}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold cyber-text mb-4">
            Welcome to AR CyberGuard
          </h1>
          <div className="flex justify-center space-x-2 mb-6">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  index === currentSection ? 'bg-purple-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="glass-effect rounded-2xl p-8 cyber-border"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 glow-effect">
                    {React.createElement(sections[currentSection].icon, {
                      className: "w-6 h-6 text-white"
                    })}
                  </div>
                  <h2 className="text-2xl font-bold">{sections[currentSection].title}</h2>
                </div>
                {renderContent(sections[currentSection])}
              </div>
              
              <div className="flex justify-center">
                {renderAnimation(sections[currentSection].animation)}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 0}
            className="glass-effect"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            {currentSection + 1} of {sections.length}
          </span>
          
          <Button
            onClick={nextSection}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 glow-effect"
          >
            {currentSection === sections.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;    