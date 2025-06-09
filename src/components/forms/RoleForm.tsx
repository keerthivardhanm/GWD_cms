
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import type { Role } from '@/app/(app)/access-control/page'; // Import Role type
import { ScrollArea } from '@/components/ui/scroll-area';

const roleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(50, "Role name must be 50 characters or less"),
  description: z.string().max(200, "Description must be 200 characters or less").optional(),
  permissions: z.array(z.string()).optional().default([]),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  onSubmit: (values: RoleFormValues) => Promise<void>;
  initialData?: Role | null;
  allPermissions: { id: string; label: string }[];
  onCancel: () => void;
}

export function RoleForm({ onSubmit, initialData, allPermissions, onCancel }: RoleFormProps) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting }, watch } = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      permissions: initialData?.permissions || [],
    },
  });

  const watchedPermissions = watch("permissions");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Role Name</Label>
        <Input id="name" {...register("name")} placeholder="Enter role name (e.g., Content Manager)" />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" {...register("description")} placeholder="Briefly describe this role" />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div>
        <Label>Permissions</Label>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4 mt-1">
          <div className="space-y-2">
            {allPermissions.map(permission => (
              <Controller
                key={permission.id}
                name="permissions"
                control={control}
                render={({ field }) => {
                  const currentPermissions = field.value || [];
                  return (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={currentPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          const newPermissions = checked
                            ? [...currentPermissions, permission.id]
                            : currentPermissions.filter(p => p !== permission.id);
                          field.onChange(newPermissions);
                        }}
                      />
                      <Label htmlFor={`perm-${permission.id}`} className="font-normal text-sm">
                        {permission.label}
                      </Label>
                    </div>
                  );
                }}
              />
            ))}
          </div>
        </ScrollArea>
        {errors.permissions && <p className="text-sm text-destructive mt-1">{errors.permissions.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Role')}
        </Button>
      </div>
    </form>
  );
}
