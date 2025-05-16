
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutateData } from "@/hooks/useMutateData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    backgroundColor: "bg-gray-100 dark:bg-gray-800",
  },
  "in-progress": {
    id: "in-progress",
    title: "In Progress",
    backgroundColor: "bg-blue-100 dark:bg-blue-800",
  },
  done: {
    id: "done",
    title: "Done",
    backgroundColor: "bg-green-100 dark:bg-green-800",
  },
};

const KanbanBoard = ({ items = [], onItemsChange }) => {
  const [columns, setColumns] = useState({
    "todo": { items: [] },
    "in-progress": { items: [] },
    "done": { items: [] },
  });
  
  const { update, isLoading } = useMutateData("backlog_items");
  
  useEffect(() => {
    // Organize items by status column
    const newColumns = {
      "todo": { items: [] },
      "in-progress": { items: [] },
      "done": { items: [] },
    };
    
    items.forEach(item => {
      const columnKey = item.status || "todo";
      if (newColumns[columnKey]) {
        newColumns[columnKey].items.push(item);
      } else {
        newColumns["todo"].items.push(item);
      }
    });
    
    setColumns(newColumns);
  }, [items]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }
    
    // Find the item being dragged
    const itemId = draggableId;
    const sourceColumnKey = source.droppableId;
    const destColumnKey = destination.droppableId;
    
    // Move item in the UI immediately for better UX
    const sourceColumn = columns[sourceColumnKey];
    const destColumn = columns[destColumnKey];
    const sourceItems = [...sourceColumn.items];
    const destItems = sourceColumnKey === destColumnKey ? sourceItems : [...destColumn.items];
    
    // Remove from source column
    const [removed] = sourceItems.splice(source.index, 1);
    
    // Insert into destination column
    destItems.splice(destination.index, 0, removed);
    
    // Update state to reflect changes
    setColumns({
      ...columns,
      [sourceColumnKey]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destColumnKey]: {
        ...destColumn,
        items: destItems,
      },
    });
    
    // Update item status in database
    try {
      // Only update if status changed
      if (sourceColumnKey !== destColumnKey) {
        await update(itemId, { status: destColumnKey });
        
        // Notify parent component of changes
        if (onItemsChange) {
          const updatedItems = items.map(item => {
            if (item.id === itemId) {
              return { ...item, status: destColumnKey };
            }
            return item;
          });
          onItemsChange(updatedItems);
        }
        
        toast({
          title: "Task status updated",
          description: `Task moved to ${COLUMNS[destColumnKey].title}`,
        });
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      // Revert the UI change on error
      setColumns(prevColumns => {
        // Deep clone the previous columns state
        return JSON.parse(JSON.stringify(prevColumns));
      });
      
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };
  
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 border-red-200">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200">
            Medium
          </Badge>
        );
      case "low":
      default:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-200">
            Low
          </Badge>
        );
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col md:flex-row gap-6 overflow-x-auto pb-4">
        {Object.keys(COLUMNS).map(columnKey => {
          const column = COLUMNS[columnKey];
          const columnItems = columns[columnKey]?.items || [];
          
          return (
            <div key={columnKey} className="min-w-[300px] w-full md:w-1/3">
              <div className={`rounded-t-lg ${column.backgroundColor} px-3 py-2`}>
                <h3 className="font-medium">
                  {column.title} ({columnItems.length})
                </h3>
              </div>
              
              <Droppable droppableId={columnKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[500px] border rounded-b-lg p-2 ${
                      snapshot.isDraggingOver ? "bg-muted" : "bg-card"
                    }`}
                  >
                    {columnItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 ${
                              snapshot.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            <CardHeader className="p-3 pb-1">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{item.title}</CardTitle>
                                {getPriorityBadge(item.priority)}
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-1">
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description || "No description"}
                              </p>
                              
                              {item.assignee_id && (
                                <div className="mt-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage src={item.assignee?.avatar} />
                                      <AvatarFallback>
                                        {getInitials(item.assignee?.name || "")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      {item.assignee?.name || "Assigned"}
                                    </span>
                                  </div>
                                  
                                  <Badge variant="outline" className="text-xs">
                                    {item.story_points} pts
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
