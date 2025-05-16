
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
import { useSupabaseData } from "@/hooks/useSupabaseData";

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

type BacklogFormValues = z.infer<typeof formSchema>;

interface BacklogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess?: () => void;
}

const BacklogForm: React.FC<BacklogFormProps> = ({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { create, update, isLoading } = useSupabaseData("backlog_items");
  const { fetchAll: fetchTeamMembers } = useSupabaseData("team_members");
  const { fetchAll: fetchSprints } = useSupabaseData("sprints");
  const [teamMembers, setTeamMembers] = React.useState<any[]>([]);
  const [sprints, setSprints] = React.useState<any[]>([]);

  const form = useForm<BacklogFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      story_points: 1,
      assignee_id: undefined,
      sprint_id: undefined,
      tags: [],
    },
  });

  useEffect(() => {
    const loadTeamMembers = async () => {
      const members = await fetchTeamMembers({});
      setTeamMembers(members || []);
    };

    const loadSprints = async () => {
      const sprintData = await fetchSprints({
        filters: [
          { column: 'status', operator: 'in', value: ['planning', 'active'] }
        ]
      });
      setSprints(sprintData || []);
    };

    loadTeamMembers();
    loadSprints();
  }, [fetchTeamMembers, fetchSprints]);

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    } else {
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        story_points: 1,
        assignee_id: undefined,
        sprint_id: undefined,
        tags: [],
      });
    }
  }, [initialData, form]);

  async function onSubmit(values: BacklogFormValues) {
    try {
      // Convert sprint_id from string to number or null
      const formattedValues = {
        ...values,
        sprint_id: values.sprint_id ? Number(values.sprint_id) : null,
        tags: values.tags || [],
      };

      if (initialData?.id) {
        await update(initialData.id, formattedValues);
      } else {
        // Generate a unique ID for new backlog items
        const id = `BLI-${Date.now().toString(36).toUpperCase()}`;
        await create({ ...formattedValues, id });
      }

      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
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

            <FormField
              control={form.control}
              name="sprint_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sprint</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to a sprint" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Backlog (No Sprint)</SelectItem>
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
