
"use client"; // Added "use client" for Checkbox interaction in preview
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Save, FileText, Eye, ListChecks, Download, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox"; // Added Checkbox import

// Example form fields - this would be dynamic based on schema/user input
const formFields = [
  { id: "ff1", label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
  { id: "ff2", label: "Email Address", type: "email", required: true, placeholder: "you@example.com" },
  { id: "ff3", label: "Message", type: "textarea", required: true, placeholder: "Your message..." },
  { id: "ff4", label: "Subscribe to Newsletter", type: "checkbox", defaultChecked: false },
  { id: "ff5", label: "Inquiry Type", type: "select", options: ["General", "Support", "Sales"], required: true },
];

export default function FormBuilderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Builder"
        description="Create and manage forms using schema logic. Store responses or export them."
        actions={
          <>
            <Button variant="outline"><ListChecks className="mr-2 h-4 w-4" /> View Submissions</Button>
            <Button><Save className="mr-2 h-4 w-4" /> Save Form</Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Fields Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Configuration</CardTitle>
            <CardDescription>Define the fields and settings for your form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="formName">Form Name</Label>
              <Input id="formName" placeholder="e.g., Contact Us, Feedback Form" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="formSchema">Base Schema (Optional)</Label>
              <Select>
                <SelectTrigger id="formSchema">
                  <SelectValue placeholder="Select a schema to base this form on" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact_schema">Contact Inquiry Schema</SelectItem>
                  <SelectItem value="feedback_schema">User Feedback Schema</SelectItem>
                  <SelectItem value="custom">Custom (No Schema)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <Label className="text-lg font-medium">Form Fields</Label>
              {/* This section would be dynamically generated */}
              {formFields.slice(0, 2).map((field, index) => ( // Show a couple of example fields
                <Card key={field.id} className="p-4 bg-muted/50">
                  <div className="grid gap-4 md:grid-cols-2 items-end">
                    <div className="space-y-1">
                      <Label htmlFor={`fieldLabel-${index}`}>Field Label</Label>
                      <Input id={`fieldLabel-${index}`} defaultValue={field.label} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`fieldType-${index}`}>Field Type</Label>
                      <Select defaultValue={field.type}>
                        <SelectTrigger id={`fieldType-${index}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                           <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox id={`fieldRequired-${index}`} checked={field.required} />
                        <Label htmlFor={`fieldRequired-${index}`} className="text-sm font-normal">Required</Label>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Settings2 className="h-4 w-4" /> <span className="sr-only">Configure</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" /> <span className="sr-only">Delete</span>
                        </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button variant="outline" className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Field
            </Button>
          </CardContent>
        </Card>

        {/* Form Preview and Settings */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Form Preview</CardTitle>
              <CardDescription>A live preview of how your form will look.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 border border-dashed rounded-md bg-background">
              {/* Dynamically render form fields based on configuration */}
              {formFields.map(field => (
                <div key={field.id} className="space-y-1">
                  <Label htmlFor={`preview-${field.id}`}>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
                  {field.type === "text" && <Input id={`preview-${field.id}`} placeholder={field.placeholder} />}
                  {field.type === "email" && <Input type="email" id={`preview-${field.id}`} placeholder={field.placeholder} />}
                  {field.type === "textarea" && <Textarea id={`preview-${field.id}`} placeholder={field.placeholder} />}
                  {field.type === "checkbox" && (
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox id={`preview-${field.id}`} defaultChecked={field.defaultChecked as boolean} />
                       <Label htmlFor={`preview-${field.id}`} className="font-normal">{field.label}</Label> 
                    </div>
                  )}
                   {field.type === "select" && (
                    <Select>
                        <SelectTrigger id={`preview-${field.id}`}>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {(field.options as string[]).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
              <Button className="w-full mt-4 bg-primary hover:bg-primary/90">Submit (Preview)</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Handling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Storage Option</Label>
                <Select defaultValue="firestore">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="firestore">Save to Firestore</SelectItem>
                    <SelectItem value="webhook">Send to Webhook</SelectItem>
                    <SelectItem value="email">Email Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" /> Export Responses as CSV
              </Button>
               <div className="flex items-center space-x-2 pt-2">
                <Switch id="enable-recaptcha" />
                <Label htmlFor="enable-recaptcha">Enable reCAPTCHA</Label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
