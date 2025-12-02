// API Configuration with Request/Response Logging
const API_CONFIG = {
  // Get API URL from environment variables or use default
  baseURL: import.meta.env.VITE_API_URL || 'https://ar-project-backend.onrender.com',
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      profile: '/api/auth/profile',
      changePassword: '/api/auth/change-password',
      verifyPhone: '/api/auth/verify-phone',
      resendPhoneCode: '/api/auth/resend-phone-code',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password',
      adminUsers: '/api/auth/admin/users',
      adminDeleteUser: (id) => `/api/auth/admin/user/${id}`
    },
    users: {
      all: '/api/users/',
      admin: '/api/users/admin/all'
    },
    quiz: {
      categories: '/api/quiz/categories',
      byCategoryKey: (key) => `/api/quiz/category/${key}`,
      admin: {
        upsertCategory: '/api/quiz/admin/category',
        createQuestion: '/api/quiz/admin/question',
        getAllQuestions: '/api/quiz/admin/questions',
        deleteQuestion: (id) => `/api/quiz/admin/question/${id}`,
        updateQuestion: (id) => `/api/quiz/admin/question/${id}`
      }
    },
    game: {
      phishingEmails: '/api/game/phishing-emails',
      admin: {
        createPhishingEmail: '/api/game/admin/phishing-email',
        updatePhishingEmail: (id) => `/api/game/admin/phishing-email/${id}`,
        listPhishingEmails: '/api/game/admin/phishing-emails',
        deletePhishingEmail: (id) => `/api/game/admin/phishing-email/${id}`
      }
    },
    progress: {
      getProgress: '/api/progress/progress',
      recordQuizAttempt: '/api/progress/quiz-attempt',
      recordScenarioCompletion: '/api/progress/scenario-completion',
      getQuizAttempts: '/api/progress/quiz-attempts',
      getScenarioCompletions: '/api/progress/scenario-completions'
    }
  },
  
  // Helper function to get full URL
  getUrl: (endpoint) => {
    return `${API_CONFIG.baseURL}${endpoint}`;
  },
  
  // Helper function to get auth headers
  getAuthHeaders: (token) => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },
  
  // Helper function to get default headers
  getDefaultHeaders: () => {
    return {
      'Content-Type': 'application/json'
    };
  }
};

