
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";

const NavbarMobileProjectSelector = ({ projects, selectedProject, handleProjectChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
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
    <div className="mb-4 p-3 border-b">
      <label className="block text-sm font-medium mb-2">Select Project</label>
      <Select value={selectedProject || ''} onValueChange={handleChange}>
        <SelectTrigger className="bg-background/50 backdrop-blur">
          <SelectValue placeholder="Select project" />
        </SelectTrigger>
        <SelectContent className="bg-background border z-[100]">
          {projects.map(project => (
            <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default NavbarMobileProjectSelector;
