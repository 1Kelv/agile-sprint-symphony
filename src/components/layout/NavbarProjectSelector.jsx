
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchData } from "@/hooks/useFetchData";
import { useNavigate, useLocation } from "react-router-dom";

const NavbarProjectSelector = ({ projects, selectedProject, handleProjectChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useFetchData("projects");
  
  // If projects are still loading or empty, show loading state or null
  if (isLoading) {
    return (
      <div className="hidden md:block ml-6 min-w-[200px] z-50">
        <div className="h-9 bg-background/50 backdrop-blur rounded-md flex items-center px-3 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  // Ensure projects is an array before proceeding
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return null;
  }

  // When project is selected, redirect to project page if not on a project-related route
  const handleChange = (value) => {
    if (typeof handleProjectChange === 'function') {
      handleProjectChange(value);
    }
    
    // If not already on a project-specific route, navigate to the project page
    const currentPath = location?.pathname || "/";
    if (!currentPath.includes(`/projects/${value}`)) {
      navigate(`/projects/${value}`);
    }
  };

  return (
    <div className="hidden md:block ml-6 min-w-[200px] z-50">
      <Select 
        value={selectedProject || ''} 
        onValueChange={handleChange}
      >
        <SelectTrigger className="border-none bg-background/50 backdrop-blur">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent className="bg-background border z-[100]">
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NavbarProjectSelector;
