
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks, Trash2, PlusCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const LOCAL_STORAGE_KEY = 'dashboardUserTasks';

export function KeepNotes() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Error loading tasks from localStorage:", error);
      toast({ title: "Error", description: "Could not load tasks from local storage.", variant: "destructive" });
    }
    setIsLoadingTasks(false);
  }, [toast]);

  useEffect(() => {
    if (!isLoadingTasks) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Error saving tasks to localStorage:", error);
            toast({ title: "Error", description: "Could not save tasks to local storage.", variant: "destructive" });
        }
    }
  }, [tasks, isLoadingTasks, toast]);

  const handleAddTask = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!newTaskText.trim()) {
      toast({ title: "Cannot Add Task", description: "Task text cannot be empty.", variant: "destructive" });
      return;
    }

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setNewTaskText("");
    toast({ title: "Task Added", description: `"${newTask.text.substring(0,20)}..." added.`});
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (taskToDelete) {
        toast({ title: "Task Deleted", description: `"${taskToDelete.text.substring(0,20)}..." removed.` });
    }
  };
  
  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed === b.completed) {
        return b.createdAt - a.createdAt;
      }
      return a.completed ? 1 : -1;
    });
  }, [tasks]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          My Tasks
        </CardTitle>
        <CardDescription>A simple to-do list. Tasks are stored in your browser.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="space-y-3 mb-6">
          <div>
            <Label htmlFor="newTaskText" className="sr-only">New Task</Label>
            <div className="flex gap-2">
              <Input
                id="newTaskText"
                placeholder="Add a new task..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
              <Button type="submit" size="icon" aria-label="Add Task">
                <PlusCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-2 pt-2 border-t">
          <h3 className="text-md font-semibold mb-2 text-muted-foreground">Your Tasks:</h3>
          {isLoadingTasks && (
            <p className="text-sm text-muted-foreground text-center py-4">Loading tasks...</p>
          )}
          {!isLoadingTasks && tasks.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one above!</p>
          )}
          {!isLoadingTasks && tasks.length > 0 && (
            <ScrollArea className="h-[280px] space-y-2 pr-3">
              {sortedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0 animate-in fade-in-50 duration-300">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                      aria-label={task.completed ? `Mark task '${task.text}' as incomplete` : `Mark task '${task.text}' as complete`}
                    />
                    <Label
                      htmlFor={`task-${task.id}`}
                      className={`flex-1 truncate cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      title={task.text}
                    >
                      {task.text}
                    </Label>
                  </div>
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
                          This action cannot be undone. The task will be permanently deleted from your browser storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
