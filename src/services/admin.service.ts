import { supabase } from '../config/supabase';
import { User, UserRole } from '../types';

interface Stats {
  totalQuizzes: number;
  passRate: number;
  averageScore: number;
  averageTime: number;
}

class AdminService {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }

    return data;
  }

  // Alias for getUsers to maintain backward compatibility
  async getAllUsers(): Promise<User[]> {
    return this.getUsers();
  }

  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  async resetUserPassword(userId: string): Promise<string> {
    const tempPassword = this.generateTempPassword();

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: tempPassword,
      user_metadata: { password_change_required: true },
    });

    if (error) {
      console.error('Error resetting password:', error);
      throw new Error('Failed to reset password');
    }

    return tempPassword;
  }

  async getDashboardStats(
    filters: {
      startDate?: string;
      endDate?: string;
      username?: string;
      supervisor?: string;
      market?: string;
    } = {},
  ): Promise<Stats> {
    const { data: stats, error } = await supabase.rpc('get_dashboard_stats', {
      start_date: filters.startDate,
      end_date: filters.endDate,
      username: filters.username,
      user_supervisor: filters.supervisor,
      user_market: filters.market,
    });

    if (error) {
      console.error('Error fetching dashboard stats:', error);
      console.log('Full error response:', JSON.stringify(error, null, 2));
      console.log('Attempted params:', {
        start_date: filters.startDate,
        end_date: filters.endDate,
        username: filters.username,
        user_supervisor: filters.supervisor,
        user_market: filters.market,
      });
      throw new Error(`Failed to fetch dashboard stats: ${error.message}`);
    }

    return {
      totalQuizzes: stats.total_quizzes || 0,
      passRate: stats.pass_rate || 0,
      averageScore: stats.average_score || 0,
      averageTime: stats.average_time || 0,
    };
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    return Array.from(crypto.getRandomValues(new Uint8Array(12)))
      .map(byte => chars[byte % chars.length])
      .join('');
  }
}

export const adminService = new AdminService();
