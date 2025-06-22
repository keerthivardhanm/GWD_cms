
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ListChecks, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, Timestamp } from 'firebase/firestore';
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
    if (user) {
        fetchTasks();
    }
  }, [fetchTasks, user]);

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
  
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
        if (a.completed && a.completedAt && b.completedAt) {
            return b.completedAt.toMillis() - a.completedAt.toMillis();
        }
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Shared Tasks
        </CardTitle>
        <CardDescription>
          A list of tasks for the team. Check them off as you go.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mt-2 pt-2 border-t">
          {isLoading && (
            <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading tasks...</p>
            </div>
          )}
          {!isLoading && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
                No tasks assigned right now. Great job!
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
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
