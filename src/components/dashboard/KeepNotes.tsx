
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote, Sparkles, Loader2, Save } from "lucide-react";
import { summarizeNote, SummarizeNoteOutput } from "@/ai/flows/summarize-note-flow";
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function KeepNotes() {
  const [noteContent, setNoteContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { toast } = useToast();

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
      toast({ title: "Cannot Save", description: "Please enter some content or generate a title for the note.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await addDoc(collection(db, "userNotes"), {
        userId: user.uid,
        content: noteContent,
        title: generatedTitle || "Untitled Note", // Use AI title or a default
        summary: generatedSummary,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: "Note Saved", description: "Your note has been saved to Firestore." });
      // Optionally clear the form
      // setNoteContent("");
      // setGeneratedTitle("");
      // setGeneratedSummary("");
    } catch (e) {
      console.error("Error saving note:", e);
      setError("Failed to save note. Please try again.");
      toast({ title: "Save Failed", description: "Could not save your note.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
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
            placeholder="Type your note here..." 
            className="min-h-[150px] resize-none" 
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            disabled={isSaving || isSummarizing}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="button" 
              onClick={handleSaveNote} 
              disabled={isSaving || isSummarizing || (!noteContent.trim() && !generatedTitle.trim())}
              className="w-full sm:w-auto"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Note
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          {generatedTitle && (
            <div className="space-y-1 pt-2">
              <Label htmlFor="generatedTitle">AI Suggested Title:</Label>
              <Input id="generatedTitle" value={generatedTitle} onChange={e => setGeneratedTitle(e.target.value)} placeholder="AI generated title" disabled={isSaving || isSummarizing} />
            </div>
          )}
          {generatedSummary && (
            <div className="space-y-1">
              <Label htmlFor="generatedSummary">AI Suggested Summary:</Label>
              <Textarea id="generatedSummary" value={generatedSummary} readOnly className="min-h-[80px] bg-muted/50" disabled={isSaving || isSummarizing} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
