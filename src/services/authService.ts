// Prototype-only local authentication. Replace with server-side authentication for production.
import { localAuthService } from './localAuthService';

export const authService = {
  getCurrentSession() {
    return localAuthService.getStoredSession();
  },
  signOut() {
    localAuthService.signOut();
  }
};
