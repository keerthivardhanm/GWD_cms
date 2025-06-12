
"use client";

import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import type { PageFormValues } from '../PageForm'; 
import { CentreFacilitySchema } from '@/schemas/pages/centresOverviewPageSchema';

interface CentreItemFormProps {
  centreIndex: number;
  removeCentre: (index: number) => void;
}

// Helper to get nested errors
const getNestedError = (errors: any, path: string): any => {
    if (!errors || typeof errors !== 'object') return null;
    return path.split('.').reduce((o, k) => (o && typeof o === 'object' && k in o ? (o as any)[k] : null), errors);
};


export function CentreItemForm({ centreIndex, removeCentre }: CentreItemFormProps) {
  // Use PageFormValues for the useFormContext hook if it's the root form type
  const { control, register, formState: { errors } } = useFormContext<PageFormValues>();

  const facilitiesName = `content.centresList.${centreIndex}.facilities` as const;
  const { fields: facilitiesFields, append: appendFacility, remove: removeFacility } = useFieldArray({
    control,
    name: facilitiesName,
  });

  const centreItemErrorBasePath = `content.centresList.${centreIndex}`;

  return (
    <Card className="p-4 bg-muted/30 mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-0 pt-0">
        <CardTitle className="text-md">Centre Item {centreIndex + 1}</CardTitle>
        <Button type="button" variant="destructive" size="sm" onClick={() => removeCentre(centreIndex)}>
          <Trash2 className="mr-1 h-3 w-3"/> Remove Centre
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pb-0">
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.name`}>Centre Name</Label>
          <Input {...register(`content.centresList.${centreIndex}.name` as const)} placeholder="e.g., Chennai Centre" />
          {getNestedError(errors, `${centreItemErrorBasePath}.name`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.name`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.imageSrc`}>Image URL</Label>
          <Input {...register(`content.centresList.${centreIndex}.imageSrc` as const)} placeholder="https://placehold.co/400x300.png" />
           {getNestedError(errors, `${centreItemErrorBasePath}.imageSrc`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.imageSrc`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.imageAlt`}>Image Alt Text</Label>
          <Input {...register(`content.centresList.${centreIndex}.imageAlt` as const)} placeholder="Alt text for centre image" />
          {getNestedError(errors, `${centreItemErrorBasePath}.imageAlt`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.imageAlt`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.description`}>Description</Label>
          <Textarea {...register(`content.centresList.${centreIndex}.description` as const)} placeholder="Brief description of the centre" />
          {getNestedError(errors, `${centreItemErrorBasePath}.description`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.description`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.address`}>Address</Label>
          <Input {...register(`content.centresList.${centreIndex}.address` as const)} placeholder="Full address" />
          {getNestedError(errors, `${centreItemErrorBasePath}.address`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.address`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.phone`}>Phone</Label>
          <Input {...register(`content.centresList.${centreIndex}.phone` as const)} placeholder="+91 000 000 0000" />
          {getNestedError(errors, `${centreItemErrorBasePath}.phone`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.phone`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.email`}>Email</Label>
          <Input type="email" {...register(`content.centresList.${centreIndex}.email` as const)} placeholder="centre@example.com" />
          {getNestedError(errors, `${centreItemErrorBasePath}.email`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.email`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.facilitiesHeading`}>Facilities Section Heading</Label>
          <Input {...register(`content.centresList.${centreIndex}.facilitiesHeading` as const)} placeholder="Key Facilities" />
          {getNestedError(errors, `${centreItemErrorBasePath}.facilitiesHeading`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.facilitiesHeading`) as any)?.message}</p>}
        </div>


        <Card className="my-2 p-3">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-sm flex justify-between items-center">
              Key Facilities
              <Button type="button" variant="outline" size="xs" onClick={() => appendFacility(CentreFacilitySchema.parse({}))}>
                <PlusCircle className="mr-1 h-3 w-3"/> Add Facility
              </Button>
            </CardTitle>
            {getNestedError(errors, `${centreItemErrorBasePath}.facilities`) && !Array.isArray(getNestedError(errors, `${centreItemErrorBasePath}.facilities`)) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.facilities`) as any)?.message}</p>}
          </CardHeader>
          <CardContent className="p-0 space-y-2">
            {facilitiesFields.map((facilityField, facilityIndex) => {
              const facilityErrorBasePath = `${centreItemErrorBasePath}.facilities.${facilityIndex}`;
              return (
                <Card key={facilityField.id} className="p-2 bg-background/70 space-y-1">
                   <div className="flex justify-between items-center">
                     <h5 className="font-medium text-xs mb-1">Facility {facilityIndex + 1}</h5>
                     <Button type="button" variant="ghost" size="xs" className="text-destructive hover:text-destructive" onClick={() => removeFacility(facilityIndex)}>
                        <Trash2 className="h-3 w-3"/>
                     </Button>
                   </div>
                  <div>
                    <Label htmlFor={`${facilitiesName}.${facilityIndex}.iconClass`}>Facility Icon Class</Label>
                    <Input {...register(`${facilitiesName}.${facilityIndex}.iconClass` as const)} placeholder="e.g., lucide:FlaskConical or fas fa-flask" />
                    {getNestedError(errors, `${facilityErrorBasePath}.iconClass`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${facilityErrorBasePath}.iconClass`) as any)?.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor={`${facilitiesName}.${facilityIndex}.text`}>Facility Text</Label>
                    <Input {...register(`${facilitiesName}.${facilityIndex}.text` as const)} placeholder="e.g., Advanced Simulation Labs" />
                    {getNestedError(errors, `${facilityErrorBasePath}.text`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${facilityErrorBasePath}.text`) as any)?.message}</p>}
                  </div>
                </Card>
              )
            })}
            
          </CardContent>
        </Card>

        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.detailsButtonText`}>Details Button Text</Label>
          <Input {...register(`content.centresList.${centreIndex}.detailsButtonText` as const)} placeholder="View Details" />
          {getNestedError(errors, `${centreItemErrorBasePath}.detailsButtonText`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.detailsButtonText`) as any)?.message}</p>}
        </div>
        <div>
          <Label htmlFor={`content.centresList.${centreIndex}.detailsButtonLink`}>Details Button Link (Slug)</Label>
          <Input {...register(`content.centresList.${centreIndex}.detailsButtonLink` as const)} placeholder="/centres/centre-slug" />
          {getNestedError(errors, `${centreItemErrorBasePath}.detailsButtonLink`) && <p className="text-xs text-destructive mt-1">{(getNestedError(errors, `${centreItemErrorBasePath}.detailsButtonLink`) as any)?.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
