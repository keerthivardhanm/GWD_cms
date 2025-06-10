
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { PlusCircle, MoreHorizontal, Edit2, Trash2, UserPlus, Shield, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase Auth function
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, Timestamp, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, query, orderBy, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { UserForm, UserFormValues, UserRole } from '@/components/forms/UserForm';
import { RoleForm, RoleFormValues } from '@/components/forms/RoleForm'; 
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLogger';

export interface User {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  role: UserRole | string; 
  lastLogin?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export const allPermissions = [
    { id: "manage_users", label: "Manage Users" },
    { id: "manage_settings", label: "Manage Global Settings" },
    { id: "manage_content", label: "Create/Edit/Delete Content (Pages, Blocks, Files)" },
    { id: "manage_schemas", label: "Create/Edit/Delete Schemas" },
    { id: "view_content", label: "View Content" },
    { id: "manage_media", label: "Manage Media Library" },
    { id: "view_audit_logs", label: "View Audit Logs" },
];

// Simulated email sending function
const sendInvitationEmail = async (email: string, role: string) => {
  console.log(`SIMULATING EMAIL: User ${email} has been added to the CMS with the role: ${role}. They can now log in with their initial password.`);
  // In a real app, you'd call a backend API or Firebase Function here
  // which would use a service like SendGrid, Mailgun, etc.
  return Promise.resolve();
};


export default function AccessControlPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);
  const { toast } = useToast();
  const { user: authUser, userData: authUserData } = useAuth();

  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false); // Explicitly manage if it's new user or edit

  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        return {
          id: docSnap.id, // This is the Firestore document ID, which should match Auth UID
          name: data.name || 'Unknown User',
          email: data.email || 'no-email@example.com',
          role: data.role || 'Viewer',
          lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate().toLocaleDateString() : data.lastLogin,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as User;
      });
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setErrorUsers("Failed to load users. Please try again later.");
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    setErrorRoles(null);
    try {
      const rolesQuery = query(collection(db, "roles"), orderBy("name", "asc"));
      const querySnapshot = await getDocs(rolesQuery);
      const rolesData = querySnapshot.docs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || 'Unknown Role',
          description: data.description || '',
          permissions: Array.isArray(data.permissions) ? data.permissions : [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as Role;
      });
      setRoles(rolesData);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setErrorRoles("Failed to load roles. Please try again later.");
       toast({ title: "Error", description: "Failed to load roles.", variant: "destructive" });
    } finally {
      setLoadingRoles(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const handleInviteNewUser = () => {
    setEditingUser(null); // Ensure no existing user data is carried over
    setIsNewUserFlow(true); // Set flag for new user
    setIsUserFormOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsNewUserFlow(false); // Set flag for editing existing user
    setIsUserFormOpen(true);
  };

  const handleUserFormSubmit = async (values: UserFormValues, isNew: boolean) => {
    try {
      if (isNew) { // Creating a new user (isNewUserFlow was true)
        if (!values.password) { // Password should be required by form validation, but double-check
          toast({ title: "Error", description: "Password is required for new users.", variant: "destructive"});
          return;
        }
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const newAuthUser = userCredential.user;

        // 2. Create Firestore user profile with Auth UID as document ID
        const userProfileData = {
          // id: newAuthUser.uid, // Not needed, doc ID is UID
          name: values.name,
          email: values.email, // Store email in Firestore as well for easier display
          role: values.role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // lastLogin can be updated by a Firebase Function on user sign-in or manually
        };
        await setDoc(doc(db, "users", newAuthUser.uid), userProfileData);
        
        await logAuditEvent(authUser, authUserData, 'USER_CREATED', 'User', newAuthUser.uid, values.name, { name: values.name, email: values.email, role: values.role });
        toast({ title: "Success", description: "User created successfully in Firebase Auth and Firestore." });
        
        // 3. Send "invitation" email (simulated)
        await sendInvitationEmail(values.email, values.role);

      } else if (editingUser) { // Editing an existing user
        const userRef = doc(db, "users", editingUser.id);
        // Note: Email cannot be changed here directly for Auth user (form field is disabled). Password not changed here.
        const updateData = {
          name: values.name,
          role: values.role,
          // email: values.email, // Do not update email if it's tied to Firebase Auth email directly
          updatedAt: serverTimestamp(),
        };
        await updateDoc(userRef, updateData);
        await logAuditEvent(authUser, authUserData, 'USER_UPDATED', 'User', editingUser.id, values.name, { newValues: updateData, oldValues: { name: editingUser.name, role: editingUser.role } });
        toast({ title: "Success", description: "User updated successfully." });
      }
      setIsUserFormOpen(false);
      setEditingUser(null);
      setIsNewUserFlow(false); // Reset flow state
      fetchUsers(); // Refresh user list
    } catch (err: any) {
      console.error("Error saving user:", err);
      let errorMessage = `Failed to save user. ${err.message || ''}`;
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another Auth account.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "The password is too weak (must be at least 6 characters).";
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    // Note: Deleting a user from Firestore here.
    // For full cleanup, you'd also need to delete the Firebase Auth user,
    // which requires Admin SDK privileges (typically done in a Cloud Function).
    // This frontend-only delete will only remove the Firestore profile.
    // Consider adding a confirmation for Auth user deletion or instructions.
    if (authUser?.uid === userId) {
        toast({ title: "Cannot Delete Self", description: "You cannot delete your own user account.", variant: "destructive" });
        return;
    }
    try {
      await deleteDoc(doc(db, "users", userId));
      await logAuditEvent(authUser, authUserData, 'USER_DELETED', 'User', userId, userName);
      toast({ title: "Success", description: `User profile "${userName}" removed successfully from Firestore. Firebase Auth account may still exist.` });
      fetchUsers();
    } catch (err) {
      console.error("Error removing user:", err);
      toast({ title: "Error", description: `Failed to remove user profile. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };

  const handleCreateNewRole = () => {
    setEditingRole(null);
    setIsRoleFormOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsRoleFormOpen(true);
  };

  const handleRoleFormSubmit = async (values: RoleFormValues) => {
    try {
      if (editingRole) {
        const roleRef = doc(db, "roles", editingRole.id);
        await updateDoc(roleRef, {
          ...values,
          updatedAt: serverTimestamp(),
        });
        await logAuditEvent(authUser, authUserData, 'ROLE_UPDATED', 'Role', editingRole.id, values.name, { newValues: values, oldValues: editingRole });
        toast({ title: "Success", description: "Role updated successfully." });
      } else {
        const newDocRef = await addDoc(collection(db, "roles"), {
          ...values,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        await logAuditEvent(authUser, authUserData, 'ROLE_CREATED', 'Role', newDocRef.id, values.name, { values });
        toast({ title: "Success", description: "Role created successfully." });
      }
      setIsRoleFormOpen(false);
      setEditingRole(null);
      fetchRoles();
    } catch (err) {
      console.error("Error saving role:", err);
      toast({ title: "Error", description: `Failed to save role. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    const usersWithRole = users.filter(user => user.role === roleName);
    if (usersWithRole.length > 0) {
        toast({ title: "Cannot Delete Role", description: `Role "${roleName}" is currently assigned to ${usersWithRole.length} user(s). Reassign users before deleting.`, variant: "destructive"});
        return;
    }
    // Prevent deletion of core/default roles
    if (['Admin', 'Editor', 'Viewer'].includes(roleName)) { // Assuming these are your default/core roles
        toast({ title: "Cannot Delete Role", description: `Cannot delete default role "${roleName}".`, variant: "destructive"});
        return;
    }

    try {
      await deleteDoc(doc(db, "roles", roleId));
      await logAuditEvent(authUser, authUserData, 'ROLE_DELETED', 'Role', roleId, roleName);
      toast({ title: "Success", description: `Role "${roleName}" removed successfully.` });
      fetchRoles();
    } catch (err) {
      console.error("Error removing role:", err);
      toast({ title: "Error", description: `Failed to remove role. ${err instanceof Error ? err.message : ''}`, variant: "destructive" });
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title="Access Control"
        description="Manage user accounts, roles, and their permissions."
        actions={
          <>
            <Button variant="outline" onClick={handleInviteNewUser}> <UserPlus className="mr-2 h-4 w-4" /> Invite New User</Button>
            <Button onClick={handleCreateNewRole}> <PlusCircle className="mr-2 h-4 w-4" /> Create New Role</Button>
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
                <p className="p-4 text-center text-muted-foreground">No users found. Click "Invite New User" to add one.</p>
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
                            <Badge variant={user.role === "Admin" ? "destructive" : user.role === "Editor" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions for {user.name}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEditUser(user)}><Edit2 className="mr-2 h-4 w-4" /> Edit User Profile</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem 
                                        onSelect={(e) => e.preventDefault()} 
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                        disabled={authUser?.uid === user.id} // Disable if trying to delete self
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" /> Remove User Profile
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This action cannot be undone. This will permanently remove the user profile for "{user.name}" from Firestore. 
                                          The Firebase Authentication account may still exist and would need to be removed separately (e.g. via Firebase console or Admin SDK for full deletion).
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.name)} className="bg-destructive hover:bg-destructive/90">
                                          Remove Profile
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                     <p className="p-4 text-center text-muted-foreground">No roles defined yet. Click "Create New Role" to add one.</p>
                )}
                {!loadingRoles && !errorRoles && roles.map(role => (
                    <Card key={role.id} className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{role.name}</CardTitle>
                                    <CardDescription className="text-xs">{role.description}</CardDescription>
                                </div>
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions for {role.name}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleEditRole(role)}><Edit2 className="mr-2 h-4 w-4" /> Edit Role</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                        <DropdownMenuItem 
                                            onSelect={(e) => e.preventDefault()} 
                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                            disabled={['Admin', 'Editor', 'Viewer'].includes(role.name) || users.some(u => u.role === role.name)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Role
                                        </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            This action cannot be undone. This will permanently remove the role "{role.name}".
                                            Ensure no users are assigned this role before deleting. Default roles (Admin, Editor, Viewer) cannot be deleted.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteRole(role.id, role.name)} className="bg-destructive hover:bg-destructive/90">
                                            Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-sm font-medium">Permissions:</Label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                                {allPermissions.map(perm => (
                                    <div key={perm.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`${role.id}-${perm.id}`}
                                            checked={role.permissions.includes(perm.id)}
                                            disabled // Display only, editing happens in RoleForm
                                            className="cursor-default"
                                        />
                                        <Label htmlFor={`${role.id}-${perm.id}`} className="text-xs font-normal cursor-default">{perm.label}</Label>
                                    </div>
                                ))}
                                {role.permissions.length === 0 && <p className="text-xs text-muted-foreground col-span-full">No permissions assigned.</p>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    </div>

     <Dialog open={isUserFormOpen} onOpenChange={(isOpen) => {
          setIsUserFormOpen(isOpen);
          if (!isOpen) { // Reset state when dialog closes
            setEditingUser(null);
            setIsNewUserFlow(false);
          }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isNewUserFlow ? "Invite New User" : "Edit User Profile"}</DialogTitle>
            <DialogDescription>
              {isNewUserFlow ? "Fill in the details for the new user and set an initial password. An email notification (simulated) will be sent." : "Make changes to the user details here."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {/* Ensure UserForm is re-rendered with correct props when isUserFormOpen changes */}
          {isUserFormOpen && (
            <UserForm
                key={isNewUserFlow ? 'new-user-form' : (editingUser?.id || 'edit-user-form')} // Key to force re-render
                onSubmit={handleUserFormSubmit}
                initialData={editingUser}
                allRoles={roles.map(r => r.name as UserRole)} 
                onCancel={() => {
                setIsUserFormOpen(false);
                setEditingUser(null);
                setIsNewUserFlow(false);
                }}
                isNewUserFlow={isNewUserFlow}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleFormOpen} onOpenChange={(isOpen) => {
          setIsRoleFormOpen(isOpen);
          if (!isOpen) setEditingRole(null);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Create New Role"}</DialogTitle>
            <DialogDescription>
              {editingRole ? "Make changes to the role details and permissions here." : "Define the new role and its permissions."} Click save when you're done.
            </DialogDescription>
          </DialogHeader>
           {isRoleFormOpen && (
            <RoleForm
                key={editingRole ? editingRole.id : 'new-role-form'}
                onSubmit={handleRoleFormSubmit}
                initialData={editingRole}
                allPermissions={allPermissions}
                onCancel={() => {
                setIsRoleFormOpen(false);
                setEditingRole(null);
                }}
            />
           )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
