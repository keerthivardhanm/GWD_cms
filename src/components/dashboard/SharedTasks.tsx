
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
import { logAuditEvent } from '@/lib/auditLogger';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp;
  createdBy: { userId: string; userName: string };
  completedBy?: { userId: string; userName: string };
  completedAt?: Timestamp;
}

export function SharedTasks() {
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

  const handleAddTask = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
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
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error("Error adding task:", error);
      toast({ title: "Error", description: "Failed to add task.", variant: "destructive" });
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean, taskText: string) => {
    if (!user || !userData) return;
    
    const taskRef = doc(db, "sharedTasks", taskId);
    const updateData = {
      completed: !currentStatus,
      completedBy: { userId: user.uid, userName: userData.name },
      completedAt: serverTimestamp(),
    };
    
    try {
      await updateDoc(taskRef, updateData);
      if (updateData.completed) {
        await logAuditEvent(user, userData, 'TASK_COMPLETED', 'SharedTask', taskId, taskText);
        toast({ title: "Task Completed!", description: `Great job on finishing "${taskText.substring(0, 20)}...".`});
      }
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    }
  };

  const handleDeleteTask = async (taskId: string, taskText: string) => {
    if (!user || !userData || userData.role !== 'Admin') return;

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
  
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
        // Uncompleted tasks are sorted by newest first
        // Completed tasks are sorted by newest completion first
        if (a.completed && a.completedAt && b.completedAt) {
            return b.completedAt.toMillis() - a.completedAt.toMillis();
        }
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  const isAdmin = userData?.role === 'Admin';

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Shared Tasks
        </CardTitle>
        <CardDescription>
          {isAdmin ? "Assign tasks to all users. They will be notified." : "Tasks assigned by your administrator."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isAdmin && (
            <form onSubmit={handleAddTask} className="space-y-3 mb-6">
                <div>
                    <Label htmlFor="newTaskText" className="sr-only">New Task</Label>
                    <div className="flex gap-2">
                    <Input
                        id="newTaskText"
                        placeholder="Add a new shared task..."
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                    />
                    <Button type="submit" size="icon" aria-label="Add Task">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                    </div>
                </div>
            </form>
        )}

        <div className="mt-2 pt-2 border-t">
          {isLoading && (
            <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading tasks...</p>
            </div>
          )}
          {!isLoading && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
                {isAdmin ? "No tasks yet. Add one above!" : "No tasks assigned right now."}
            </p>
          )}
          {!isLoading && tasks.length > 0 && (
            <ScrollArea className="h-[280px] space-y-2 pr-3">
              {sortedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id, task.completed, task.text)}
                      aria-label={task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                      className="mt-1"
                    />
                    <div className="flex-1">
                        <Label
                        htmlFor={`task-${task.id}`}
                        className={`flex-1 break-words cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                        title={task.text}
                        >
                        {task.text}
                        </Label>
                        {task.completed && task.completedBy && (
                            <p className="text-xs text-muted-foreground/80 mt-1">
                                Completed by {task.completedBy.userName}
                            </p>
                        )}
                    </div>
                  </div>
                  {isAdmin && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete task {task.text}</span>
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task: "{task.text.substring(0,30)}{task.text.length > 30 ? '...' : ''}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. The task will be permanently deleted for all users.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteTask(task.id, task.text)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
