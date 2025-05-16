
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useFetchData } from "@/hooks/useFetchData";
import { useMutateData } from "@/hooks/useMutateData";
import { useAuth } from "@/contexts/AuthContext";
import { ProjectService } from "@/services/ProjectService";

const ProjectTeam = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("developer");
  const [newMemberNote, setNewMemberNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { mutate: mutateMember } = useMutateData("project_members");
  const { fetchById: fetchProject } = useFetchData("projects");
  const { fetchAll: fetchTeamMembers } = useFetchData("team_members");
  const { fetchAll: fetchProjectMembers } = useFetchData("project_members");

  // Fetch project and team members
  useEffect(() => {
    const loadProjectAndTeam = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch project details
        const projectData = await fetchProject(projectId);
        if (!projectData) {
          throw new Error(`Project with ID ${projectId} not found`);
        }
        setProject(projectData);

        // Fetch project members
        const projectMembersData = await fetchProjectMembers({
          filter: { column: "project_id", operator: "eq", value: projectId }
        });

        // Fetch team members
        const teamData = await fetchTeamMembers();
        setTeamMembers(teamData || []);
      } catch (err) {
        console.error("Error loading project team:", err);
        setError(err.message || "Failed to load project team");
        toast({
          title: "Error",
          description: err.message || "Failed to load project team",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProjectAndTeam();
    }
  }, [projectId, fetchProject, fetchProjectMembers, fetchTeamMembers]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    
    if (!newMemberEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would check if the user exists and add them
      // For now, we'll simulate adding a team member
      const randomId = Math.random().toString(36).substring(2, 15);
      
      // Add new team member
      const newMember = {
        id: randomId,
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: newMemberRole,
        department: "Engineering",
        avatar: `/placeholder.svg`,
        tasks_completed: 0,
        tasks_in_progress: 0
      };
      
      // Add member to project
      const result = await ProjectService.addProjectMember(projectId, randomId, newMemberRole);
      
      if (result) {
        // Update the UI
        setTeamMembers(prev => [...prev, newMember]);
        
        toast({
          title: "Team member added",
          description: `${newMemberEmail} has been added to the project as a ${newMemberRole}.`,
        });
        
        // Reset form
        setNewMemberEmail("");
        setNewMemberRole("developer");
        setNewMemberNote("");
        setIsAddMemberDialogOpen(false);
      }
    } catch (err) {
      console.error("Error adding team member:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const result = await ProjectService.removeProjectMember(projectId, memberId);
      
      if (result) {
        // Update the UI
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        
        toast({
          title: "Team member removed",
          description: "Team member has been removed from the project.",
        });
      }
    } catch (err) {
      console.error("Error removing team member:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to remove team member",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 text-xl mb-4">Error: {error}</div>
            <Button onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => navigate(`/projects/${projectId}`)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    &larr; Back to Project
                  </button>
                </div>
                <h1 className="text-3xl font-bold">{project?.name} Team</h1>
                <p className="text-muted-foreground mt-1">
                  Manage team members for this project
                </p>
              </div>
              
              <Button 
                onClick={() => setIsAddMemberDialogOpen(true)}
                className="mt-4 md:mt-0"
              >
                Add Team Member
              </Button>
            </div>
            
            {teamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                  <Card key={member.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{member.name}</CardTitle>
                            <CardDescription className="text-sm">{member.email}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {member.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Department:</span>
                          <span>{member.department}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasks completed:</span>
                          <span>{member.tasks_completed}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tasks in progress:</span>
                          <span>{member.tasks_in_progress}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t bg-muted/10 pt-3">
                      <div className="flex justify-end w-full">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          Remove from Project
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-muted/20 rounded-lg border border-dashed p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add team members to collaborate on this project.
                </p>
                <Button onClick={() => setIsAddMemberDialogOpen(true)}>
                  Add First Team Member
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a new team member to collaborate on {project?.name}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="team.member@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full p-2 rounded-md border"
              >
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="tester">Tester</option>
                <option value="product_owner">Product Owner</option>
                <option value="scrum_master">Scrum Master</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={newMemberNote}
                onChange={(e) => setNewMemberNote(e.target.value)}
                placeholder="Add some notes about this team member..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProjectTeam;
