
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, Search, MoreHorizontal, Edit2, Trash2, UserPlus, Shield, KeyRound, Users } from "lucide-react"; // Added Users
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const usersData = [
  { id: "u1", name: "Alice Wonderland", email: "alice@example.com", role: "Admin", lastLogin: "2024-07-28" },
  { id: "u2", name: "Bob The Builder", email: "bob@example.com", role: "Editor", lastLogin: "2024-07-27" },
  { id: "u3", name: "Charlie Brown", email: "charlie@example.com", role: "Viewer", lastLogin: "2024-07-29" },
  { id: "u4", name: "Diana Prince", email: "diana@example.com", role: "Editor", lastLogin: "2024-07-26" },
];

const rolesData = [
    { id: "r1", name: "Admin", description: "Full access to all features and settings.", permissions: ["manage_users", "manage_settings", "manage_content", "manage_schemas"] },
    { id: "r2", name: "Editor", description: "Can create, edit, and publish content.", permissions: ["manage_content"] },
    { id: "r3", name: "Viewer", description: "Can only view content, no editing rights.", permissions: ["view_content"] },
];

const allPermissions = [
    { id: "manage_users", label: "Manage Users" },
    { id: "manage_settings", label: "Manage Global Settings" },
    { id: "manage_content", label: "Create/Edit/Delete Content (Pages, Blocks, Files)" },
    { id: "manage_schemas", label: "Create/Edit/Delete Schemas" },
    { id: "view_content", label: "View Content" },
    { id: "manage_media", label: "Manage Media Library" },
    { id: "view_audit_logs", label: "View Audit Logs" },
];


export default function AccessControlPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Control"
        description="Manage user accounts, roles, and their permissions."
        actions={
          <>
            <Button variant="outline"> <UserPlus className="mr-2 h-4 w-4" /> Invite New User</Button>
            <Button> <PlusCircle className="mr-2 h-4 w-4" /> Create New Role</Button>
          </>
        }
      />

    <div className="grid gap-6 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Users</CardTitle>
            <CardDescription>List of all users in the system.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
            <div className="p-4 border-b">
                <Input type="search" placeholder="Search users by name or email..." className="w-full" />
            </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {usersData.map((user) => (
                    <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                        <Badge variant={user.role === "Admin" ? "destructive" : "secondary"}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
                            <DropdownMenuItem><KeyRound className="mr-2 h-4 w-4" /> Change Role</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Remove User</DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Roles & Permissions</CardTitle>
            <CardDescription>Define roles and assign permissions to them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {rolesData.map(role => (
                    <Card key={role.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg">{role.name}</CardTitle>
                                <Button variant="outline" size="sm"><Edit2 className="mr-1 h-3 w-3" /> Edit Role</Button>
                            </div>
                            <CardDescription className="text-xs">{role.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-sm font-medium">Permissions:</Label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                {allPermissions.map(perm => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`${role.id}-${perm.id}`} 
                                            checked={role.permissions.includes(perm.id)}
                                            disabled={role.name === "Admin"} // Admins typically have all permissions
                                        />
                                        <Label htmlFor={`${role.id}-${perm.id}`} className="text-xs font-normal cursor-pointer">{perm.label}</Label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    </div>

    </div>
  );
}
