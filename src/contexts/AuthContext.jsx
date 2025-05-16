import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ProfileService from "@/services/ProfileService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  
  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider initializing...");
    setLoading(true);
    
    // First set up the auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(`Auth state changed: ${event}`, newSession ? "session exists" : "no session");
        
        // Handle synchronous state updates
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Fetch profile data asynchronously
        if (newSession?.user) {
          // Use setTimeout to avoid potential Supabase auth deadlocks
          setTimeout(async () => {
            try {
              const profileData = await ProfileService.getProfile(newSession.user.id);
              console.log("Profile data fetched:", profileData);
              setProfile(profileData);
            } catch (err) {
              console.error("Error loading profile:", err);
              setProfile(null);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      console.log("Got existing session:", existingSession ? "yes" : "no");
      
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        // Use setTimeout to avoid potential Supabase auth deadlocks
        setTimeout(async () => {
          try {
            const profileData = await ProfileService.getProfile(existingSession.user.id);
            console.log("Initial profile data:", profileData);
            setProfile(profileData);
          } catch (err) {
            console.error("Error loading initial profile:", err);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.error("Error getting session:", err);
      setLoading(false);
      setError(err);
    });
    
    return () => {
      console.log("Cleaning up auth subscription");
      try {
        subscription?.unsubscribe();
      } catch (err) {
        console.error("Error unsubscribing from auth state changes:", err);
      }
    };
  }, []);
  
  const signIn = async (email, password) => {
    try {
      console.log("Signing in with email:", email);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      console.log("Sign in successful:", data);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      return { success: true, data };
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      console.log("Signing out");
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setProfile(null);
      setUser(null);
      setSession(null);
      
      toast({
        title: "Signed out successfully",
      });
      
      console.log("Sign out completed successfully");
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  
  // Other auth methods can remain the same
  // ... keep existing code (signUp, resetPassword methods)

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        setProfile,
        signIn,
        signUp: async (email, password, metadata = {}) => {
          try {
            console.log("Signing up with email:", email);
            setLoading(true);
            
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: { data: metadata },
            });
            
            if (error) throw error;
            
            // Create profile after successful sign-up
            if (data?.user) {
              await ProfileService.createProfile({
                id: data.user.id,
                username: metadata.username || '',
                avatar_url: null,
              });
            }
            
            toast({
              title: "Account created",
              description: "Please check your email to verify your account",
            });
            
            return { success: true, data };
          } catch (error) {
            console.error("Sign up error:", error);
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
            return { success: false, error };
          } finally {
            setLoading(false);
          }
        },
        signOut,
        resetPassword: async (email) => {
          try {
            console.log("Requesting password reset for:", email);
            setLoading(true);
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin + "/reset-password",
            });
            
            if (error) throw error;
            
            toast({
              title: "Password reset email sent",
              description: "Check your inbox for a password reset link",
            });
            
            return { success: true };
          } catch (error) {
            console.error("Password reset error:", error);
            toast({
              title: "Password reset failed",
              description: error.message,
              variant: "destructive",
            });
            return { success: false, error };
          } finally {
            setLoading(false);
          }
        },
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
