
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { Notebook, Trash2, PlusCircle } from "lucide-react";
import { ScrollArea } from '@/components/ui/scroll-area';

interface Note {
  id: string;
  text: string;
}

const LOCAL_STORAGE_KEY = 'apollo-cms-private-notes';

export function KeepNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedNotes = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      }
    } catch (error) {
        console.error("Failed to parse notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
    }
  }, [notes, isMounted]);

  const handleAddNote = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      text: newNoteText.trim(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setNewNoteText("");
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };
  
  if (!isMounted) {
      return null; // or a loading skeleton
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Notebook className="h-5 w-5" />
          My Private Notes
        </CardTitle>
        <CardDescription>
          A personal scratchpad. Notes are saved only in your browser.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddNote} className="space-y-3 mb-6">
            <div>
                <Label htmlFor="newNoteText" className="sr-only">New Note</Label>
                <div className="flex gap-2">
                <Input
                    id="newNoteText"
                    placeholder="Add a new private note..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                />
                <Button type="submit" size="icon" aria-label="Add Note">
                    <PlusCircle className="h-5 w-5" />
                </Button>
                </div>
            </div>
        </form>

        <div className="mt-2 pt-2 border-t">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet. Add one above!
            </p>
          ) : (
            <ScrollArea className="h-[280px] space-y-2 pr-3">
              {notes.map(note => (
                <div key={note.id} className="flex items-center justify-between gap-2 py-2 border-b last:border-b-0 group">
                    <p className="text-sm flex-1 break-words">{note.text}</p>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
                        onClick={() => handleDeleteNote(note.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete note</span>
                    </Button>
                </div>
              ))}
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

    