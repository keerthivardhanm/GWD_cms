
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller, watch as useWatch } from 'react-hook-form'; // Renamed watch to useWatch
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon, Globe, Shield, Mail, DatabaseBackup, Link as LinkIcon, Palette, Code, Save, RotateCcw, AlertTriangle, Loader2, Users } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLogger';

// Define a Zod schema for all settings
const settingsSchema = z.object({
  // Site Settings
  siteTitle: z.string().optional().default('Apollo CMS'),
  siteTagline: z.string().optional().default(''),
  siteLogoUrl: z.string().url().or(z.literal('')).optional().default(''), // URL will be stored after upload
  faviconUrl: z.string().url().or(z.literal('')).optional().default(''),  // URL will be stored after upload
  defaultLanguage: z.string().optional().default('en'),
  timeZone: z.string().optional().default('UTC'),

  // User & Roles Management (Placeholders, actual management in Access Control)
  defaultUserRole: z.string().optional().default('Viewer'), // Example setting

  // Security Settings
  enable2FA: z.boolean().optional().default(false),
  passwordLength: z.number().min(6).optional().default(8),
  maxLoginAttempts: z.number().min(1).optional().default(5),
  sessionTimeout: z.number().min(5).optional().default(30), // in minutes

  // SEO & Meta Settings
  metaTitle: z.string().optional().default('{page_title} | {site_name}'),
  metaDescription: z.string().optional().default(''),
  metaKeywords: z.string().optional().default(''),
  robotsTxt: z.string().optional().default('User-agent: *\nAllow: /'),
  sitemapUrl: z.string().url().or(z.literal('')).optional().default(''), // URL if manually uploaded/generated

  // Email Notifications
  senderEmail: z.string().email({ message: "Invalid email format."}).or(z.literal('')).optional().default(''),
  smtpServer: z.string().optional().default(''),
  smtpPassword: z.string().optional().default(''), // Store securely if real, this is a placeholder
  welcomeEmailTemplate: z.string().optional().default('Welcome to our platform!'),

  // Backup & Restore
  autoBackup: z.boolean().optional().default(false),
  backupFrequency: z.enum(['Daily', 'Weekly', 'Monthly']).optional().default('Weekly'),
  
  // Analytics & Integrations
  gaID: z.string().optional().default(''),
  fbPixel: z.string().optional().default(''),
  metaCode: z.string().optional().default(''), // For meta tag verification, e.g. Google Search Console

  // Theme & Appearance
  themeMode: z.enum(['Light', 'Dark', 'Auto']).optional().default('Auto'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").or(z.literal('')).optional().default('#FF7F50'), // Default to Coral
  fontFamily: z.string().optional().default('Inter'),

  // Developer Settings
  apiBaseUrl: z.string().url({message: "Invalid URL format."}).or(z.literal('')).optional().default(''),
  envMode: z.enum(['development', 'staging', 'production']).optional().default('development'),
  maintenanceMode: z.boolean().optional().default(false),
  customScriptHeader: z.string().optional().default(''),
  customScriptFooter: z.string().optional().default(''),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const SETTINGS_DOC_ID = "globalAppSettings";
const SETTINGS_COLLECTION = "config"; 

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { control, register, handleSubmit, reset, formState: { errors }, watch: watchForm } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settingsSchema.parse({}), 
  });

  const siteLogoUrlPreview = watchForm("siteLogoUrl");
  const faviconUrlPreview = watchForm("faviconUrl");


  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          const parsedData = settingsSchema.parse(fetchedData);
          reset(parsedData);
        } else {
          reset(settingsSchema.parse({}));
          console.log("No settings document found, using default values from Zod schema.");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({ title: "Error", description: "Failed to load settings. Using defaults.", variant: "destructive" });
        reset(settingsSchema.parse({}));
      } finally {
        setIsLoading(false);
      }
    };
    if(user) { // Only fetch if user is available to ensure permissions potentially
        fetchSettings();
    } else {
        setIsLoading(false); // No user, no settings to fetch for now, use defaults
        reset(settingsSchema.parse({}));
    }
  }, [reset, toast, user]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to save settings.", variant: "destructive"});
        return;
    }
    setIsSaving(true);
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const dataToSave = settingsSchema.parse(data); 
      await setDoc(settingsDocRef, { ...dataToSave, lastUpdatedBy: user?.uid, lastUpdatedByName: userData?.name || user?.email, updatedAt: serverTimestamp() }, { merge: true });
      await logAuditEvent(user, userData, 'SETTINGS_UPDATED', 'GlobalSettings', SETTINGS_DOC_ID, 'Global App Settings', { updatedSettingsKeys: Object.keys(dataToSave) });
      toast({ title: "Success", description: "Settings saved successfully." });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      let errorMessage = "Failed to save settings.";
      if (error instanceof z.ZodError) {
        errorMessage = "Validation error. Please check the fields. Details in console.";
        console.error("Zod validation errors:", error.errors);
      } else if (error.message) {
        errorMessage += ` ${error.message}`;
      }
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Settings"
        description="Manage system-wide configurations for your Apollo CMS."
        actions={
            <Button onClick={handleSubmit(onSubmit)} disabled={isSaving || !user}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
                Save All Settings
            </Button>
        }
      />

      <form> {/* No onSubmit here, PageHeader button triggers it via handleSubmit */}
        <Tabs defaultValue="siteSettings" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto justify-start">
            <TabsTrigger value="siteSettings"><ImageIcon className="mr-2 h-4 w-4" />Site Settings</TabsTrigger>
            <TabsTrigger value="userRoles"><Users className="mr-2 h-4 w-4" />User & Roles</TabsTrigger>
            <TabsTrigger value="securitySettings"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="seoSettings"><Globe className="mr-2 h-4 w-4" />SEO & Meta</TabsTrigger>
            <TabsTrigger value="emailSettings"><Mail className="mr-2 h-4 w-4" />Email Notifications</TabsTrigger>
            <TabsTrigger value="backupSettings"><DatabaseBackup className="mr-2 h-4 w-4" />Backup & Restore</TabsTrigger>
            <TabsTrigger value="integrationSettings"><LinkIcon className="mr-2 h-4 w-4" />Analytics & Integrations</TabsTrigger>
            <TabsTrigger value="themeSettings"><Palette className="mr-2 h-4 w-4" />Theme & Appearance</TabsTrigger>
            <TabsTrigger value="devSettings"><Code className="mr-2 h-4 w-4" />Developer Settings</TabsTrigger>
          </TabsList>

          {/* 1. Site Settings */}
          <TabsContent value="siteSettings">
            <Card>
              <CardHeader><CardTitle>Site Settings</CardTitle><CardDescription>Basic site information and branding.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="siteTitle">Site Title</Label><Input id="siteTitle" {...register("siteTitle")} />{errors.siteTitle && <p className="text-sm text-destructive">{errors.siteTitle.message}</p>}</div>
                <div><Label htmlFor="siteTagline">Site Tagline</Label><Input id="siteTagline" {...register("siteTagline")} />{errors.siteTagline && <p className="text-sm text-destructive">{errors.siteTagline.message}</p>}</div>
                <div><Label htmlFor="siteLogoUrl">Site Logo URL</Label><Input id="siteLogoUrl" type="text" {...register("siteLogoUrl")} placeholder="https://example.com/logo.png" /> {siteLogoUrlPreview && <img src={siteLogoUrlPreview} alt="Logo Preview" className="mt-2 h-16 w-auto object-contain border p-1"/>}<p className="text-xs text-muted-foreground">Enter URL directly. File upload TBD.</p>{errors.siteLogoUrl && <p className="text-sm text-destructive">{errors.siteLogoUrl.message}</p>}</div>
                <div><Label htmlFor="faviconUrl">Favicon URL</Label><Input id="faviconUrl" type="text" {...register("faviconUrl")} placeholder="https://example.com/favicon.ico"/> {faviconUrlPreview && <img src={faviconUrlPreview} alt="Favicon Preview" className="mt-2 h-8 w-8 object-contain border p-1"/>}<p className="text-xs text-muted-foreground">Enter URL directly. File upload TBD.</p>{errors.faviconUrl && <p className="text-sm text-destructive">{errors.faviconUrl.message}</p>}</div>
                <div>
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Controller name="defaultLanguage" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem><SelectItem value="fr">Français</SelectItem><SelectItem value="hi">Hindi</SelectItem></SelectContent></Select>
                  )}/>{errors.defaultLanguage && <p className="text-sm text-destructive">{errors.defaultLanguage.message}</p>}
                </div>
                <div>
                  <Label htmlFor="timeZone">Timezone</Label>
                  <Controller name="timeZone" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="UTC">UTC</SelectItem><SelectItem value="America/New_York">America/New_York (ET)</SelectItem><SelectItem value="Europe/London">Europe/London (GMT)</SelectItem><SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem></SelectContent></Select>
                  )}/>{errors.timeZone && <p className="text-sm text-destructive">{errors.timeZone.message}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. User & Roles Management */}
          <TabsContent value="userRoles">
            <Card>
              <CardHeader><CardTitle>User & Role Management (Defaults)</CardTitle><CardDescription>Configure default settings related to users. Actual management is in Access Control.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="defaultUserRole">Default Role for New Sign-ups</Label>
                     <Controller name="defaultUserRole" control={control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Viewer">Viewer</SelectItem><SelectItem value="Editor">Editor</SelectItem><SelectItem value="Subscriber">Subscriber</SelectItem></SelectContent></Select>
                    )}/>
                    <p className="text-xs text-muted-foreground">Note: This applies if self-registration is enabled (not currently implemented).</p>
                    {errors.defaultUserRole && <p className="text-sm text-destructive">{errors.defaultUserRole.message}</p>}
                </div>
                <p className="text-muted-foreground">Full user and role management (add, edit, delete, permissions) is handled on the <Button variant="link" asChild className="p-0 h-auto"><a href="/access-control">Access Control page</a></Button>.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. Security Settings */}
          <TabsContent value="securitySettings">
            <Card>
              <CardHeader><CardTitle>Security Settings</CardTitle><CardDescription>Configure security policies and options.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Controller name="enable2FA" control={control} render={({ field }) => <Checkbox id="enable2FA" checked={field.value} onCheckedChange={field.onChange} />} />
                  <Label htmlFor="enable2FA">Enable Two-Factor Authentication (2FA) for all users</Label>
                  {errors.enable2FA && <p className="text-sm text-destructive">{errors.enable2FA.message}</p>}
                </div>
                 <p className="text-xs text-muted-foreground">Note: Actual 2FA enforcement requires backend implementation (e.g., Firebase Auth multi-factor).</p>
                <div><Label htmlFor="passwordLength">Minimum Password Length</Label><Input id="passwordLength" type="number" {...register("passwordLength", { valueAsNumber: true })} />{errors.passwordLength && <p className="text-sm text-destructive">{errors.passwordLength.message}</p>}</div>
                <div><Label htmlFor="maxLoginAttempts">Max Login Attempts Before Lockout</Label><Input id="maxLoginAttempts" type="number" {...register("maxLoginAttempts", { valueAsNumber: true })} />{errors.maxLoginAttempts && <p className="text-sm text-destructive">{errors.maxLoginAttempts.message}</p>}</div>
                <div><Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label><Input id="sessionTimeout" type="number" {...register("sessionTimeout", { valueAsNumber: true })} />{errors.sessionTimeout && <p className="text-sm text-destructive">{errors.sessionTimeout.message}</p>}</div>
                 <p className="text-xs text-muted-foreground">Note: Lockout and session timeout enforcement require backend logic.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. SEO & Meta Settings */}
          <TabsContent value="seoSettings">
            <Card>
              <CardHeader><CardTitle>SEO & Meta Configuration</CardTitle><CardDescription>Set global defaults for SEO.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="metaTitle">Default Meta Title Template</Label><Input id="metaTitle" {...register("metaTitle")} placeholder="{page_title} | {site_name}" />{errors.metaTitle && <p className="text-sm text-destructive">{errors.metaTitle.message}</p>}</div>
                <div><Label htmlFor="metaDescription">Default Meta Description</Label><Textarea id="metaDescription" {...register("metaDescription")} />{errors.metaDescription && <p className="text-sm text-destructive">{errors.metaDescription.message}</p>}</div>
                <div><Label htmlFor="metaKeywords">Default Meta Keywords (comma-separated)</Label><Input id="metaKeywords" {...register("metaKeywords")} />{errors.metaKeywords && <p className="text-sm text-destructive">{errors.metaKeywords.message}</p>}</div>
                <div><Label htmlFor="robotsTxt">robots.txt Content</Label><Textarea id="robotsTxt" {...register("robotsTxt")} rows={5} /><p className="text-xs text-muted-foreground">Note: Actual serving of this robots.txt requires web server configuration or dynamic route.</p>{errors.robotsTxt && <p className="text-sm text-destructive">{errors.robotsTxt.message}</p>}</div>
                <div><Label htmlFor="sitemapUrl">Sitemap URL</Label><Input id="sitemapUrl" type="text" {...register("sitemapUrl")} placeholder="URL to sitemap.xml (e.g. /sitemap.xml)" /><p className="text-xs text-muted-foreground">Enter URL to your sitemap. Auto-generation TBD.</p>{errors.sitemapUrl && <p className="text-sm text-destructive">{errors.sitemapUrl.message}</p>}</div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 5. Email Notifications */}
          <TabsContent value="emailSettings">
            <Card>
              <CardHeader><CardTitle>Email Notifications</CardTitle><CardDescription>Configure email sending settings.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200"><AlertTriangle className="inline h-4 w-4 mr-1" />Storing SMTP passwords directly is insecure. Use environment variables or a secrets manager in a real application. This is a placeholder.</p>
                <div><Label htmlFor="senderEmail">Sender Email Address (for system notifications)</Label><Input id="senderEmail" type="email" {...register("senderEmail")} />{errors.senderEmail && <p className="text-sm text-destructive">{errors.senderEmail.message}</p>}</div>
                <div><Label htmlFor="smtpServer">SMTP Server Address</Label><Input id="smtpServer" {...register("smtpServer")} placeholder="e.g., smtp.example.com" />{errors.smtpServer && <p className="text-sm text-destructive">{errors.smtpServer.message}</p>}</div>
                <div><Label htmlFor="smtpPassword">SMTP Password</Label><Input id="smtpPassword" type="password" {...register("smtpPassword")} />{errors.smtpPassword && <p className="text-sm text-destructive">{errors.smtpPassword.message}</p>}</div>
                <div><Label htmlFor="welcomeEmailTemplate">Welcome Email Template (Text or Basic HTML)</Label><Textarea id="welcomeEmailTemplate" {...register("welcomeEmailTemplate")} rows={6} />{errors.welcomeEmailTemplate && <p className="text-sm text-destructive">{errors.welcomeEmailTemplate.message}</p>}</div>
                <Button type="button" variant="outline" onClick={() => alert("Test email functionality requires backend integration.")}>Send Test Email</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 6. Backup & Restore */}
          <TabsContent value="backupSettings">
            <Card>
              <CardHeader><CardTitle>Backup & Restore</CardTitle><CardDescription>Manage data backups and restoration.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200"><AlertTriangle className="inline h-4 w-4 mr-1" />Backup & Restore functionality is complex and requires backend (e.g., Firebase Admin SDK for Firestore export/import, cron jobs). This is a UI placeholder.</p>
                <div className="flex items-center space-x-2">
                  <Controller name="autoBackup" control={control} render={({ field }) => <Checkbox id="autoBackup" checked={field.value} onCheckedChange={field.onChange} />} />
                  <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                </div>
                <div>
                  <Label htmlFor="backupFrequency">Backup Frequency</Label>
                  <Controller name="backupFrequency" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Daily">Daily</SelectItem><SelectItem value="Weekly">Weekly</SelectItem><SelectItem value="Monthly">Monthly</SelectItem></SelectContent></Select>
                  )}/>
                </div>
                <Button type="button" variant="outline" onClick={() => alert("Backup Now functionality requires backend.")}>Backup Now</Button>
                <div><Label htmlFor="restoreFile">Restore from Backup File</Label><Input id="restoreFile" type="file" disabled /><p className="text-xs text-muted-foreground">Upload functionality for restore TBD.</p></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 7. Analytics & Integrations */}
          <TabsContent value="integrationSettings">
            <Card>
              <CardHeader><CardTitle>Analytics & Integrations</CardTitle><CardDescription>Connect to third-party services.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label htmlFor="gaID">Google Analytics Tracking ID</Label><Input id="gaID" {...register("gaID")} placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX" />{errors.gaID && <p className="text-sm text-destructive">{errors.gaID.message}</p>}</div>
                <div><Label htmlFor="fbPixel">Facebook Pixel ID</Label><Input id="fbPixel" {...register("fbPixel")} />{errors.fbPixel && <p className="text-sm text-destructive">{errors.fbPixel.message}</p>}</div>
                <div><Label htmlFor="metaCode">Meta Site Verification Code (HTML Tag)</Label><Input id="metaCode" {...register("metaCode")} placeholder="e.g., <meta name='...' content='...'>" />{errors.metaCode && <p className="text-sm text-destructive">{errors.metaCode.message}</p>}</div>
                <Label>Google Analytics Dashboard Preview:</Label>
                <div className="aspect-video bg-muted rounded-md flex items-center justify-center p-4">
                  <p className="text-muted-foreground text-center">Google Analytics iframe placeholder. Configure GA ID and ensure embedding is allowed for live preview. Actual embedding might be blocked by GA policies if not configured correctly.</p>
                  {/* Example: <iframe src={`https://analytics.google.com/analytics/web/embed/report/ organiquesourcemediumoverview/aYOUR_ACCOUNT_IDwYOUR_WEB_PROPERTY_IDpYOUR_VIEW_ID`} width="100%" height="400" className="border rounded-md"></iframe> */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 8. Theme & Appearance */}
          <TabsContent value="themeSettings">
            <Card>
              <CardHeader><CardTitle>Theme & Appearance</CardTitle><CardDescription>Customize the look and feel.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="themeMode">CMS Theme Mode</Label>
                  <Controller name="themeMode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Light">Light</SelectItem><SelectItem value="Dark">Dark</SelectItem><SelectItem value="Auto">Auto (System Preference)</SelectItem></SelectContent></Select>
                  )}/>
                </div>
                <div>
                  <Label htmlFor="primaryColor">Primary Accent Color (Hex)</Label>
                  <div className="flex items-center gap-2">
                    <Input id="primaryColor" type="text" {...register("primaryColor")} placeholder="#FF7F50" className="w-1/2"/>
                    <Controller name="primaryColor" control={control} render={({field}) => <Input type="color" value={field.value} onChange={field.onChange} className="h-10 p-1 w-12"/> } />
                  </div>
                  {errors.primaryColor && <p className="text-sm text-destructive">{errors.primaryColor.message}</p>}
                </div>
                <div>
                  <Label htmlFor="fontFamily">Default CMS Font Family</Label>
                   <Controller name="fontFamily" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Inter">Inter</SelectItem><SelectItem value="Roboto">Roboto</SelectItem><SelectItem value="Poppins">Poppins</SelectItem><SelectItem value="Open Sans">Open Sans</SelectItem></SelectContent></Select>
                  )}/>
                </div>
                <p className="text-xs text-muted-foreground">Note: Applying these theme changes live to the CMS admin UI requires additional JavaScript to update CSS variables or recompile styles. Public site theme is separate.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 9. Developer Settings */}
          <TabsContent value="devSettings">
            <Card>
              <CardHeader><CardTitle>Developer Settings</CardTitle><CardDescription>Advanced options for developers. Use with caution.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-destructive bg-red-50 p-3 rounded-md border border-red-200"><AlertTriangle className="inline h-4 w-4 mr-1" />Modifying these settings can impact site functionality. Ensure you know what you are doing. Access should be restricted to admin users.</p>
                <div><Label htmlFor="apiBaseUrl">API Base URL (if using external APIs)</Label><Input id="apiBaseUrl" type="url" {...register("apiBaseUrl")} />{errors.apiBaseUrl && <p className="text-sm text-destructive">{errors.apiBaseUrl.message}</p>}</div>
                <div>
                  <Label htmlFor="envMode">Environment Mode</Label>
                  <Controller name="envMode" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="development">Development</SelectItem><SelectItem value="staging">Staging</SelectItem><SelectItem value="production">Production</SelectItem></SelectContent></Select>
                  )}/>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller name="maintenanceMode" control={control} render={({ field }) => <Checkbox id="maintenanceMode" checked={field.value} onCheckedChange={field.onChange} />} />
                  <Label htmlFor="maintenanceMode">Enable Maintenance Mode for Public Site</Label>
                  <p className="text-xs text-muted-foreground">Note: Actual maintenance mode display requires application-level logic.</p>
                </div>
                <div><Label htmlFor="customScriptHeader">Custom Scripts (Header - to be injected into public site &lt;head&gt;)</Label><Textarea id="customScriptHeader" {...register("customScriptHeader")} rows={4} placeholder="e.g., <script>...</script> or <link rel='stylesheet' href='...'>" />{errors.customScriptHeader && <p className="text-sm text-destructive">{errors.customScriptHeader.message}</p>}</div>
                <div><Label htmlFor="customScriptFooter">Custom Scripts (Footer - to be injected into public site before &lt;/body&gt;)</Label><Textarea id="customScriptFooter" {...register("customScriptFooter")} rows={4} placeholder="e.g., <script>...</script>" />{errors.customScriptFooter && <p className="text-sm text-destructive">{errors.customScriptFooter.message}</p>}</div>
                 <p className="text-xs text-muted-foreground">Note: Injecting custom scripts requires careful security considerations and specific implementation in your Next.js layout for the public-facing site.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => reset(settingsSchema.parse(getDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID)).then(snap => snap.exists() ? snap.data() : {})))} disabled={isSaving || isLoading}>
                <RotateCcw className="mr-2 h-4 w-4" /> Revert to Last Saved
            </Button>
            <Button type="button" variant="destructive" onClick={() => { reset(settingsSchema.parse({})); toast({title: "Defaults Loaded", description: "Form reset to schema defaults. Click 'Save All Settings' to persist."}) }} disabled={isSaving}>
                <AlertTriangle className="mr-2 h-4 w-4" /> Reset to Schema Defaults (UI Only)
            </Button>
        </div>
      </form>
    </div>
  );
}
