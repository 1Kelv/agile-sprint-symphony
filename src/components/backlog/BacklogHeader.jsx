
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const BacklogHeader = ({ onCreateItem }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Backlog</h1>
        <p className="text-muted-foreground">
          Manage and prioritize your product backlog items
        </p>
      </div>
      <Button 
        onClick={onCreateItem} 
        className="mt-4 md:mt-0 group"
      >
        <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
        Add Item
      </Button>
    </div>
  );
};

export default BacklogHeader;
