import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Define the storage key
const USERS_STORAGE_KEY = 'training_hub_users';

// Define the super admin email
const SUPER_ADMIN_EMAIL = 'nojs2115@yahoo.com';

class LocalUserService {
  private users: User[] = [];
  private initialized = false;

  constructor() {
    this.loadFromStorage();
    
    // Ensure super admin exists
    this.ensureSuperAdmin();
  }

  private loadFromStorage(): void {
    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        this.users = JSON.parse(storedUsers);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Error loading users from local storage:', error);
      this.users = [];
      this.initialized = true;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users to local storage:', error);
    }
  }

  private ensureSuperAdmin(): void {
    // Check if super admin exists
    const superAdminExists = this.users.some(user => 
      user.email.toLowerCase() === SUPER_ADMIN_EMAIL && user.role === 'super_admin'
    );

    // If not, create it
    if (!superAdminExists) {
      const superAdmin: User = {
        id: uuidv4(),
        email: SUPER_ADMIN_EMAIL,
        role: 'super_admin',
        password_change_required: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      this.users.push(superAdmin);
      this.saveToStorage();
      console.log('Super admin created in local storage');
    }
  }

  async getAllUsers(): Promise<User[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.users];
  }

  async getUser(userId: string): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return { ...user };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return user ? { ...user } : null;
  }

  async createUser(email: string, password: string, role: UserRole = 'user'): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Check if user already exists
    const existingUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser: User = {
      id: uuidv4(),
      email,
      role,
      password_change_required: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    this.users.push(newUser);
    this.saveToStorage();
    
    return { ...newUser };
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Update user role
    this.users[userIndex] = {
      ...this.users[userIndex],
      role,
      updated_at: new Date().toISOString(),
    };
    
    this.saveToStorage();
    
    return { ...this.users[userIndex] };
  }

  async getUserStats(userId: string): Promise<{
    totalQuizzesTaken: number;
    averageScore: number;
    studyGuidesAccessed: number;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Generate mock stats
    return {
      totalQuizzesTaken: Math.floor(Math.random() * 10),
      averageScore: Math.floor(Math.random() * 40) + 60, // 60-100
      studyGuidesAccessed: Math.floor(Math.random() * 5),
    };
  }

  async deleteUser(userId: string): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Don't allow deleting super admin
    const user = this.users.find(u => u.id === userId);
    if (user && user.email.toLowerCase() === SUPER_ADMIN_EMAIL) {
      throw new Error('Cannot delete super admin');
    }
    
    this.users = this.users.filter(u => u.id !== userId);
    this.saveToStorage();
  }

  // For testing/debugging
  clearAllUsers(): void {
    this.users = [];
    this.saveToStorage();
    this.ensureSuperAdmin(); // Make sure super admin still exists
  }
}

export const localUserService = new LocalUserService();
