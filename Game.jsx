import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Target, 
  Zap,
  Trophy,
  Clock,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from '../components/ui/use-toast';
import API_CONFIG, { ApiService } from '../lib/api';
import { progressTracker } from '../lib/progressTracker';
import '../styles/pages.css';

const Game = () => {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);

  // Phishing Game State
  const [phishingEmails, setPhishingEmails] = useState([]);
  const [currentEmail, setCurrentEmail] = useState(0);

  // Hacker Game State
  const [hackers, setHackers] = useState([]);
  const [clickedHackers, setClickedHackers] = useState([]);
  const [noGameContent, setNoGameContent] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);
  const [userScenarioScores, setUserScenarioScores] = useState({}); // { [scenarioKey]: score }
  
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Record game completion
  const recordGameCompletion = async (gameId, finalScore) => {
    const timeSpent = gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0;
    
    // Record locally first
    progressTracker.recordScenarioCompletion(gameId, finalScore, timeSpent);
    
    // Try to record on server if user is logged in
    if (userData.token && !userData.isGuest) {
      try {
        const response = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.progress.recordScenarioCompletion), {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(userData.token),
          body: JSON.stringify({
            scenarioKey: gameId,
            score: finalScore,
            timeSpent
          })
        });
        
        if (response.ok) {
          console.log('Game completion recorded on server');
        } else {
          console.log('Server recording failed, using local storage');
        }
      } catch (error) {
        console.log('Server recording failed, using local storage:', error);
      }
    }
    
    const gameTitle = games.find(g => g.id === gameId)?.title || 'Game';
    toast({
      title: "Game Completed!",
      description: `You scored ${finalScore} points in ${gameTitle}!`,
      duration: 3000
    });
  };

  const games = [
    {
      id: 'phishing-detector',
      title: 'Phishing Email Detective',
      description: 'Identify phishing emails before they fool you!',
      icon: Target,
      color: 'from-red-500 to-pink-500',
      difficulty: 'Beginner'
    },
    {
      id: 'hacker-hunter',
      title: 'Catch the Hacker',
      description: 'Click on suspicious activities to stop cyber attacks!',
      icon: Zap,
      color: 'from-purple-500 to-blue-500',
      difficulty: 'Intermediate'
    }
  ];

  // Removed built-in phishing email seed; content must come from the backend

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  // Keep a ref of the latest score to avoid stale closures when ending the game
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  // Load phishing emails from backend when starting the phishing game
  useEffect(() => {
    if (selectedGame === 'phishing-detector' && gameState === 'playing') {
      (async () => {
        try {
          setNoGameContent(false);
          const res = await fetch(API_CONFIG.getUrl(API_CONFIG.endpoints.game.phishingEmails), {
            headers: API_CONFIG.getDefaultHeaders()
          });
          if (res.ok) {
            const data = await res.json();
            const emails = (data.emails || []).map(e => ({
              id: e.id,
              sender: e.sender,
              subject: e.subject,
              content: e.content,
              isPhishing: e.isPhishing,
              indicators: e.indicators || []
            }));
            if (emails.length) {
              setPhishingEmails(shuffleArray(emails));
              return;
            }
          }
          // no content available
          setNoGameContent(true);
          setPhishingEmails([]);
        } catch (e) {
          setNoGameContent(true);
          setPhishingEmails([]);
        }
      })();
    } else if (selectedGame === 'hacker-hunter' && gameState === 'playing') {
      generateHackers();
    }
  }, [selectedGame, gameState]);

  // Load user's scenario scores from DB (fallback to local high scores if not logged in)
  useEffect(() => {
    (async () => {
      try {
        if (userData.token && !userData.isGuest) {
          const result = await ApiService.progress.getScenarioCompletions(userData.token);
          const completionsRaw = result?.completions || result?.data?.completions || [];
          const completions = Array.isArray(completionsRaw) ? completionsRaw : Object.values(completionsRaw || {});
          const map = {};
          completions.forEach(c => {
            map[c.scenarioKey] = c.score ?? 0;
          });
          setUserScenarioScores(map);
        } else {
          const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
          setUserScenarioScores(gameScores);
        }
      } catch (e) {
        const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
        setUserScenarioScores(gameScores);
      }
    })();
  }, [gameState]);

  

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateHackers = () => {
    const newHackers = [];
    for (let i = 0; i < 5 + level; i++) {
      newHackers.push({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        type: Math.random() > 0.7 ? 'malicious' : 'safe',
        clicked: false
      });
    }
    setHackers(newHackers);
  };

  const startGame = (gameId) => {
    setSelectedGame(gameId);
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setGameStartTime(Date.now()); // Record start time
    setCurrentEmail(0);
    setClickedHackers([]);
  };

  const pauseGame = () => {
    setGameState('paused');
  };

  const resumeGame = () => {
    setGameState('playing');
  };

  const endGame = () => {
    setGameState('completed');
    
    // Record game completion
    if (selectedGame) {
      const finalScore = scoreRef.current;
      recordGameCompletion(selectedGame, finalScore);
    }
    
    // Save score to localStorage
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    const gameKey = selectedGame;
    const finalScoreForLocal = scoreRef.current;
    if (!gameScores[gameKey] || finalScoreForLocal > gameScores[gameKey]) {
      gameScores[gameKey] = finalScoreForLocal;
      localStorage.setItem('gameScores', JSON.stringify(gameScores));
      toast({
        title: "New High Score!",
        description: `You scored ${finalScoreForLocal} points in ${games.find(g => g.id === selectedGame)?.title}!`
      });
    }
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedGame(null);
    setScore(0);
    setTimeLeft(60);
    setLevel(1);
    setCurrentEmail(0);
    setClickedHackers([]);
  };

  const handlePhishingAnswer = (isPhishing) => {
    const email = phishingEmails[currentEmail];
    const correct = email.isPhishing === isPhishing;
    
    if (correct) {
      setScore((prev) => prev + 1);
      toast({
        title: "Correct!",
        description: isPhishing ? "You spotted the phishing email!" : "You correctly identified this as safe!",
        variant: "default"
      });
    } else {
      toast({
        title: "Incorrect",
        description: isPhishing ? "This was actually a safe email." : "This was a phishing attempt!",
        variant: "destructive"
      });
    }

    setTimeout(() => {
      if (currentEmail < phishingEmails.length - 1) {
        setCurrentEmail(currentEmail + 1);
      } else {
        // No levels for phishing: finish after answering all questions from DB
        endGame();
      }
    }, 1500);
  };

  const handleHackerClick = (hackerId) => {
    const hacker = hackers.find(h => h.id === hackerId);
    if (!hacker || clickedHackers.includes(hackerId)) return;

    setClickedHackers([...clickedHackers, hackerId]);

    if (hacker.type === 'malicious') {
      setScore(score + 5);
      toast({
        title: "Good catch!",
        description: "You stopped a cyber attack!",
        variant: "default"
      });
    } else {
      setScore(Math.max(0, score - 2));
      toast({
        title: "Oops!",
        description: "That was a legitimate user.",
        variant: "destructive"
      });
    }

    // Generate new hackers when all are clicked
    if (clickedHackers.length + 1 >= hackers.length) {
      setTimeout(() => {
        generateHackers();
        setClickedHackers([]);
        setLevel(level + 1);
      }, 1000);
    }
  };

  const renderGameMenu = () => (
    <div className="grid md:grid-cols-2 gap-6">
      {games.map((game) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer"
          onClick={() => startGame(game.id)}
        >
          <Card className="glass-effect cyber-border hover:glow-effect transition-all duration-300 h-full">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color} glow-effect`}>
                  <game.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${game.color} text-white`}>
                  {game.difficulty}
                </span>
              {userScenarioScores[game.id] !== undefined && (
                <span className="text-xs px-2 py-1 rounded-full bg-muted/30 border">
                  Your Score: {userScenarioScores[game.id]}
                </span>
              )}
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderPhishingGame = () => {
    if (noGameContent) {
      return (
        <div className="space-y-6">
          <Card className="glass-effect cyber-border max-w-md mx-auto text-center">
            <CardHeader>
              <CardTitle className="text-xl">No game content added yet</CardTitle>
              <CardDescription>
                The phishing email entries are not available in the database.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }
    if (!phishingEmails.length) return null;
    
    const email = phishingEmails[currentEmail];
    
    return (
      <div className="space-y-6">
        <Card className="glass-effect cyber-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email #{currentEmail + 1}</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-cyan-400">{timeLeft}s</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="font-mono text-yellow-400">{score}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/20 border">
                <div className="text-sm text-muted-foreground mb-2">From: {email.sender}</div>
                <div className="font-semibold mb-3">Subject: {email.subject}</div>
                <div className="text-sm">{email.content}</div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handlePhishingAnswer(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                >
                  🎣 Phishing
                </Button>
                <Button
                  onClick={() => handlePhishingAnswer(false)}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  ✅ Safe
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderHackerGame = () => (
    <div className="space-y-6">
      <Card className="glass-effect cyber-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catch the Hackers!</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">Level {level}</div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-cyan-400">{timeLeft}s</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="font-mono text-yellow-400">{score}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full game-field-height bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden border-2 border-purple-500/30">
            <img 
              className="w-full h-full object-contain opacity-40" 
              alt="Cyber logo background"
              src="/models/cyberLogo.png" />
            
            {hackers.map((hacker) => (
              <motion.button
                key={hacker.id}
                className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  clickedHackers.includes(hacker.id)
                    ? hacker.type === 'malicious'
                      ? 'bg-red-500 border-red-400'
                      : 'bg-green-500 border-green-400'
                    : hacker.type === 'malicious'
                    ? 'bg-red-500/70 border-red-400 hover:bg-red-500 pulse-glow'
                    : 'bg-blue-500/70 border-blue-400 hover:bg-blue-500'
                }`}
                style={{
                  left: `${hacker.x}%`,
                  top: `${hacker.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={() => handleHackerClick(hacker.id)}
                disabled={clickedHackers.includes(hacker.id)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {hacker.type === 'malicious' ? '💀' : '👤'}
              </motion.button>
            ))}
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="glass-effect rounded-lg p-3">
                <p className="text-sm text-center">
                  Click on the red hackers (💀) to stop attacks! Avoid clicking innocent users (👤).
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGameContent = () => {
    if (selectedGame === 'phishing-detector') {
      return renderPhishingGame();
    } else if (selectedGame === 'hacker-hunter') {
      return renderHackerGame();
    }
    return null;
  };

  const renderGameCompleted = () => {
    const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
    const highScore = gameScores[selectedGame] || 0;
    const isNewRecord = score >= highScore;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="glass-effect cyber-border text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4"
            >
              <Trophy className={`w-16 h-16 ${isNewRecord ? 'text-yellow-400' : 'text-purple-400'}`} />
            </motion.div>
            <CardTitle className="text-3xl cyber-text">Game Over!</CardTitle>
            <CardDescription className="text-lg">
              {games.find(g => g.id === selectedGame)?.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="text-6xl font-bold cyber-text mb-2">
                {score}
              </div>
              <p className="text-xl text-muted-foreground">
                Final Score
              </p>
              {isNewRecord && (
                <p className="text-yellow-400 font-medium mt-2">🎉 New High Score!</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => startGame(selectedGame)}
                variant="outline"
                className="glass-effect"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={resetGame}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Choose Game
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="page-container">
      <div className="max-w-6xl mx-auto">
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
            Cybersecurity Games
          </h1>
          <p className="text-muted-foreground">
            Learn cybersecurity through interactive games and challenges
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {gameState === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGameMenu()}
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {games.find(g => g.id === selectedGame)?.title}
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={pauseGame}
                    className="glass-effect"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetGame}
                    className="glass-effect"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Quit
                  </Button>
                </div>
              </div>
              {renderGameContent()}
            </motion.div>
          )}

          {gameState === 'paused' && (
            <motion.div
              key="paused"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <Card className="glass-effect cyber-border max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl">Game Paused</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-4xl font-bold cyber-text">{score}</div>
                  <p className="text-muted-foreground">Current Score</p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={resumeGame}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Resume
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetGame}
                      className="glass-effect"
                    >
                      Quit Game
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {gameState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGameCompleted()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Game;