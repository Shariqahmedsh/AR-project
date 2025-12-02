// Progress tracking utility for frontend
export class ProgressTracker {
  constructor() {
    this.storageKey = 'ar_cyber_progress';
  }

  // Get progress from localStorage
  getProgress() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
    }
    
    return {
      scenariosCompleted: 0,
      quizzesPassed: 0,
      totalScore: 0,
      completedScenarios: [],
      quizAttempts: []
    };
  }

  // Save progress to localStorage
  saveProgress(progress) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }

  // Record quiz attempt
  recordQuizAttempt(categoryKey, score, totalQuestions, passed, timeSpent) {
    const progress = this.getProgress();
    
    const attempt = {
      id: Date.now(),
      categoryKey,
      score,
      totalQuestions,
      passed,
      timeSpent,
      timestamp: new Date().toISOString()
    };
    
    progress.quizAttempts.push(attempt);
    
    if (passed) {
      progress.quizzesPassed++;
    }
    
    progress.totalScore += score;
    
    this.saveProgress(progress);
    return attempt;
  }

  // Record scenario completion
  recordScenarioCompletion(scenarioKey, score, timeSpent) {
    const progress = this.getProgress();
    
    if (!progress.completedScenarios.includes(scenarioKey)) {
      progress.completedScenarios.push(scenarioKey);
      progress.scenariosCompleted++;
    }
    
    this.saveProgress(progress);
    return true;
  }

  // Get progress summary
  getProgressSummary() {
    const progress = this.getProgress();
    return {
      scenariosCompleted: progress.scenariosCompleted,
      quizzesPassed: progress.quizzesPassed,
      totalScore: progress.totalScore,
      completedScenarios: progress.completedScenarios,
      recentQuizAttempts: progress.quizAttempts.slice(-5) // Last 5 attempts
    };
  }

  // Reset progress (for testing)
  resetProgress() {
    localStorage.removeItem(this.storageKey);
  }
}

// Create global instance
export const progressTracker = new ProgressTracker();
