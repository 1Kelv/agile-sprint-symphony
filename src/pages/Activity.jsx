
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFetchData } from "@/hooks/useFetchData";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Activity = () => {
  const { fetchAll, isLoading, error } = useFetchData("activities");
  const [activities, setActivities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await fetchAll({
        orderBy: { column: "created_at", ascending: false },
        limit: 100,
      });
      setActivities(data || []);
    } catch (err) {
      console.error("Error loading activities:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "sprint_created":
      case "project_created":
      case "task_created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "sprint_completed":
      case "task_completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "comment":
      case "comment_added":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "pull_request":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100";
      case "user_joined":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "issue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };
  
  // Create some demo activities if no real data exists yet
  const demoActivities = [
    {
      id: 1,
      type: "task_created",
      content: "Created a new task: Implement user authentication",
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      user: { name: "User" }
    },
    {
      id: 2,
      type: "task_completed",
      content: "Completed task: Setup CI/CD pipeline",
      created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      user: { name: "User" }
    },
    {
      id: 3,
      type: "comment_added",
      content: "Commented on 'Dashboard UI Design'",
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      user: { name: "User" }
    },
    {
      id: 4,
      type: "pull_request",
      content: "Created PR: Feature/sprint-planning-tool",
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      user: { name: "User" }
    },
    {
      id: 5,
      type: "issue",
      content: "Reported issue: API integration error",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      user: { name: "User" }
    },
    {
      id: 6,
      type: "sprint_created",
      content: "Created Sprint #4: User Experience Enhancement",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      user: { name: "User" }
    },
    {
      id: 7,
      type: "user_joined",
      content: "Joined the project team",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      user: { name: "User" }
    }
  ];

  // Use demo data if no real data exists yet
  const displayActivities = activities && activities.length > 0 ? activities : demoActivities;

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Activity</h1>
            <p className="text-muted-foreground">Recent activity across all projects</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              See what your team has been working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-2">Error loading activities</p>
                <button
                  onClick={loadActivities}
                  className="text-sm text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : displayActivities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent activity to display</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-3 hover:bg-muted/40 rounded-md transition-colors"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(activity.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">
                          {activity.user?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.content}
                      </p>
                      {activity.type && (
                        <Badge
                          variant="outline"
                          className={`mt-1 text-xs ${getActivityColor(activity.type)}`}
                        >
                          {activity.type.replace(/_/g, " ")}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Activity;
