
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageIcon, Shield, Save, RotateCcw, AlertTriangle, Loader2, Users, Globe, ClipboardList, Trash2, PlusCircle } from "lucide-react";
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, getDocs, addDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { logAuditEvent } from '@/lib/auditLogger';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// Define a Zod schema for all settings
const settingsSchema = z.object({
  // Site Settings
  siteTitle: z.string().optional().default('Apollo CMS'),
  siteTagline: z.string().optional().default(''),
  siteUrl: z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)"}).or(z.literal('')).optional().default(''),
  siteLogoUrl: z.string().url().or(z.literal('')).optional().default(''), 
  faviconUrl: z.string().url().or(z.literal('')).optional().default(''),  
  defaultLanguage: z.string().optional().default('en'),
  timeZone: z.string().optional().default('UTC'),

  // User & Roles Management
  defaultUserRole: z.string().optional().default('Viewer'), 

  // Security Settings
  enable2FA: z.boolean().optional().default(false),
  passwordLength: z.number().min(6).optional().default(8),
  maxLoginAttempts: z.number().min(1).optional().default(5),
  sessionTimeout: z.number().min(5).optional().default(30), // in minutes
});

type SettingsFormValues = z.infer<typeof settingsSchema>;
interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  createdBy: { userId: string; userName: string };
  completedBy?: { userId: string; userName: string };
  completedAt?: Timestamp;
}


const SETTINGS_DOC_ID = "globalAppSettings";
const SETTINGS_COLLECTION = "config"; 

// Shared Tasks Component Logic, integrated into Settings page
const SharedTasksManager = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { user, userData } = useAuth();

    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const tasksQuery = query(collection(db, "sharedTasks"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(tasksQuery);
            const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            toast({ title: "Error", description: "Could not fetch shared tasks.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);
    
    const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskText.trim() || !user || !userData) return;

        const taskData = {
          text: newTaskText.trim(),
          completed: false,
          createdAt: serverTimestamp(),
          createdBy: { userId: user.uid, userName: userData.name },
        };

        try {
          const newDocRef = await addDoc(collection(db, "sharedTasks"), taskData);
          await logAuditEvent(user, userData, 'TASK_CREATED', 'SharedTask', newDocRef.id, taskData.text);
          setNewTaskText("");
          toast({ title: "Task Added", description: `"${taskData.text.substring(0,20)}..." added.`});
          fetchTasks(); 
        } catch (error) {
          console.error("Error adding task:", error);
          toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
        }
    };
    
    const handleDeleteTask = async (taskId: string, taskText: string) => {
        if (!user || !userData) return;

        try {
          await deleteDoc(doc(db, "sharedTasks", taskId));
          await logAuditEvent(user, userData, 'TASK_DELETED', 'SharedTask', taskId, taskText);
          toast({ title: "Task Deleted", description: `Task "${taskText.substring(0,20)}..." removed.` });
          fetchTasks();
        } catch (error) {
          console.error("Error deleting task:", error);
          toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Shared Tasks</CardTitle>
                <CardDescription>Add or remove tasks that will appear on every user's dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                    <Input
                        placeholder="Add a new shared task..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <Button type="submit" disabled={!newTaskText.trim()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                </form>
                
                <div className="border rounded-md">
                     {isLoading ? (
                        <div className="flex items-center justify-center p-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                     ) : tasks.length === 0 ? (
                        <p className="p-4 text-center text-muted-foreground">No shared tasks yet. Add one above.</p>
                     ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium">{task.text}</TableCell>
                                        <TableCell className="text-muted-foreground">{task.completed ? `Completed by ${task.completedBy?.userName || 'a user'}` : 'Incomplete'}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete the task "{task.text}" for all users. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteTask(task.id, task.text)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     )}
                </div>
            </CardContent>
        </Card>
    );
};


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
      } catch (error: any) {
        console.error("Error fetching settings:", error);
        toast({ title: "Error", description: `Failed to load settings: ${error.message}. Using defaults.`, variant: "destructive" });
        reset(settingsSchema.parse({}));
      } finally {
        setIsLoading(false);
      }
    };
    if(user) { 
        fetchSettings();
    } else {
        setIsLoading(false); 
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

  const handleRevert = async () => {
    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
      const docSnap = await getDoc(settingsDocRef);
      if (docSnap.exists()) {
        reset(settingsSchema.parse(docSnap.data()));
        toast({ title: "Reverted", description: "Settings reverted to last saved state."});
      } else {
        reset(settingsSchema.parse({}));
        toast({ title: "Reverted", description: "No saved settings found. Reverted to schema defaults."});
      }
    } catch (error) {
       console.error("Error reverting settings:", error);
       toast({ title: "Error", description: "Could not revert settings.", variant: "destructive" });
    } finally {
        setIsLoading(false);
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

      
        <Tabs defaultValue="siteSettings" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto justify-start">
            <TabsTrigger value="siteSettings"><Globe className="mr-2 h-4 w-4" />Site Settings</TabsTrigger>
            <TabsTrigger value="userRoles"><Users className="mr-2 h-4 w-4" />User & Roles</TabsTrigger>
            {userData?.role === 'Admin' && <TabsTrigger value="sharedTasks"><ClipboardList className="mr-2 h-4 w-4" />Shared Tasks</TabsTrigger>}
            <TabsTrigger value="securitySettings"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
          </TabsList>

          {/* 1. Site Settings */}
          <TabsContent value="siteSettings">
            <form>
                <Card>
                <CardHeader><CardTitle>Site Settings</CardTitle><CardDescription>Basic site information and branding.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                    <div><Label htmlFor="siteTitle">Site Title</Label><Input id="siteTitle" {...register("siteTitle")} />{errors.siteTitle && <p className="text-sm text-destructive">{errors.siteTitle.message}</p>}</div>
                    <div><Label htmlFor="siteTagline">Site Tagline</Label><Input id="siteTagline" {...register("siteTagline")} />{errors.siteTagline && <p className="text-sm text-destructive">{errors.siteTagline.message}</p>}</div>
                    <div><Label htmlFor="siteUrl">Site URL (for 'View Live Site' button)</Label><Input id="siteUrl" type="url" {...register("siteUrl")} placeholder="https://www.example.com" />{errors.siteUrl && <p className="text-sm text-destructive">{errors.siteUrl.message}</p>}</div>
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
            </form>
          </TabsContent>

          {/* 2. User & Roles Management */}
          <TabsContent value="userRoles">
            <form>
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
            </form>
          </TabsContent>

          {/* 3. Shared Tasks Management */}
          {userData?.role === 'Admin' && (
              <TabsContent value="sharedTasks">
                  <SharedTasksManager />
              </TabsContent>
          )}

          {/* 4. Security Settings */}
          <TabsContent value="securitySettings">
            <form>
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
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8 pt-6 border-t flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleRevert} disabled={isSaving || isLoading}>
                <RotateCcw className="mr-2 h-4 w-4" /> Revert to Last Saved
            </Button>
            <Button type="button" variant="destructive" onClick={() => { reset(settingsSchema.parse({})); toast({title: "Defaults Loaded", description: "Form reset to schema defaults. Click 'Save All Settings' to persist."}) }} disabled={isSaving}>
                <AlertTriangle className="mr-2 h-4 w-4" /> Reset to Schema Defaults (UI Only)
            </Button>
        </div>
      
    </div>
  );
}
