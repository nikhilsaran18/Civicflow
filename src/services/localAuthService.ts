// Prototype-only local authentication. Replace with server-side authentication for production.

export interface LocalAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface LocalSession {
  userId: string;
  email: string;
  fullName: string;
}

const USERS_KEY = 'civicflow_users';
const SESSION_KEY = 'civicflow_session';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const localAuthService = {
  getStoredUsers(): LocalAccount[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users: LocalAccount[]): void {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  getStoredSession(): LocalSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: LocalSession = JSON.parse(raw);
      const users = this.getStoredUsers();
      const match = users.find(u => u.id === session.userId && u.email.toLowerCase() === session.email.toLowerCase());
      if (!match) {
        this.clearSession();
        return null;
      }
      return { ...session, fullName: match.fullName };
    } catch {
      return null;
    }
  },

  saveSession(session: LocalSession): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  async signUp(fullName: string, email: string, pass: string): Promise<{ error: string | null }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const users = this.getStoredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { error: 'An account with this email already exists.' };
    }

    const passwordHash = await hashPassword(pass);
    const newAccount: LocalAccount = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName: cleanName,
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    users.push(newAccount);
    this.saveUsers(users);

    return { error: null };
  },

  async signIn(email: string, pass: string): Promise<{ error: string | null; session?: LocalSession }> {
    const cleanEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(pass);
    const users = this.getStoredUsers();

    const match = users.find(u => u.email.toLowerCase() === cleanEmail && u.passwordHash === passwordHash);

    if (!match) {
      return { error: 'Invalid email or password.' };
    }

    const session: LocalSession = {
      userId: match.id,
      email: match.email,
      fullName: match.fullName,
    };

    this.saveSession(session);
    return { error: null, session };
  },

  signOut(): void {
    this.clearSession();
  }
};
