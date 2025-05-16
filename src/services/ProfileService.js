
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Profile service for handling profile-related operations
export class ProfileService {
  /**
   * Fetch a user's profile data
   */
  static async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error fetching profile",
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }
  
  /**
   * Update a user's profile
   */
  static async updateProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();
        
      if (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error updating profile",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Profile updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }
  
  /**
   * Check if a profile exists
   */
  static async profileExists(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();
        
      if (error || !data) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Create a new profile
   */
  static async createProfile(profile) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .insert([profile])
        .select()
        .single();
        
      if (error) {
        console.error("Error creating profile:", error);
        toast({
          title: "Error creating profile",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Profile created successfully",
      });
      
      return data;
    } catch (error) {
      console.error("Error creating profile:", error);
      return null;
    }
  }
}

export default ProfileService;
