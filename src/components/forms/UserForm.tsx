
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
  role: z.string().min(1, "Role is required"), // Role itself cannot be an empty string per schema
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
  const currentFormSchema = isNewUserFlow ? newUserSchema : editUserSchema;

  // Determine the default role. If initialData.role is present, use it.
  // Otherwise, if allRoles has 'Viewer', use 'Viewer'.
  // Otherwise, if allRoles has items, use the first one.
  // Otherwise (allRoles is empty), use undefined (so placeholder shows).
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
      password: '',
    },
  });

  useEffect(() => {
    // Recalculate default role for reset, similar to above logic
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
        reset({
            name: '',
            email: '',
            role: defaultRoleForReset, // Use the same logic for new users
            password: '',
        });
    }
  }, [initialData, allRoles, reset, isNewUserFlow]);


  const handleFormSubmit = (values: UserFormValues) => {
    // Zod schema ensures role is a non-empty string if submitted.
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
          disabled={!isNewUserFlow && !!initialData}
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
        {!isNewUserFlow && !!initialData && (
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed after creation.</p>
        )}
      </div>

      {isNewUserFlow && (
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
              // If field.value is undefined (e.g. initially when no roles and no initialData),
              // passing '' to Select value allows placeholder to show.
              value={field.value || ''}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.length > 0 ? (
                  allRoles.map(roleName => (
                    // Zod schema for role name should prevent roleName from being empty.
                    // key and value must be non-empty strings.
                    roleName ? <SelectItem key={roleName} value={roleName}>{roleName}</SelectItem> : null
                  ))
                ) : (
                  // Display a message if no roles are available. Do NOT use SelectItem with value="".
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
          {isSubmitting ? 'Saving...' : (isNewUserFlow ? 'Invite & Create User' : 'Save Changes')}
        </Button>
      </div>
    </form>
  );
}
