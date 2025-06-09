
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User } from '@/app/(app)/access-control/page'; // Import User type

// UserRole will now be dynamic based on roles fetched from DB, but we keep a base type for schema
export type UserRole = string; 

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: z.string().min(1, "Role is required"), // Roles are now strings
});

export type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  onSubmit: (values: UserFormValues) => Promise<void>;
  initialData?: User | null;
  allRoles: UserRole[]; // Pass all available role names
  onCancel: () => void;
}

export function UserForm({ onSubmit, initialData, allRoles, onCancel }: UserFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      role: initialData?.role || (allRoles.includes('Viewer') ? 'Viewer' : allRoles[0] || ''), // Default to Viewer or first available role
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter user's full name" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" {...register("email")} placeholder="user@example.com" />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="role">Role</Label>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {allRoles.length > 0 ? (
                  allRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
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
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Invite User')}
        </Button>
      </div>
    </form>
  );
}
