
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ListChecks, Loader2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, serverTimestamp, query, orderBy, Timestamp, where, deleteField } from 'firebase/firestore';
import { logAuditEvent } from '@/lib/auditLogger';

interface Task {
  id: string;
  text: string;
  completedBy: Record<string, Timestamp>;
  assignedTo: string[];
  createdAt: Timestamp;
}

export function SharedTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, userData } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const tasksQuery = query(
        collection(db, "tasks"), 
        where("assignedTo", "array-contains", user.uid), 
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(tasksQuery);
      const fetchedTasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({ title: "Error", description: "Could not fetch your assigned tasks.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
        fetchTasks();
    }
  }, [fetchTasks, user]);

  const handleToggleTask = async (task: Task) => {
    if (!user || !userData) return;
    
    const taskRef = doc(db, "tasks", task.id);
    const isCompleted = task.completedBy && task.completedBy[user.uid];

    const updateData = {
      [`completedBy.${user.uid}`]: isCompleted ? deleteField() : serverTimestamp()
    };
    
    try {
      await updateDoc(taskRef, updateData);
      if (!isCompleted) {
        await logAuditEvent(user, userData, 'TASK_COMPLETED', 'Task', task.id, task.text);
        toast({ title: "Task Completed!", description: `Great job on finishing "${task.text.substring(0, 20)}...".`});
      }
      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
      toast({ title: "Error", description: "Failed to update task status.", variant: "destructive" });
    }
  };
  
  const sortedTasks = React.useMemo(() => {
    if (!user) return [];
    return [...tasks].sort((a, b) => {
      const aCompleted = a.completedBy && a.completedBy[user.uid];
      const bCompleted = b.completedBy && b.completedBy[user.uid];

      if (!!aCompleted === !!bCompleted) {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      }
      return aCompleted ? 1 : -1;
    });
  }, [tasks, user]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          My Assigned Tasks
        </CardTitle>
        <CardDescription>
          A list of tasks assigned to you by an admin.
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
                You have no assigned tasks. Great job!
            </p>
          )}
          {!isLoading && tasks.length > 0 && (
            <ScrollArea className="h-[280px] space-y-2 pr-3">
              {sortedTasks.map(task => {
                const isCurrentUserCompleted = task.completedBy && !!task.completedBy[user?.uid || ''];
                return (
                    <div key={task.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <Checkbox
                        id={`task-${task.id}`}
                        checked={isCurrentUserCompleted}
                        onCheckedChange={() => handleToggleTask(task)}
                        aria-label={isCurrentUserCompleted ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                        className="mt-1"
                        />
                        <div className="flex-1">
                            <Label
                            htmlFor={`task-${task.id}`}
                            className={`flex-1 break-words cursor-pointer ${isCurrentUserCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                            title={task.text}
                            >
                            {task.text}
                            </Label>
                        </div>
                    </div>
                    </div>
                );
              })}
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
