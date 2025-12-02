import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import API_CONFIG from '../lib/api';
import { progressTracker } from '../lib/progressTracker';
import '../styles/pages.css';

const Quiz = () => {
  const navigate = useNavigate();
  const { scenario } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchedQuiz, setFetchedQuiz] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [noQuestions, setNoQuestions] = useState(false);

  // Record quiz attempt to progress tracking
  const recordQuizAttempt = async (score, totalQuestions, timeSpent) => {
    const passed = (score / totalQuestions) >= 0.8; // 80% threshold
    
    // Record locally first
    const attempt = progressTracker.recordQuizAttempt(
      scenario || 'general',
      score,
      totalQuestions,
      passed,
      timeSpent
    );
    
    // Try to record on server if user is logged in
    if (userData.token && !userData.isGuest) {
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.progress.recordQuizAttempt), {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(userData.token),
          body: JSON.stringify({
            categoryKey: scenario || 'general',
            score,
            totalQuestions,
            timeSpent,
            answers: answers.map((answer, index) => ({
              questionIndex: index,
              selectedAnswer: answer,
              correctAnswer: fetchedQuiz?.questions[index]?.correct
            }))
          })
        });
        
        if (response.ok) {
          console.log('Quiz attempt recorded on server');
        } else {
          console.log('Server recording failed, using local storage');
        }
      } catch (error) {
        console.log('Server recording failed, using local storage:', error);
      }
    }
    
    return attempt;
  };

  // const quizData = {
  //   general: {
  //     title: 'General Cybersecurity Quiz',
  //     description: 'Test your overall cybersecurity knowledge',
  //     questions: [
  //       {
  //         question: 'What is the most common type of cyber attack?',
  //         options: ['Phishing', 'DDoS', 'Malware', 'SQL Injection'],
  //         correct: 0,
  //         explanation: 'Phishing attacks are the most common, accounting for over 80% of security incidents.'
  //       },
  //       {
  //         question: 'Which of these makes a password strong?',
  //         options: ['Length only', 'Complexity only', 'Both length and complexity', 'Using personal information'],
  //         correct: 2,
  //         explanation: 'Strong passwords combine both length (12+ characters) and complexity (mixed characters).'
  //       },
  //       {
  //         question: 'What does HTTPS indicate?',
  //         options: ['Fast website', 'Secure connection', 'Popular website', 'Mobile-friendly'],
  //         correct: 1,
  //         explanation: 'HTTPS indicates an encrypted, secure connection between your browser and the website.'
  //       },
  //       {
  //         question: 'How often should you update your software?',
  //         options: ['Never', 'Once a year', 'When prompted/regularly', 'Only when it breaks'],
  //         correct: 2,
  //         explanation: 'Regular updates patch security vulnerabilities and should be installed promptly.'
  //       },
  //       {
  //         question: 'What is two-factor authentication?',
  //         options: ['Two passwords', 'Password + something else', 'Two usernames', 'Two devices'],
  //         correct: 1,
  //         explanation: '2FA requires your password plus another factor like a code from your phone.'
  //       }
  //     ]
  //   },
  //   phishing: {
  //     title: 'Phishing Detection Quiz',
  //     description: 'Test your ability to identify phishing attempts',
  //     questions: [
  //       {
  //         question: 'Which email characteristic suggests phishing?',
  //         options: ['Professional formatting', 'Urgent action required', 'Personalized greeting', 'Company logo'],
  //         correct: 1,
  //         explanation: 'Phishing emails often create false urgency to pressure quick action without thinking.'
  //       },
  //       {
  //         question: 'What should you do with suspicious links?',
  //         options: ['Click to investigate', 'Hover to check URL', 'Forward to friends', 'Ignore completely'],
  //         correct: 1,
  //         explanation: 'Hovering reveals the actual destination URL without clicking the potentially dangerous link.'
  //       },
  //       {
  //         question: 'Phishing emails often contain:',
  //         options: ['Perfect grammar', 'Generic greetings', 'Specific details', 'Calm language'],
  //         correct: 1,
  //         explanation: 'Phishing emails typically use generic greetings like "Dear Customer" instead of your name.'
  //       },
  //       {
  //         question: 'If you receive a suspicious email claiming to be from your bank:',
  //         options: ['Click the link', 'Call the bank directly', 'Reply with your info', 'Forward it'],
  //         correct: 1,
  //         explanation: 'Always verify suspicious communications by contacting the organization directly.'
  //       },
  //       {
  //         question: 'What is spear phishing?',
  //         options: ['Random attacks', 'Targeted attacks', 'Phone calls', 'Text messages'],
  //         correct: 1,
  //         explanation: 'Spear phishing targets specific individuals with personalized, convincing attacks.'
  //       }
  //     ]
  //   },
  //   'fake-login': {
  //     title: 'Fake Login Page Quiz',
  //     description: 'Learn to identify fraudulent login pages',
  //     questions: [
  //       {
  //         question: 'What should you check first on a login page?',
  //         options: ['Design quality', 'URL/domain name', 'Loading speed', 'Color scheme'],
  //         correct: 1,
  //         explanation: 'Always verify the URL matches the legitimate website domain before entering credentials.'
  //       },
  //       {
  //         question: 'A legitimate banking website should have:',
  //         options: ['HTTP connection', 'HTTPS connection', 'No security indicators', 'Pop-up warnings'],
  //         correct: 1,
  //         explanation: 'Financial websites must use HTTPS for secure, encrypted connections.'
  //       },
  //       {
  //         question: 'If a login page looks slightly different than usual:',
  //         options: ['Proceed normally', 'Be suspicious', 'Clear your cache', 'Use mobile instead'],
  //         correct: 1,
  //         explanation: 'Even small differences could indicate a fake page designed to steal credentials.'
  //       },
  //       {
  //         question: 'What is a common sign of a fake login page?',
  //         options: ['Perfect design', 'Spelling errors', 'Fast loading', 'Mobile compatibility'],
  //         correct: 1,
  //         explanation: 'Fake pages often contain spelling errors, poor grammar, or design inconsistencies.'
  //       },
  //       {
  //         question: 'Before entering passwords, you should:',
  //         options: ['Type quickly', 'Verify the site', 'Use autofill', 'Check your email'],
  //         correct: 1,
  //         explanation: 'Always verify you\'re on the legitimate website before entering sensitive information.'
  //       }
  //     ]
  //   },
  //   'weak-password': {
  //     title: 'Password Security Quiz',
  //     description: 'Test your password security knowledge',
  //     questions: [
  //       {
  //         question: 'What makes a password weak?',
  //         options: ['Too long', 'Too short', 'Too complex', 'Too random'],
  //         correct: 1,
  //         explanation: 'Short passwords are easily cracked by brute force attacks.'
  //       },
  //       {
  //         question: 'Which password is strongest?',
  //         options: ['password123', 'P@ssw0rd!', 'MyDog2023', 'Tr0ub4dor&3'],
  //         correct: 3,
  //         explanation: 'Tr0ub4dor&3 combines length, complexity, and unpredictability effectively.'
  //       },
  //       {
  //         question: 'How often should you change passwords?',
  //         options: ['Daily', 'Weekly', 'When compromised', 'Never'],
  //         correct: 2,
  //         explanation: 'Change passwords when there\'s evidence of compromise or for high-value accounts periodically.'
  //       },
  //       {
  //         question: 'What should you never include in passwords?',
  //         options: ['Numbers', 'Symbols', 'Personal information', 'Letters'],
  //         correct: 2,
  //         explanation: 'Personal information like birthdays or names can be easily guessed by attackers.'
  //       },
  //       {
  //         question: 'What is the best way to manage multiple passwords?',
  //         options: ['Write them down', 'Use the same one', 'Password manager', 'Memory only'],
  //         correct: 2,
  //         explanation: 'Password managers securely store unique, strong passwords for all your accounts.'
  //       }
  //     ]
  //   },
  //   'malware-usb': {
  //     title: 'USB Security Quiz',
  //     description: 'Learn about USB-based threats',
  //     questions: [
  //       {
  //         question: 'What should you do with a found USB drive?',
  //         options: ['Plug it in immediately', 'Report it to IT/security', 'Never use it', 'Share with others'],
  //         correct: 2,
  //         explanation: 'Unknown USB drives can contain malware and should never be used on your devices.'
  //       },
  //       {
  //         question: 'USB attacks can:',
  //         options: ['Only steal files', 'Only install malware', 'Both steal and install', 'Do nothing harmful'],
  //         correct: 2,
  //         explanation: 'Malicious USB devices can both steal data and install malware on your system.'
  //       },
  //       {
  //         question: 'What is a "BadUSB" attack?',
  //         options: ['Broken USB port', 'Fake USB device', 'Slow USB transfer', 'Old USB standard'],
  //         correct: 1,
  //         explanation: 'BadUSB attacks use devices that appear normal but contain malicious firmware.'
  //       },
  //       {
  //         question: 'To protect against USB threats:',
  //         options: ['Disable USB ports', 'Use only trusted devices', 'Keep autorun disabled', 'All of the above'],
  //         correct: 3,
  //         explanation: 'Comprehensive USB security includes disabling unnecessary ports, using trusted devices, and keeping autorun disabled.'
  //       },
  //       {
  //         question: 'Auto-run features on USB devices:',
  //         options: ['Are always safe', 'Should be disabled', 'Only work on Windows', 'Improve performance'],
  //         correct: 1,
  //         explanation: 'Auto-run features can automatically execute malicious code and should be disabled.'
  //       }
  //     ]
  //   },
  //   'safe-browsing': {
  //     title: 'Safe Browsing Quiz',
  //     description: 'Test your web browsing security knowledge',
  //     questions: [
  //       {
  //         question: 'What indicates a secure website?',
  //         options: ['Green color scheme', 'HTTPS and lock icon', 'Fast loading', 'Many images'],
  //         correct: 1,
  //         explanation: 'HTTPS protocol and the lock icon indicate encrypted, secure connections.'
  //       },
  //       {
  //         question: 'When downloading software, you should:',
  //         options: ['Use any website', 'Use official sources', 'Choose the fastest download', 'Avoid antivirus scans'],
  //         correct: 1,
  //         explanation: 'Always download software from official websites or trusted app stores.'
  //       },
  //       {
  //         question: 'Pop-up ads that claim your computer is infected:',
  //         options: ['Are usually accurate', 'Should be trusted', 'Are likely scams', 'Require immediate action'],
  //         correct: 2,
  //         explanation: 'These pop-ups are typically scareware designed to trick you into downloading malware.'
  //       },
  //       {
  //         question: 'What should you do about browser updates?',
  //         options: ['Ignore them', 'Install immediately', 'Wait a year', 'Only update manually'],
  //         correct: 1,
  //         explanation: 'Browser updates often include critical security patches and should be installed promptly.'
  //       },
  //       {
  //         question: 'Public Wi-Fi networks:',
  //         options: ['Are always safe', 'Should be avoided', 'Require extra caution', 'Are faster than private'],
  //         correct: 2,
  //         explanation: 'Public Wi-Fi requires extra caution as traffic can be intercepted by attackers.'
  //       }
  //     ]
  //   }
  // };

  const currentQuiz = fetchedQuiz || null;

  // Fetch quiz from backend by category key
  useEffect(() => {
    const keyMap = {
      general: 'general',
      phishing: 'phishing',
      'social-engineering': 'social-engineering',
      'ransomware': 'ransomware',
      'public-wifi': 'public-wifi',
      'social-media': 'social-media'
    };
    const key = keyMap[scenario] || 'general';
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setFetchedQuiz(null);
        setNoQuestions(false);
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.byCategoryKey(key));
        const res = await fetch(url, { headers: API_CONFIG.getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to load quiz');
        const data = await res.json();
        if (cancelled) return;
        // normalize to local shape
        const questions = Array.isArray(data.questions) ? data.questions : [];
        if (questions.length === 0) {
          setNoQuestions(true);
          setFetchedQuiz(null);
          return;
        }
        const normalized = {
          title: data.title || 'Quiz',
          description: data.description || '',
          questions: questions.map((q) => ({
            question: q.question,
            options: q.options,
            correct: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
            explanation: q.explanation || ''
          }))
        };
        setFetchedQuiz(normalized);
      } catch (e) {
        setError(e.message);
        setNoQuestions(true);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setStartTime(Date.now()); // Record start time when quiz loads
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [scenario]);

  useEffect(() => {
    if (!quizCompleted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleAnswer(null); // Auto-submit when time runs out
    }
  }, [timeLeft, quizCompleted, showResult]);

  const handleAnswer = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
    setSelectedAnswer(answerIndex);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < currentQuiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(30);
      } else {
        setQuizCompleted(true);
        // Record quiz attempt when completed
        const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
        const score = calculateScore();
        recordQuizAttempt(score, fetchedQuiz?.questions?.length || 0, timeSpent);
      }
    }, 2000);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === currentQuiz.questions[index].correct) {
        correct++;
      }
    });
    return correct;
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResult(false);
    setTimeLeft(30);
    setQuizCompleted(false);
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (quizCompleted && currentQuiz) {
    const score = calculateScore();
    const total = currentQuiz.questions.length;
    const percentage = Math.round((score / total) * 100);

    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="glass-effect cyber-border text-center">
            <CardHeader>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto mb-4"
              >
                <Trophy className={`w-16 h-16 ${getScoreColor(score, total)}`} />
              </motion.div>
              <CardTitle className="text-3xl cyber-text">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                {currentQuiz.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className={`text-6xl font-bold ${getScoreColor(score, total)} mb-2`}>
                  {percentage}%
                </div>
                <p className="text-xl text-muted-foreground">
                  {score} out of {total} correct
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <div className="w-full bg-muted rounded-full h-4">
                  <motion.div
                    className={`h-4 rounded-full bg-gradient-to-r ${
                      percentage >= 80 
                        ? 'from-green-500 to-green-600' 
                        : percentage >= 60 
                        ? 'from-yellow-500 to-yellow-600'
                        : 'from-red-500 to-red-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: 0.8, duration: 1 }}
                  />
                </div>

                <div className="text-center">
                  {percentage >= 80 && (
                    <p className="text-green-400 font-medium">Excellent! You're well-prepared for cyber threats.</p>
                  )}
                  {percentage >= 60 && percentage < 80 && (
                    <p className="text-yellow-400 font-medium">Good job! Consider reviewing some concepts.</p>
                  )}
                  {percentage < 60 && (
                    <p className="text-red-400 font-medium">Keep learning! Cybersecurity knowledge is crucial.</p>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  onClick={restartQuiz}
                  variant="outline"
                  className="glass-effect"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Card className="glass-effect cyber-border max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">Loading quiz…</CardTitle>
            <CardDescription>Fetching questions for this category.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!currentQuiz && !loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <Card className="glass-effect cyber-border max-w-md w-full text-center">
          <CardHeader>
            <CardTitle className="text-xl">No quiz questions added yet</CardTitle>
            <CardDescription>
              This category currently has no questions in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = currentQuiz?.questions[currentQuestion];

  return (
    <div className="page-container">
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold cyber-text mb-2">
                {currentQuiz.title}
              </h1>
              <p className="text-muted-foreground">
                Question {currentQuestion + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400' : 'text-cyan-400'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">{loading ? 'Loading question...' : question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 rounded border border-red-500/40 text-red-300 text-sm">
                    {error}
                  </div>
                )}
                <div className="space-y-4 opacity-100">
                  {(question.options || []).map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => !showResult && handleAnswer(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                        showResult
                          ? index === question.correct
                            ? 'border-green-500 bg-green-500/20 text-green-400'
                            : selectedAnswer === index
                            ? 'border-red-500 bg-red-500/20 text-red-400'
                            : 'border-muted bg-muted/20'
                          : selectedAnswer === index
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-muted bg-muted/20 hover:border-purple-400 hover:bg-purple-400/10'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showResult && index === question.correct
                            ? 'border-green-500 bg-green-500'
                            : showResult && selectedAnswer === index && index !== question.correct
                            ? 'border-red-500 bg-red-500'
                            : 'border-current'
                        }`}>
                          {showResult && index === question.correct && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                          {showResult && selectedAnswer === index && index !== question.correct && (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                          {!showResult && (
                            <span className="text-sm font-bold">
                              {String.fromCharCode(65 + index)}
                            </span>
                          )}
                        </div>
                        <span>{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6 p-4 rounded-lg glass-effect border border-blue-500/30"
                    >
                      <h3 className="font-semibold text-blue-400 mb-2">Explanation:</h3>
                      <p className="text-sm text-muted-foreground">{question.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Progress */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    {currentQuestion + 1} / {currentQuiz.questions.length} questions
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Score */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg">Current Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold cyber-text mb-2">
                    {calculateScore()} / {currentQuestion}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Correct answers so far
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="glass-effect cyber-border">
              <CardHeader>
                <CardTitle className="text-lg">Quiz Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Read each question carefully</p>
                  <p>• Consider all options before answering</p>
                  <p>• Learn from the explanations</p>
                  <p>• Take your time to understand concepts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;