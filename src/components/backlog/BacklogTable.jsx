
import React from "react";
import { ArrowUpDown, Edit, Trash2, Plus, Check, AlertTriangle, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BacklogTable = ({ backlogItems, isLoading, onEdit, onDelete, onCreate }) => {
  // Handle priority display with visual indicators
  const renderPriority = (priority) => {
    const priorityMap = {
      high: { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-500", bg: "bg-red-100" },
      medium: { icon: <Clock className="h-4 w-4" />, color: "text-amber-500", bg: "bg-amber-100" },
      low: { icon: <Check className="h-4 w-4" />, color: "text-green-500", bg: "bg-green-100" },
    };
    
    const defaultPriority = { icon: <Check className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-100" };
    const { icon, color, bg } = priorityMap[priority?.toLowerCase()] || defaultPriority;
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full ${bg}`}>
        <span className={`mr-1 ${color}`}>{icon}</span>
        <span className="capitalize text-xs font-medium">{priority || "Normal"}</span>
      </div>
    );
  };
  
  // Handle status display
  const renderStatus = (status) => {
    const statusMap = {
      "to-do": { text: "To Do", variant: "outline" },
      "todo": { text: "To Do", variant: "outline" },
      "in-progress": { text: "In Progress", variant: "default", className: "bg-amber-500" },
      "in_progress": { text: "In Progress", variant: "default", className: "bg-amber-500" },
      "done": { text: "Done", variant: "outline", className: "bg-green-500/10 text-green-500 border-green-200" },
      "completed": { text: "Completed", variant: "outline", className: "bg-green-500/10 text-green-500 border-green-200" },
    };
    
    const defaultStatus = { text: status || "To Do", variant: "outline" };
    const { text, variant, className } = statusMap[status?.toLowerCase()] || defaultStatus;
    
    return (
      <Badge variant={variant} className={className}>{text}</Badge>
    );
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="w-full p-8 flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-muted-foreground">Loading backlog items...</p>
      </div>
    );
  }
  
  // Empty state
  if (!backlogItems || backlogItems.length === 0) {
    return (
      <div className="text-center p-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/30 mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-medium mb-2">No backlog items yet</h3>
        <p className="text-muted-foreground mb-6">Start by creating your first backlog item.</p>
        <Button onClick={onCreate}>Create Backlog Item</Button>
      </div>
    );
  }
  
  // Render table with data
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px] text-center">ID</TableHead>
          <TableHead>
            <div className="flex items-center">
              Title
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </TableHead>
          <TableHead className="w-[120px]">Status</TableHead>
          <TableHead className="w-[120px]">Priority</TableHead>
          <TableHead className="w-[100px]">Story Points</TableHead>
          <TableHead className="w-[100px]">Sprint</TableHead>
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {backlogItems.map((item) => (
          <TableRow key={item.id} className="group hover:bg-muted/30">
            <TableCell className="text-center font-mono text-sm text-muted-foreground">
              {item.id?.toString().padStart(3, '0') || "#"}
            </TableCell>
            <TableCell>
              <div className="font-medium">{item.title || "Untitled Item"}</div>
              {item.description && (
                <div className="text-muted-foreground text-sm line-clamp-1">
                  {item.description}
                </div>
              )}
            </TableCell>
            <TableCell>{renderStatus(item.status)}</TableCell>
            <TableCell>{renderPriority(item.priority)}</TableCell>
            <TableCell>
              {item.story_points ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                        <span className="text-xs font-bold">{item.story_points}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.story_points} story points</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell>
              {item.sprint_id ? (
                <Badge variant="outline" className="bg-primary/10 border-primary/20">S{item.sprint_id}</Badge>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BacklogTable;
