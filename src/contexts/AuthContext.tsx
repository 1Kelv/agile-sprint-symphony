
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AuthService from '@/services/AuthService';
import ProfileService from '@/services/ProfileService';
import { toast } from '@/hooks/use-toast';

// Context for authentication state and methods
const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Handle auth changes
  useEffect(() => {
    // Initial session check 
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          const profileData = await ProfileService.getProfile(data.session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          const profileData = await ProfileService.getProfile(newSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      const { error, data } = await AuthService.signIn(email, password);
      
      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      if (data?.user) {
        const profileData = await ProfileService.getProfile(data.user.id);
        setProfile(profileData);
      }
      
      toast({
        title: "Signed in successfully",
      });
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signUp = async (email, password, username) => {
    try {
      setIsLoading(true);
      const { error, data } = await AuthService.signUp(email, password, username);
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      if (data?.user) {
        // Create profile
        await ProfileService.createProfile({
          id: data.user.id,
          username,
          avatar_url: null,
        });
        
        toast({
          title: "Account created successfully",
          description: "Please check your email to confirm your account.",
        });
      }
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setProfile(null);
      
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email) => {
    try {
      setIsLoading(true);
      // Fixed: Use the correct parameter structure for resetPassword
      const { error } = await AuthService.resetPassword(email);
      
      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
      
      return { error: null };
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
