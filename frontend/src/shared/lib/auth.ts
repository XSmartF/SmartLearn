// Lightweight auth facade placeholder. Replace with real provider (e.g., Supabase / Firebase / NextAuth API)

import type { UserProfile, UserID } from './models';
import { genId } from './models';

export interface AuthAdapter {
  getCurrentUser(): Promise<UserProfile | null>;
  signInEmailPassword(email: string, password: string): Promise<UserProfile>;
  signUpEmailPassword(email: string, password: string, displayName?: string): Promise<UserProfile>;
  signOut(): Promise<void>;
  onAuthStateChanged(cb: (user: UserProfile | null) => void): () => void;
}

interface MemoryAuthUser extends UserProfile { passwordHash: string; }

export class InMemoryAuth implements AuthAdapter {
  private users: Map<UserID, MemoryAuthUser> = new Map();
  private emailIndex: Map<string, UserID> = new Map();
  private current: UserProfile | null = null;
  private listeners: Set<(u: UserProfile | null) => void> = new Set();

  private notify() { this.listeners.forEach(l => l(this.current)); }

  async getCurrentUser() { return this.current; }

  async signInEmailPassword(email: string, password: string) {
    const id = this.emailIndex.get(email.toLowerCase());
    if (!id) throw new Error('User not found');
    const u = this.users.get(id)!;
    if (u.passwordHash !== password) throw new Error('Invalid credentials');
    this.current = { ...u };
    this.notify();
    return this.current;
  }

  async signUpEmailPassword(email: string, password: string, displayName?: string) {
    if (this.emailIndex.has(email.toLowerCase())) throw new Error('Email already registered');
    const now = new Date().toISOString();
    const user: MemoryAuthUser = {
      id: genId('user'),
      email,
      displayName: displayName ?? email.split('@')[0],
      createdAt: now,
      updatedAt: now,
      passwordHash: password, // DO NOT use plain text in production
    };
    this.users.set(user.id, user);
    this.emailIndex.set(email.toLowerCase(), user.id);
    this.current = { ...user };
    this.notify();
    return this.current;
  }

  async signOut() {
    this.current = null;
    this.notify();
  }

  onAuthStateChanged(cb: (user: UserProfile | null) => void) {
    this.listeners.add(cb);
    cb(this.current);
    return () => this.listeners.delete(cb);
  }
}
