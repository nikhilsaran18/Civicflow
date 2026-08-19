import { User } from '../types';
import { storageService } from './storageService';

const USERS_KEY = 'civicflow_users';
const CURRENT_USER_KEY = 'civicflow_current_user';

export const DEMO_USER: User = {
  id: 'user_demo_101',
  name: 'Arun Kumar',
  email: 'demo@civicflow.ai',
  preferredLanguage: 'en',
  isDemo: true,
};

export const authService = {
  getCurrentUser(): User | null {
    return storageService.getItem<User | null>(CURRENT_USER_KEY, DEMO_USER); // Default to Arun Kumar for seamless hackathon testing
  },

  login(email: string, password: string): User {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if Demo account
    if (cleanEmail === 'demo@civicflow.ai' && (password === 'demo123' || password.length >= 0)) {
      storageService.setItem(CURRENT_USER_KEY, DEMO_USER);
      return DEMO_USER;
    }

    const users = storageService.getItem<User[]>(USERS_KEY, [DEMO_USER]);
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      throw new Error('No user found with this email address. Try the Demo Account!');
    }

    storageService.setItem(CURRENT_USER_KEY, found);
    return found;
  },

  loginWithDemo(): User {
    storageService.setItem(CURRENT_USER_KEY, DEMO_USER);
    return DEMO_USER;
  },

  register(name: string, email: string, preferredLanguage: 'en' | 'ta' | 'hi' = 'en'): User {
    const cleanEmail = email.trim().toLowerCase();
    const users = storageService.getItem<User[]>(USERS_KEY, [DEMO_USER]);
    
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      preferredLanguage,
      isDemo: false
    };

    users.push(newUser);
    storageService.setItem(USERS_KEY, users);
    storageService.setItem(CURRENT_USER_KEY, newUser);

    return newUser;
  },

  logout(): void {
    storageService.removeItem(CURRENT_USER_KEY);
  }
};
