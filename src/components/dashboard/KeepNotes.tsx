
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote, Sparkles, Loader2, Save, Trash2, AlertTriangle } from "lucide-react";
import { summarizeNote, SummarizeNoteOutput } from "@/ai/flows/summarize-note-flow";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface UserNote {
  id: string;
  content: string;
  title: string;
  summary?: string;
  createdAt: Timestamp; // Expect Timestamp from Firestore
  updatedAt?: Timestamp;
}

export function KeepNotes() {
  const [noteContent, setNoteContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [userNotes, setUserNotes] = useState<UserNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !user.uid) {
      setUserNotes([]);
      setLoadingNotes(false);
      return;
    }

    setLoadingNotes(true);
    const notesQuery = query(
      collection(db, "userNotes"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(notesQuery, (querySnapshot) => {
      const notesData = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          content: data.content || '',
          title: data.title || 'Untitled Note',
          summary: data.summary || '',
          createdAt: data.createdAt as Timestamp, // Ensure this is treated as a Timestamp
          updatedAt: data.updatedAt as Timestamp,
        } as UserNote;
      });
      setUserNotes(notesData);
      setLoadingNotes(false);
    }, (err) => {
      console.error("Error fetching notes:", err);
      setError("Failed to load existing notes.");
      setLoadingNotes(false);
      toast({ title: "Error", description: "Could not load your notes. Check Firestore rules.", variant: "destructive" });
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleSummarize = async () => {
    if (!noteContent.trim()) {
      setError("Please enter some content for the note first.");
      return;
    }
    setIsSummarizing(true);
    setError(null);
    try {
      const result: SummarizeNoteOutput = await summarizeNote({ noteContent });
      setGeneratedTitle(result.title);
      setGeneratedSummary(result.summary);
    } catch (e) {
      console.error("Error summarizing note:", e);
      setError("Failed to generate summary. Please try again.");
      toast({ title: "Summarization Failed", description: "Could not generate summary.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleSaveNote = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save notes.", variant: "destructive" });
      return;
    }
    if (!noteContent.trim() && !generatedTitle.trim()) {
      toast({ title: "Cannot Save", description: "Please enter some content or generate/enter a title for the note.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await addDoc(collection(db, "userNotes"), {
        userId: user.uid, // Ensure userId is saved
        content: noteContent,
        title: generatedTitle || "Untitled Note",
        summary: generatedSummary,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Note Saved", description: "Your note has been saved." });
      setNoteContent("");
      setGeneratedTitle("");
      setGeneratedSummary("");
    } catch (e) {
      console.error("Error saving note:", e);
      setError("Failed to save note. Please try again.");
      toast({ title: "Save Failed", description: "Could not save your note.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "userNotes", noteId));
      toast({ title: "Note Deleted", description: "The note has been removed."});
    } catch (e) {
      console.error("Error deleting note:", e);
      toast({ title: "Delete Failed", description: "Could not delete the note.", variant: "destructive"});
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Keep Notes
        </CardTitle>
        <CardDescription>Jot down quick tasks or reminders. Use AI to summarize and title them! Notes are saved per user.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Type your new note here..."
            className="min-h-[100px] resize-none"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={isSaving || isSummarizing}
          />
          {generatedTitle && (
            <div className="space-y-1">
              <Label htmlFor="generatedTitle">AI Suggested Title (Editable):</Label>
              <Input id="generatedTitle" value={generatedTitle} onChange={e => setGeneratedTitle(e.target.value)} placeholder="AI generated title" disabled={isSaving || isSummarizing} />
            </div>
          )}
          {generatedSummary && (
            <div className="space-y-1">
              <Label htmlFor="generatedSummary">AI Suggested Summary:</Label>
              <Textarea id="generatedSummary" value={generatedSummary} readOnly className="min-h-[60px] bg-muted/50" disabled={isSaving || isSummarizing} />
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              onClick={handleSaveNote}
              disabled={isSaving || isSummarizing || (!noteContent.trim() && !generatedTitle.trim())}
              className="w-full sm:w-auto"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save New Note
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSummarize}
              disabled={isSummarizing || isSaving || !noteContent.trim()}
              className="w-full sm:w-auto"
            >
              {isSummarizing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Summary & Title
            </Button>
          </div>

          {error && <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4"/>{error}</p>}

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-md font-semibold mb-2">Your Saved Notes:</h3>
            {loadingNotes && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="ml-2 text-sm text-muted-foreground">Loading notes...</p>
              </div>
            )}
            {!loadingNotes && !user && (
                 <p className="text-sm text-muted-foreground text-center py-4">Please log in to see your notes.</p>
            )}
            {!loadingNotes && user && userNotes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No notes saved yet. Create one above!</p>
            )}
            {!loadingNotes && userNotes.length > 0 && (
              <ScrollArea className="h-[250px] space-y-3 pr-3">
                {userNotes.map(note => (
                  <Card key={note.id} className="mb-3 bg-muted/30">
                    <CardHeader className="pb-2 pt-3 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{note.title}</CardTitle>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                               <Trash2 className="h-4 w-4" />
                               <span className="sr-only">Delete note</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Note: "{note.title}"?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. The note will be permanently deleted.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteNote(note.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                       {note.createdAt && note.createdAt instanceof Timestamp && <p className="text-xs text-muted-foreground pt-0.5">Saved: {note.createdAt.toDate().toLocaleDateString()}</p>}
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                      {note.summary && (
                        <p className="text-xs text-muted-foreground italic mb-1">Summary: {note.summary}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
    

    