
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

// Base schema for user details, password is not included here
const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.string().min(1, "Role is required"), 
});

// For UserFormValues, password is not part of the form data collected from admin for new users
export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues, isNewUser: boolean) => Promise<void>;
  initialData?: User | null;
  allRoles: UserRole[];
  onCancel: () => void;
  isNewUserFlow: boolean; 
}

export function UserForm({ onSubmit, initialData, allRoles, onCancel, isNewUserFlow }: UserFormProps) {
  // The same schema is used for both new and edit, as admin doesn't set password for new users.
  const currentFormSchema = userFormSchema; 

  let determinedDefaultRole: string | undefined = undefined;
  if (initialData?.role) {
    determinedDefaultRole = initialData.role;
  } else if (allRoles.length > 0) {
    if (allRoles.includes('Viewer')) {
      determinedDefaultRole = 'Viewer';
    } else {
      determinedDefaultRole = allRoles[0];
    }
  }

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<UserFormValues>({
    resolver: zodResolver(currentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: determinedDefaultRole,
    },
  });

  useEffect(() => {
    let defaultRoleForReset: string | undefined = undefined;
    if (initialData?.role) {
        defaultRoleForReset = initialData.role;
    } else if (allRoles.length > 0) {
        if (allRoles.includes('Viewer')) {
        defaultRoleForReset = 'Viewer';
        } else {
        defaultRoleForReset = allRoles[0];
        }
    }

    if (initialData && !isNewUserFlow) {
      reset({
        name: initialData.name || '',
        email: initialData.email || '',
        role: defaultRoleForReset,
      });
    } else if (isNewUserFlow) {
        reset({ // Reset for new user, no password field
            name: '',
            email: '',
            role: defaultRoleForReset,
        });
    }
  }, [initialData, allRoles, reset, isNewUserFlow]);

  const handleFormSubmit = (values: UserFormValues) => {
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
          // Email can be edited for existing users if desired, but for Auth users, it's more complex.
          // Disabling for edit mode simplifies things to prevent desync with Firebase Auth email.
          disabled={!isNewUserFlow && !!initialData} 
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        {!isNewUserFlow && !!initialData && (
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed after creation for existing users via this form.</p>
        )}
      </div>

      {/* Password field is removed for new user flow as admin doesn't set it */}

      <div>
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              value={field.value || ''}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.length > 0 ? (
                  allRoles.map(roleName => (
                    roleName ? <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem> : null
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">No roles available</div>
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
          {isSubmitting ? 'Saving...' : (isNewUserFlow ? 'Create & Send Invite' : 'Save Changes')}
        </Button>
      </div>
    </form>
  );
}
