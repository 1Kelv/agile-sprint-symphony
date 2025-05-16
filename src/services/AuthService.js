
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Auth service for handling authentication operations
export class AuthService {
  /**
   * Sign in a user with email and password
   */
  static async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check if the error is about unconfirmed email
        if (error.message.includes("Email not confirmed")) {
          toast({
            title: "Email not verified",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return { error, data: null };
      } else {
        toast({
          title: "Welcome back!",
        });
        return { error: null, data };
      }
    } catch (error) {
      console.error("Error signing in:", error);
      toast({
        title: "Sign in failed",
        variant: "destructive",
      });
      return { error, data: null };
    }
  }

  /**
   * Sign up a new user
   */
  static async signUp(email, password, username) {
    try {
      // Register the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      return { error: null, data: authData };
    } catch (error) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        variant: "destructive",
      });
      return { error, data: null };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
      });
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        variant: "destructive",
      });
      return { error };
    }
  }
  
  /**
   * Reset user password
   * Takes a single email parameter
   */
  static async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error resetting password:", error);
      return { error };
    }
  }
}

export default AuthService;