// Logging utility functions
const Logger = {
  // Format timestamp for logs
  getTimestamp: () => {
    return new Date().toISOString();
  },
  
  // Sanitize sensitive data from request/response
  sanitizeData: (data) => {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'authorization', 'authToken', 'code'];
    
    // Remove sensitive fields
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    // Handle nested objects
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = Logger.sanitizeData(sanitized[key]);
      }
    });
    
    return sanitized;
  },
  
  // Log request
  logRequest: (method, url, headers, body) => {
    const timestamp = Logger.getTimestamp();
    const sanitizedBody = body ? Logger.sanitizeData(body) : null;
    const sanitizedHeaders = headers ? Logger.sanitizeData(headers) : null;
    
    console.group(`🌐 [${timestamp}] API Request`);
    console.log(`📤 ${method} ${url}`);
    if (sanitizedHeaders) {
      console.log('📋 Headers:', sanitizedHeaders);
    }
    if (sanitizedBody) {
      console.log('📦 Body:', sanitizedBody);
    }
    console.groupEnd();
  },
  
  // Log response
  logResponse: (method, url, status, statusText, data, duration) => {
    const timestamp = Logger.getTimestamp();
    const sanitizedData = data ? Logger.sanitizeData(data) : null;
    
    console.group(`🌐 [${timestamp}] API Response`);
    console.log(`📥 ${method} ${url}`);
    console.log(`📊 Status: ${status} ${statusText}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    if (sanitizedData) {
      console.log('📦 Response:', sanitizedData);
    }
    console.groupEnd();
  },
  
  // Log error
  logError: (method, url, error, duration) => {
    const timestamp = Logger.getTimestamp();
    
    console.group(`❌ [${timestamp}] API Error`);
    console.log(`📤 ${method} ${url}`);
    console.log(`⏱️ Duration: ${duration}ms`);
    console.error('Error:', error);
    console.groupEnd();
  }
};

// Enhanced fetch function with logging
const apiFetch = async (url, options = {}) => {
  const startTime = performance.now();
  const method = options.method || 'GET';
  
  // Log request
  Logger.logRequest(method, url, options.headers, options.body);
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include' // Include cookies for refresh tokens
    });
    
    const duration = Math.round(performance.now() - startTime);
    
    // Parse response
    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError);
      }
    }
    
    // Log response
    Logger.logResponse(method, url, response.status, response.statusText, data, duration);
    
    // Handle non-2xx responses
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    return { data, response };
    
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    Logger.logError(method, url, error, duration);
    throw error;
  }
};

// API Service Functions with Logging
const ApiService = {
  // Authentication endpoints
  auth: {
    // User login
    login: async (credentials) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.login);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(credentials)
      });
      return data;
    },

    // User registration
    register: async (userData) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.register);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(userData)
      });
      return data;
    },

    // Phone verification
    verifyPhone: async (verificationData) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.verifyPhone);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(verificationData)
      });
      return data;
    },

    // Resend phone verification code
    resendPhoneCode: async (phoneData) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resendPhoneCode);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(phoneData)
      });
      return data;
    },

    // Change password
    changePassword: async (passwordData, token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.changePassword);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(token),
        body: JSON.stringify(passwordData)
      });
      return data;
    },

    // Forgot password
    forgotPassword: async (emailData) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.forgotPassword);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(emailData)
      });
      return data;
    },

    // Reset password
    resetPassword: async (resetData) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.resetPassword);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getDefaultHeaders(),
        body: JSON.stringify(resetData)
      });
      return data;
    },

    // Get user profile
    getProfile: async (token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.profile);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders(token)
      });
      return data;
    },

    // Admin endpoints
    admin: {
      // Get all users (admin only)
      getUsers: async (token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.adminUsers);
        const { data } = await apiFetch(url, {
          method: 'GET',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      },

      // Delete user (admin only)
      deleteUser: async (userId, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.auth.adminDeleteUser(userId));
        const { data } = await apiFetch(url, {
          method: 'DELETE',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      }
    }
  },

  // Quiz endpoints
  quiz: {
    // Get quiz categories
    getCategories: async () => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.categories);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });
      return data;
    },

    // Get quiz by category
    getByCategory: async (categoryKey) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.byCategoryKey(categoryKey));
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });
      return data;
    },

    // Admin quiz endpoints
    admin: {
      // Create/update category
      upsertCategory: async (categoryData, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.admin.upsertCategory);
        const { data } = await apiFetch(url, {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(token),
          body: JSON.stringify(categoryData)
        });
        return data;
      },

      // Create question
      createQuestion: async (questionData, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.admin.createQuestion);
        const { data } = await apiFetch(url, {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(token),
          body: JSON.stringify(questionData)
        });
        return data;
      },

      // Get all questions
      getAllQuestions: async (token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.admin.getAllQuestions);
        const { data } = await apiFetch(url, {
          method: 'GET',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      },

      // Update question
      updateQuestion: async (questionId, questionData, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.admin.updateQuestion(questionId));
        const { data } = await apiFetch(url, {
          method: 'PUT',
          headers: API_CONFIG.getAuthHeaders(token),
          body: JSON.stringify(questionData)
        });
        return data;
      },

      // Delete question
      deleteQuestion: async (questionId, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.quiz.admin.deleteQuestion(questionId));
        const { data } = await apiFetch(url, {
          method: 'DELETE',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      }
    }
  },

  // Game endpoints
  game: {
    // Get phishing emails
    getPhishingEmails: async () => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.game.phishingEmails);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getDefaultHeaders()
      });
      return data;
    },

    // Admin game endpoints
    admin: {
      // Create phishing email
      createPhishingEmail: async (emailData, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.game.admin.createPhishingEmail);
        const { data } = await apiFetch(url, {
          method: 'POST',
          headers: API_CONFIG.getAuthHeaders(token),
          body: JSON.stringify(emailData)
        });
        return data;
      },

      // Update phishing email
      updatePhishingEmail: async (emailId, emailData, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.game.admin.updatePhishingEmail(emailId));
        const { data } = await apiFetch(url, {
          method: 'PATCH',
          headers: API_CONFIG.getAuthHeaders(token),
          body: JSON.stringify(emailData)
        });
        return data;
      },

      // Get all phishing emails
      getAllPhishingEmails: async (token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.game.admin.listPhishingEmails);
        const { data } = await apiFetch(url, {
          method: 'GET',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      },

      // Delete phishing email
      deletePhishingEmail: async (emailId, token) => {
        const url = API_CONFIG.getUrl(API_CONFIG.endpoints.game.admin.deletePhishingEmail(emailId));
        const { data } = await apiFetch(url, {
          method: 'DELETE',
          headers: API_CONFIG.getAuthHeaders(token)
        });
        return data;
      }
    }
  },

  // Progress endpoints
  progress: {
    // Get user progress
    getProgress: async (token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.progress.getProgress);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders(token)
      });
      return data;
    },

    // Record quiz attempt
    recordQuizAttempt: async (attemptData, token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.progress.recordQuizAttempt);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(token),
        body: JSON.stringify(attemptData)
      });
      return data;
    },

    // Record scenario completion
    recordScenarioCompletion: async (completionData, token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.progress.recordScenarioCompletion);
      const { data } = await apiFetch(url, {
        method: 'POST',
        headers: API_CONFIG.getAuthHeaders(token),
        body: JSON.stringify(completionData)
      });
      return data;
    },

    // Get quiz attempts
    getQuizAttempts: async (token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.progress.getQuizAttempts);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders(token)
      });
      return data;
    },

    // Get scenario completions
    getScenarioCompletions: async (token) => {
      const url = API_CONFIG.getUrl(API_CONFIG.endpoints.progress.getScenarioCompletions);
      const { data } = await apiFetch(url, {
        method: 'GET',
        headers: API_CONFIG.getAuthHeaders(token)
      });
      return data;
    }
  }
};

// Export both the config and the service
export { API_CONFIG, ApiService, Logger };
export default API_CONFIG;
