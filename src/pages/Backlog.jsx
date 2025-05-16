
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMutateData } from "@/hooks/useMutateData";
import { useFetchData } from "@/hooks/useFetchData";
import Layout from "@/components/layout/Layout";
import BacklogForm from "@/components/backlog/BacklogForm";
import BacklogHeader from "@/components/backlog/BacklogHeader";
import BacklogFilters from "@/components/backlog/BacklogFilters";
import BacklogTable from "@/components/backlog/BacklogTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

const Backlog = ({ newItem = false }) => {
  const { user } = useAuth();
  const { fetchAll } = useFetchData("backlog_items");
  const { remove, isLoading: isMutating } = useMutateData("backlog_items");
  const [isLoading, setIsLoading] = useState(true);
  const [backlogItems, setBacklogItems] = useState([]);
  const [formOpen, setFormOpen] = useState(newItem);
  const [editItem, setEditItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [filter, setFilter] = useState({
    status: "all",
    priority: "all",
  });

  // Load data when component mounts or when filter changes
  useEffect(() => {
    loadBacklogItems();
  }, [filter]);

  const loadBacklogItems = async () => {
    try {
      console.log("Loading backlog items with filters:", filter);
      setIsLoading(true);
      
      const options = {
        orderBy: { column: 'created_at', ascending: false }
      };
      
      // Only apply filters if they aren't set to "all"
      if (filter.status !== "all" || filter.priority !== "all") {
        options.filters = [];
        
        if (filter.status !== "all") {
          options.filters.push({ column: 'status', operator: 'eq', value: filter.status });
        }
        
        if (filter.priority !== "all") {
          options.filters.push({ column: 'priority', operator: 'eq', value: filter.priority });
        }
      }
      
      const items = await fetchAll(options);
      console.log("Backlog items loaded:", items);
      setBacklogItems(items || []);
    } catch (error) {
      console.error("Error loading backlog items:", error);
      toast({
        title: "Error loading backlog items",
        description: "Please try again or check your connection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateItem = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setFormOpen(true);
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        console.log("Deleting backlog item:", itemToDelete);
        const success = await remove(itemToDelete);
        if (success) {
          console.log("Item deleted successfully");
          setBacklogItems(backlogItems.filter(item => item.id !== itemToDelete));
          toast({
            title: "Item deleted",
            description: "Backlog item has been deleted successfully",
          });
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        toast({
          title: "Error deleting backlog item",
          description: "Please try again or check your connection",
          variant: "destructive",
        });
      } finally {
        setItemToDelete(null);
      }
    }
  };

  const handleConfirmDelete = (id) => {
    setItemToDelete(id);
  };

  // If we came here with newItem=true, open the form automatically
  useEffect(() => {
    if (newItem) {
      handleCreateItem();
    }
  }, [newItem]);

  console.log("Current backlog items state:", backlogItems);
  console.log("Is loading:", isLoading);

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <BacklogHeader onCreateItem={handleCreateItem} />

        <Card className="shadow-sm border-muted/40">
          <CardHeader className="pb-3">
            <CardTitle>Backlog Items</CardTitle>
            <CardDescription>
              Manage your product backlog and move items to sprints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BacklogFilters filter={filter} setFilter={setFilter} />

            <div className="rounded-md border">
              <BacklogTable 
                backlogItems={backlogItems}
                isLoading={isLoading}
                onEdit={handleEditItem}
                onDelete={handleConfirmDelete}
                onCreate={handleCreateItem}
              />
            </div>
          </CardContent>
        </Card>

        <BacklogForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editItem}
          onSuccess={loadBacklogItems}
        />

        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                backlog item and remove it from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteItem}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Backlog;
