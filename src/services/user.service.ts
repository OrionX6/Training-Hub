import { supabase } from '../config/supabase';
import { User, UserRole } from '../types';

class UserService {
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at');
    
    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
    
    return data;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User> {
    // First verify the current user is a super admin
    const { data: currentUser, error: authError } = await supabase.auth.getUser();
    if (authError) throw new Error('Authentication error');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.user.id)
      .single();

    if (userError) throw new Error('Failed to verify user role');
    if (userData.role !== 'super_admin') throw new Error('Unauthorized: Only super admins can modify roles');

    // Update user role
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }

    return data;
  }

  async getUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }

    return data;
  }

  // Add user statistics
  async getUserStats(userId: string): Promise<{
    totalQuizzesTaken: number;
    averageScore: number;
    studyGuidesAccessed: number;
  }> {
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_id: userId
    });

    if (error) {
      console.error('Error fetching user stats:', error);
      throw new Error('Failed to fetch user statistics');
    }

    return data || {
      totalQuizzesTaken: 0,
      averageScore: 0,
      studyGuidesAccessed: 0
    };
  }
}

export const userService = new UserService();
