
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterState {
  status: string;
  priority: string;
}

interface BacklogFiltersProps {
  filter: FilterState;
  setFilter: (filter: FilterState) => void;
}

const BacklogFilters: React.FC<BacklogFiltersProps> = ({ filter, setFilter }) => {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-4">
      <Select
        value={filter.status}
        onValueChange={(value) => setFilter({...filter, status: value})}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="review">In Review</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filter.priority}
        onValueChange={(value) => setFilter({...filter, priority: value})}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default BacklogFilters;
