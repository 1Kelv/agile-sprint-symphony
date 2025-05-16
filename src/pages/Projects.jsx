
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Users, CalendarDays } from "lucide-react";
import { useFetchData } from "@/hooks/useFetchData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import ProjectForm from "@/components/project/ProjectForm";
import DeleteProjectDialog from "@/components/project/DeleteProjectDialog";

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { fetchAll, isLoading } = useFetchData("projects");
  
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    const data = await fetchAll({
      orderBy: { column: "created_at", ascending: false }
    });
    setProjects(data);
  };
  
  const handleOpenForm = (project = null) => {
    setSelectedProject(project);
    setIsFormOpen(true);
  };
  
  const handleOpenDeleteDialog = (project) => {
    setSelectedProject(project);
    setIsDeleteDialogOpen(true);
  };
  
  const handleProjectSuccess = () => {
    setIsFormOpen(false);
    setSelectedProject(null);
    fetchProjects();
  };
  
  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProject(null);
    fetchProjects();
    toast({
      title: "Project deleted",
      description: "Project has been deleted successfully.",
    });
  };
  
  const filteredProjects = activeTab === "all" 
    ? projects 
    : projects.filter(project => project.status === activeTab);
    
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your agile projects</p>
          </div>
          
          <Button onClick={() => handleOpenForm()} className="flex items-center gap-1">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.length > 0 ? (
              filteredProjects.map(project => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenForm(project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(project)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="truncate">{project.name}</CardTitle>
                    <CardDescription className="truncate">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="py-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-1" />
                      <span>
                        {project.start_date 
                          ? new Date(project.start_date).toLocaleDateString() 
                          : "No start date"} 
                        {" - "}
                        {project.end_date 
                          ? new Date(project.end_date).toLocaleDateString() 
                          : "No end date"}
                      </span>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center"
                      onClick={() => navigate(`/projects/${project.id}/team`)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      <span>Team</span>
                    </Button>
                    
                    <Button 
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      View Project
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg border border-dashed">
                <p className="text-muted-foreground text-center mb-4">No projects found</p>
                <Button onClick={() => handleOpenForm()}>Create a Project</Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Project Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedProject ? "Edit Project" : "Create New Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm 
            project={selectedProject} 
            onSuccess={handleProjectSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Project Dialog */}
      <DeleteProjectDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        project={selectedProject}
        onSuccess={handleDeleteSuccess}
      />
    </Layout>
  );
};

export default Projects;
