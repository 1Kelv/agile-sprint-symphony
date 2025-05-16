
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import PersonalInfoTab from "@/components/profile/PersonalInfoTab";
import SecurityTab from "@/components/profile/SecurityTab";
import PreferencesTab from "@/components/profile/PreferencesTab";
import ProfileLoading from "@/components/profile/ProfileLoading";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Wait for auth to be fully initialized
    setTimeout(() => setLoading(false), 250);
  }, [user, navigate]);

  if (loading) {
    return (
      <Layout>
        <ProfileLoading />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-6">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="password">Password & Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal">
            <PersonalInfoTab />
          </TabsContent>
          
          <TabsContent value="password">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
