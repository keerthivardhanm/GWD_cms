
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadCloud, Image as ImageIcon, Globe, FileText, Users, Shield, Save, PlusCircle } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Settings"
        description="Manage system-wide configurations for your Apollo CMS."
        actions={
            <Button>
                <Save className="mr-2 h-4 w-4" /> Save All Settings
            </Button>
        }
      />

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding"><ImageIcon className="mr-2 h-4 w-4" />Branding</TabsTrigger>
          <TabsTrigger value="seo"><Globe className="mr-2 h-4 w-4" />SEO Defaults</TabsTrigger>
          <TabsTrigger value="schema_templates"><FileText className="mr-2 h-4 w-4" />Schema Templates</TabsTrigger>
          <TabsTrigger value="roles_permissions"><Users className="mr-2 h-4 w-4" />Default Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Customize the look and feel of your CMS and public-facing elements.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" data-ai-hint="logo placeholder" />
                    </div>
                    <Input id="logo" type="file" className="max-w-xs" />
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: SVG or PNG, max 2MB.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon</Label>
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" data-ai-hint="favicon placeholder" />
                    </div>
                    <Input id="favicon" type="file" className="max-w-xs" />
                  </div>
                  <p className="text-xs text-muted-foreground">Recommended: ICO or PNG (32x32px).</p>
                </div>
              </div>
               <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name / App Title</Label>
                  <Input id="siteName" placeholder="Apollo CMS" defaultValue="Apollo CMS" />
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default SEO Meta Tags</CardTitle>
              <CardDescription>Set default meta titles, descriptions, and keywords for new pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Default Meta Title Template</Label>
                <Input id="metaTitle" placeholder="{page_title} | {site_name}" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Default Meta Description</Label>
                <Textarea id="metaDescription" placeholder="Enter a general description for your site or content." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Default Meta Keywords (comma-separated)</Label>
                <Input id="metaKeywords" placeholder="cms, content, apollo" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema_templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schema Templates Management</CardTitle>
              <CardDescription>Create, edit, or delete pre-defined schema templates for quick setup.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for schema templates list and management */}
              <p className="text-muted-foreground">Schema template management UI will be here. (e.g., list of templates with edit/delete options).</p>
              <Button variant="outline" className="mt-4"><PlusCircle className="mr-2 h-4 w-4" /> Create New Template</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles_permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Default Roles & Permissions</CardTitle>
              <CardDescription>Configure the default set of roles and their base permissions for new installations or resets.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for default roles and permissions */}
              <p className="text-muted-foreground">Default roles (Admin, Editor, Viewer) and their base permissions will be listed here for review. Modifications might be restricted or require specific confirmations.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
