
"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Edit2, Trash2, UserPlus, Shield, KeyRound, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin?: string; // Kept optional as in original mock
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown User',
            email: data.email || 'no-email@example.com',
            role: data.role || 'Viewer',
            lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate().toLocaleDateString() : data.lastLogin,
          } as User;
        });
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setErrorUsers("Failed to load users. Please try again later.");
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchRoles = async () => {
      setLoadingRoles(true);
      setErrorRoles(null);
      try {
        const querySnapshot = await getDocs(collection(db, "roles"));
        const rolesData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown Role',
            description: data.description || '',
            permissions: Array.isArray(data.permissions) ? data.permissions : [],
          } as Role;
        });
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setErrorRoles("Failed to load roles. Please try again later.");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchUsers();
    fetchRoles();
  }, []);

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
            {loadingUsers && (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2">Loading users...</p>
                </div>
            )}
            {errorUsers && <p className="p-4 text-center text-destructive">{errorUsers}</p>}
            {!loadingUsers && !errorUsers && users.length === 0 && (
                <p className="p-4 text-center text-muted-foreground">No users found.</p>
            )}
            {!loadingUsers && !errorUsers && users.length > 0 && (
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
                    {users.map((user) => (
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
            )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Roles & Permissions</CardTitle>
            <CardDescription>Define roles and assign permissions to them.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {loadingRoles && (
                    <div className="flex items-center justify-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-2">Loading roles...</p>
                    </div>
                )}
                {errorRoles && <p className="p-4 text-center text-destructive">{errorRoles}</p>}
                {!loadingRoles && !errorRoles && roles.length === 0 && (
                     <p className="p-4 text-center text-muted-foreground">No roles found.</p>
                )}
                {!loadingRoles && !errorRoles && roles.map(role => (
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
                                            disabled={role.name === "Admin"} 
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
