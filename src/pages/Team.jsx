
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import Navbar from "@/components/layout/Navbar";
import TeamMemberForm from "@/components/team/TeamMemberForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Search,
  PlusCircle,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
} from "lucide-react";

const Team = () => {
  const { user } = useAuth();
  const { fetchAll, remove } = useSupabaseData("team_members");
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTeamMembers = async () => {
    setIsLoading(true);
    const data = await fetchAll({});
    setTeamMembers(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const handleCreateMember = () => {
    setEditMember(null);
    setFormOpen(true);
  };

  const handleEditMember = (member) => {
    setEditMember(member);
    setFormOpen(true);
  };

  const handleDeleteMember = async () => {
    if (memberToDelete) {
      const success = await remove(memberToDelete);
      if (success) {
        setTeamMembers(teamMembers.filter(member => member.id !== memberToDelete));
      }
      setMemberToDelete(null);
    }
  };

  const handleConfirmDelete = (id) => {
    setMemberToDelete(id);
  };

  const filteredMembers = teamMembers.filter(member => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto pt-24 px-4 pb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Team Members</h1>
            <p className="text-muted-foreground">
              Manage your team and their roles
            </p>
          </div>
          <Button 
            onClick={handleCreateMember} 
            className="mt-4 md:mt-0 group"
          >
            <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
            Add Member
          </Button>
        </div>

        <Card className="shadow-sm border-muted/40">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Team Members</CardTitle>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                          <p className="mt-2 text-sm text-muted-foreground">Loading team members...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchQuery ? (
                          <div className="flex flex-col items-center">
                            <p className="text-muted-foreground">No team members found for "{searchQuery}"</p>
                            <Button 
                              variant="link" 
                              onClick={() => setSearchQuery("")}
                              className="mt-2"
                            >
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <p className="text-muted-foreground">No team members found</p>
                            <Button 
                              variant="link" 
                              onClick={handleCreateMember}
                              className="mt-2"
                            >
                              Add your first team member
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="h-9 w-9 mr-3">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-muted-foreground">{member.phone || "No phone"}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.role}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{member.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <a href={`mailto:${member.email}`} className="text-sm hover:underline">
                            {member.email}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-3">
                            <div className="flex items-center text-sm">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 mr-1" />
                              <span>{member.tasks_completed || 0}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-3.5 w-3.5 text-blue-500 mr-1" />
                              <span>{member.tasks_in_progress || 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleConfirmDelete(member.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4 text-sm text-muted-foreground">
            <div>
              Total: {filteredMembers.length} team {filteredMembers.length === 1 ? "member" : "members"}
            </div>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </CardFooter>
        </Card>

        <TeamMemberForm
          open={formOpen}
          onOpenChange={setFormOpen}
          initialData={editMember}
          onSuccess={loadTeamMembers}
        />

        <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                team member and remove them from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteMember}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Team;
