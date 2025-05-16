import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useMutateData } from "@/hooks/useMutateData";
import { useFetchData } from "@/hooks/useFetchData";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  priority: z.string({
    required_error: "Please select a priority.",
  }),
  status: z.string({
    required_error: "Please select a status.",
  }),
  story_points: z.coerce.number().min(1, {
    message: "Story points must be at least 1.",
  }),
  assignee_id: z.string().optional(),
  sprint_id: z.coerce.number().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

const BacklogForm = ({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { create, update, isLoading } = useMutateData("backlog_items");
  const { fetchAll: fetchTeamMembers } = useFetchData("team_members");
  const { fetchAll: fetchSprints } = useFetchData("sprints");
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [sprints, setSprints] = React.useState([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      story_points: 1,
      assignee_id: "",
      sprint_id: null,
      tags: [],
    },
  });

  console.log("BacklogForm open:", open);
  console.log("BacklogForm initialData:", initialData);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        const members = await fetchTeamMembers({});
        console.log("Team members loaded:", members);
        setTeamMembers(members || []);
      } catch (error) {
        console.error("Error loading team members:", error);
        toast({
          title: "Error",
          description: "Failed to load team members",
          variant: "destructive",
        });
      }
    };

    const loadSprints = async () => {
      try {
        const sprintData = await fetchSprints({
          filters: [
            { column: 'status', operator: 'in', value: ['planning', 'active'] }
          ],
        });
        console.log("Sprints loaded:", sprintData);
        setSprints(sprintData || []);
      } catch (error) {
        console.error("Error loading sprints:", error);
        toast({
          title: "Error",
          description: "Failed to load sprints",
          variant: "destructive",
        });
      }
    };

    if (open) {
      loadTeamMembers();
      loadSprints();
    }
  }, [fetchTeamMembers, fetchSprints, open]);

  useEffect(() => {
    if (initialData) {
      console.log("Resetting form with initialData:", initialData);
      form.reset(initialData);
    } else {
      console.log("Resetting form to defaults");
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        story_points: 1,
        assignee_id: "",
        sprint_id: null,
        tags: [],
      });
    }
  }, [initialData, form, open]);

  async function onSubmit(values) {
    try {
      console.log("Submitting form with values:", values);
      // Convert sprint_id from string to number or null
      const formattedValues = {
        ...values,
        sprint_id: values.sprint_id ? Number(values.sprint_id) : null,
        tags: values.tags || [],
      };

      if (initialData?.id) {
        console.log("Updating existing item:", initialData.id);
        await update(initialData.id, formattedValues);
        toast({
          title: "Item updated",
          description: "Backlog item has been updated successfully",
        });
      } else {
        console.log("Creating new item");
        // Generate a unique ID for new backlog items
        const id = `BLI-${Date.now().toString(36).toUpperCase()}`;
        await create({ ...formattedValues, id });
        toast({
          title: "Item created",
          description: "New backlog item has been created successfully",
        });
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error saving backlog item",
        description: "Please try again or check your connection",
        variant: "destructive",
      });
    }
  }

  // Handle dialog close
  const handleDialogChange = (open) => {
    if (!open && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Backlog Item" : "Create Backlog Item"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the details of the existing backlog item."
              : "Add a new item to your project backlog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the backlog item"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority and Status selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">In Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Story Points and Assignee selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="story_points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={13}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Estimate the complexity (1-13)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sprint selection */}
            <FormField
              control={form.control}
              name="sprint_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString() || ""}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to a sprint" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog (No Sprint)</SelectItem>
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id.toString()}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : initialData
                  ? "Update Item"
                  : "Create Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BacklogForm;
