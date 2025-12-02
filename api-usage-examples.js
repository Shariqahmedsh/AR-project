// API Usage Examples with Logging
// This file demonstrates how to use the new API service with comprehensive logging

import { ApiService } from './api.js';

// Example 1: User Authentication Flow
export const authExamples = {
  // User registration with phone verification
  async registerUser(userData) {
    try {
      console.log('🚀 Starting user registration...');
      
      // Step 1: Register user
      const registerResponse = await ApiService.auth.register({
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        name: userData.name
      });
      
      console.log('✅ User registered successfully:', registerResponse);
      
      // Step 2: Verify phone number
      const verifyResponse = await ApiService.auth.verifyPhone({
        phoneNumber: userData.phoneNumber,
        code: userData.verificationCode
      });
      
      console.log('✅ Phone verified successfully:', verifyResponse);
      
      // Step 3: Set password
      const passwordResponse = await ApiService.auth.changePassword({
        currentPassword: registerResponse.tempPassword,
        newPassword: userData.password
      }, registerResponse.token);
      
      console.log('✅ Password set successfully:', passwordResponse);
      
      return {
        success: true,
        message: 'User registration completed successfully',
        token: registerResponse.token
      };
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw error;
    }
  },

  // User login
  async loginUser(credentials) {
    try {
      console.log('🚀 Starting user login...');
      
      const response = await ApiService.auth.login({
        username: credentials.username,
        password: credentials.password
      });
      
      console.log('✅ Login successful:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  },

  // Forgot password flow
  async forgotPassword(email) {
    try {
      console.log('🚀 Starting forgot password flow...');
      
      const response = await ApiService.auth.forgotPassword({
        email: email
      });
      
      console.log('✅ Password reset code sent:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      throw error;
    }
  }
};

// Example 2: Admin Operations
export const adminExamples = {
  // Get all users (admin only)
  async getAllUsers(adminToken) {
    try {
      console.log('🚀 Fetching all users...');
      
      const response = await ApiService.auth.admin.getUsers(adminToken);
      
      console.log('✅ Users fetched successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      throw error;
    }
  },

  // Delete user (admin only)
  async deleteUser(userId, adminToken) {
    try {
      console.log('🚀 Deleting user...');
      
      const response = await ApiService.auth.admin.deleteUser(userId, adminToken);
      
      console.log('✅ User deleted successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      throw error;
    }
  }
};

// Example 3: Quiz Operations
export const quizExamples = {
  // Get quiz categories
  async getQuizCategories() {
    try {
      console.log('🚀 Fetching quiz categories...');
      
      const response = await ApiService.quiz.getCategories();
      
      console.log('✅ Quiz categories fetched:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to fetch quiz categories:', error);
      throw error;
    }
  },

  // Get quiz by category
  async getQuizByCategory(categoryKey) {
    try {
      console.log('🚀 Fetching quiz for category:', categoryKey);
      
      const response = await ApiService.quiz.getByCategory(categoryKey);
      
      console.log('✅ Quiz fetched successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to fetch quiz:', error);
      throw error;
    }
  },

  // Create quiz category (admin only)
  async createQuizCategory(categoryData, adminToken) {
    try {
      console.log('🚀 Creating quiz category...');
      
      const response = await ApiService.quiz.admin.upsertCategory(categoryData, adminToken);
      
      console.log('✅ Quiz category created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create quiz category:', error);
      throw error;
    }
  },

  // Create quiz question (admin only)
  async createQuizQuestion(questionData, adminToken) {
    try {
      console.log('🚀 Creating quiz question...');
      
      const response = await ApiService.quiz.admin.createQuestion(questionData, adminToken);
      
      console.log('✅ Quiz question created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create quiz question:', error);
      throw error;
    }
  }
};

// Example 4: Game Operations
export const gameExamples = {
  // Get phishing emails
  async getPhishingEmails() {
    try {
      console.log('🚀 Fetching phishing emails...');
      
      const response = await ApiService.game.getPhishingEmails();
      
      console.log('✅ Phishing emails fetched:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to fetch phishing emails:', error);
      throw error;
    }
  },

  // Create phishing email (admin only)
  async createPhishingEmail(emailData, adminToken) {
    try {
      console.log('🚀 Creating phishing email...');
      
      const response = await ApiService.game.admin.createPhishingEmail(emailData, adminToken);
      
      console.log('✅ Phishing email created:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to create phishing email:', error);
      throw error;
    }
  }
};

// Example 5: Progress Tracking
export const progressExamples = {
  // Get user progress
  async getUserProgress(userToken) {
    try {
      console.log('🚀 Fetching user progress...');
      
      const response = await ApiService.progress.getProgress(userToken);
      
      console.log('✅ User progress fetched:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to fetch user progress:', error);
      throw error;
    }
  },

  // Record quiz attempt
  async recordQuizAttempt(attemptData, userToken) {
    try {
      console.log('🚀 Recording quiz attempt...');
      
      const response = await ApiService.progress.recordQuizAttempt(attemptData, userToken);
      
      console.log('✅ Quiz attempt recorded:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to record quiz attempt:', error);
      throw error;
    }
  },

  // Record scenario completion
  async recordScenarioCompletion(completionData, userToken) {
    try {
      console.log('🚀 Recording scenario completion...');
      
      const response = await ApiService.progress.recordScenarioCompletion(completionData, userToken);
      
      console.log('✅ Scenario completion recorded:', response);
      return response;
      
    } catch (error) {
      console.error('❌ Failed to record scenario completion:', error);
      throw error;
    }
  }
};

// Example 6: Complete User Journey
export const completeUserJourney = {
  async fullUserFlow() {
    try {
      console.log('🚀 Starting complete user journey...');
      
      // 1. Register user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        phoneNumber: '1234567890',
        name: 'Test User',
        password: 'SecurePassword123!',
        verificationCode: '123456'
      };
      
      const registrationResult = await authExamples.registerUser(userData);
      console.log('✅ Registration completed');
      
      // 2. Login user
      const loginResult = await authExamples.loginUser({
        username: userData.username,
        password: userData.password
      });
      console.log('✅ Login completed');
      
      // 3. Get quiz categories
      const categories = await quizExamples.getQuizCategories();
      console.log('✅ Quiz categories fetched');
      
      // 4. Get phishing emails
      const phishingEmails = await gameExamples.getPhishingEmails();
      console.log('✅ Phishing emails fetched');
      
      // 5. Get user progress
      const progress = await progressExamples.getUserProgress(loginResult.token);
      console.log('✅ User progress fetched');
      
      console.log('🎉 Complete user journey finished successfully!');
      
      return {
        success: true,
        registration: registrationResult,
        login: loginResult,
        categories: categories,
        phishingEmails: phishingEmails,
        progress: progress
      };
      
    } catch (error) {
      console.error('❌ Complete user journey failed:', error);
      throw error;
    }
  }
};

// Export all examples
export default {
  auth: authExamples,
  admin: adminExamples,
  quiz: quizExamples,
  game: gameExamples,
  progress: progressExamples,
  completeJourney: completeUserJourney
};
