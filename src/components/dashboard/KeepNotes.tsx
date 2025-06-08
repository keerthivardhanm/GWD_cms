
"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickyNote, Sparkles, Loader2 } from "lucide-react";
import { summarizeNote, SummarizeNoteOutput } from "@/ai/flows/summarize-note-flow"; // Import the flow

export function KeepNotes() {
  const [noteContent, setNoteContent] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedSummary, setGeneratedSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!noteContent.trim()) {
      setError("Please enter some content for the note first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedTitle("");
    setGeneratedSummary("");
    try {
      const result: SummarizeNoteOutput = await summarizeNote({ noteContent });
      setGeneratedTitle(result.title);
      setGeneratedSummary(result.summary);
    } catch (e) {
      console.error("Error summarizing note:", e);
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StickyNote className="h-5 w-5" />
          Keep Notes
        </CardTitle>
        <CardDescription>Jot down quick tasks or reminders. Use AI to summarize and title them!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea 
            placeholder="Type your note here..." 
            className="min-h-[150px] resize-none" 
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="submit" className="w-full sm:w-auto">Save Note (Local)</Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSummarize} 
              disabled={isLoading || !noteContent.trim()}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
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
              <Input id="generatedTitle" value={generatedTitle} readOnly className="bg-muted/50"/>
            </div>
          )}
          {generatedSummary && (
            <div className="space-y-1">
              <Label htmlFor="generatedSummary">AI Suggested Summary:</Label>
              <Textarea id="generatedSummary" value={generatedSummary} readOnly className="min-h-[80px] bg-muted/50" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
