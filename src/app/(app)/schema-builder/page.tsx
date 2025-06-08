import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Save, FileText, Settings2 } from "lucide-react";

const fieldTypes = ["String", "Number", "Boolean", "Timestamp", "Array", "Object"];

export default function SchemaBuilderPage() {
  // Placeholder state for schema fields - in a real app, this would use React state
  const schemaFields = [
    { id: "f1", name: "title", type: "String", required: true, maxLength: 100 },
    { id: "f2", name: "publishDate", type: "Timestamp", required: false },
    { id: "f3", name: "isActive", type: "Boolean", defaultValue: true },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schema Builder"
        description="Define the structure and validation rules for your content files."
        actions={
          <>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Use Schema Template
            </Button>
            <Button>
              <Save className="mr-2 h-4 w-4" /> Save Schema
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Schema Definition</CardTitle>
            <CardDescription>Add and configure fields for your content schema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="schemaName">Schema Name</Label>
              <Input id="schemaName" placeholder="e.g., Blog Post, Product Details" />
            </div>
            
            <div className="space-y-4">
              <Label className="text-lg font-medium">Fields</Label>
              {schemaFields.map((field, index) => (
                <Card key={field.id} className="p-4 bg-muted/50">
                  <div className="grid gap-4 md:grid-cols-3 items-end">
                    <div className="space-y-1">
                      <Label htmlFor={`fieldName-${index}`}>Field Name</Label>
                      <Input id={`fieldName-${index}`} defaultValue={field.name} placeholder="e.g., headline, author_name" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`fieldType-${index}`}>Field Type</Label>
                      <Select defaultValue={field.type}>
                        <SelectTrigger id={`fieldType-${index}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 pt-5">
                       <Button variant="outline" size="icon">
                        <Settings2 className="h-4 w-4" />
                        <span className="sr-only">Field Settings</span>
                      </Button>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete Field</span>
                      </Button>
                    </div>
                  </div>
                  {/* Basic validation options */}
                  <div className="mt-4 grid grid-cols-2 gap-4 items-center">
                     <div className="flex items-center space-x-2">
                        <Checkbox id={`required-${index}`} checked={field.required} />
                        <Label htmlFor={`required-${index}`} className="text-sm font-normal">Required</Label>
                      </div>
                      {field.type === "String" && (
                         <div className="space-y-1">
                            <Label htmlFor={`maxLength-${index}`} className="text-sm">Max Length</Label>
                            <Input id={`maxLength-${index}`} type="number" defaultValue={field.maxLength} className="h-8"/>
                        </div>
                      )}
                      {field.type === "Boolean" && typeof field.defaultValue === 'boolean' && (
                        <div className="flex items-center space-x-2">
                           <Checkbox id={`defaultValue-${index}`} checked={field.defaultValue} />
                           <Label htmlFor={`defaultValue-${index}`} className="text-sm font-normal">Default: True</Label>
                        </div>
                      )}
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Field
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Live Preview (Placeholder)</CardTitle>
              <CardDescription>See how a block using this schema might look.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Live component preview will appear here based on schema rules.</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Validation Options</CardTitle>
              <CardDescription>More advanced validation rules (regex, min/max values, etc.) can be configured per field.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Required fields</li>
                <li>Max/Min length (for strings)</li>
                <li>Max/Min value (for numbers)</li>
                <li>Regular expression patterns</li>
                <li>Default values</li>
                <li>Custom validation functions (advanced)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
