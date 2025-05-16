
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const SprintFormFields = ({
  name,
  setName,
  description,
  setDescription,
  goal,
  setGoal,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  status,
  setStatus,
  projectId,
  setProjectId,
  projects,
  errors,
  isViewMode,
}) => {
  // Define fallback values to prevent empty string values
  const safeProjectId = projectId || "no-project";
  const safeStatus = status || "planned";
  
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground">
          Sprint Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter sprint name"
          disabled={isViewMode}
          className={errors?.name ? "border-destructive" : ""}
        />
        {errors?.name && <p className="text-destructive text-sm">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal" className="text-foreground">
          Sprint Goal
        </Label>
        <Input
          id="goal"
          value={goal || ""}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="What is the main objective of this sprint?"
          disabled={isViewMode}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          value={description || ""}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the focus and scope of this sprint"
          disabled={isViewMode}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-foreground">
            Start Date <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="startDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  errors?.startDate ? "border-destructive" : "",
                  !startDate && "text-muted-foreground"
                )}
                disabled={isViewMode}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors?.startDate && <p className="text-destructive text-sm">{errors.startDate}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-foreground">
            End Date <span className="text-destructive">*</span>
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="endDate"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  errors?.endDate ? "border-destructive" : "",
                  !endDate && "text-muted-foreground"
                )}
                disabled={isViewMode}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors?.endDate && <p className="text-destructive text-sm">{errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project" className="text-foreground">
            Project <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={safeProjectId} 
            onValueChange={setProjectId} 
            disabled={isViewMode}
          >
            <SelectTrigger
              id="project"
              className={errors?.projectId ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {projects && projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-project">
                    <div className="flex items-center">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create demo project
                    </div>
                  </SelectItem>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.projectId && <p className="text-destructive text-sm">{errors.projectId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-foreground">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select 
            value={safeStatus} 
            onValueChange={setStatus} 
            disabled={isViewMode}
          >
            <SelectTrigger
              id="status"
              className={errors?.status ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {errors?.status && <p className="text-destructive text-sm">{errors.status}</p>}
        </div>
      </div>
    </>
  );
};

export default SprintFormFields;
