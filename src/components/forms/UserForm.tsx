
"use client";

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/app/(app)/access-control/page'; // Import User type

export type UserRole = string; 

const baseUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.string().min(1, "Role is required"),
});

// Schema for new user creation, password is required
const newUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Schema for editing existing user, password is not part of this form
const editUserSchema = baseUserSchema; 

export type UserFormValues = z.infer<typeof baseUserSchema> & { password?: string };

interface UserFormProps {
  onSubmit: (values: UserFormValues, isNewUser: boolean) => Promise<void>;
  initialData?: User | null;
  allRoles: UserRole[];
  onCancel: () => void;
  isNewUserFlow: boolean; // To determine if this is for inviting a new user or editing
}

export function UserForm({ onSubmit, initialData, allRoles, onCancel, isNewUserFlow }: UserFormProps) {
  // Determine the schema based on whether it's a new user flow
  const currentFormSchema = isNewUserFlow ? newUserSchema : editUserSchema;

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: { // Set initial default values
      name: '',
      email: '',
      role: allRoles.includes('Viewer') ? 'Viewer' : allRoles[0] || '', // Default role
      password: '', // Password will be empty by default
    },
  });

  useEffect(() => {
    if (initialData && !isNewUserFlow) { // Editing existing user
      reset({
        name: initialData.name || '',
        email: initialData.email || '',
        role: initialData.role || (allRoles.includes('Viewer') ? 'Viewer' : allRoles[0] || ''),
        // Password field is not part of initialData for editing, and not shown
      });
    } else if (isNewUserFlow) { // Creating a new user
        reset({ // Reset to fresh defaults for new user
            name: '',
            email: '',
            role: allRoles.includes('Viewer') ? 'Viewer' : allRoles[0] || '',
            password: '',
        });
    }
  }, [initialData, allRoles, reset, isNewUserFlow]);


  const handleFormSubmit = (values: UserFormValues) => {
    // The onSubmit prop will handle if it's a new user or an edit based on isNewUserFlow
    return onSubmit(values, isNewUserFlow);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter user's full name" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email" 
          type="email" 
          {...register("email")} 
          placeholder="user@example.com" 
          // Disable email editing for existing users as it's tied to Firebase Auth identity
          disabled={!isNewUserFlow && !!initialData} 
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        {!isNewUserFlow && !!initialData && (
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed after creation.</p>
        )}
      </div>

      {isNewUserFlow && ( // Only show password field for new users
        <div>
          <Label htmlFor="password">Initial Password</Label>
          <Input id="password" type="password" {...register("password")} placeholder="Set an initial password" />
          {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
        </div>
      )}

      <div>
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select 
              onValueChange={field.onChange} 
              value={field.value} // Ensure value is controlled
              defaultValue={field.value} // Set defaultValue for initial render
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.length > 0 ? (
                  allRoles.map(roleName => ( // Changed variable name for clarity
                    <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>No roles available</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (isNewUserFlow ? 'Invite & Create User' : 'Save Changes')}
        </Button>
      </div>
    </form>
  );
}
