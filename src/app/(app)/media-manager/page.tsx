
"use client";
import React, { useEffect, useState } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Search, Image as ImageIconLucide, Video, FileTextIcon as FileTextIconLucide, MoreVertical, Edit3, Link2, Trash, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image"; // Using next/image for optimized images
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | string; // Allow string for flexibility
  url: string;
  size: string;
  tags: string[];
  status: string;
  dataAiHint?: string;
}

const getIconForType = (type: string) => {
  if (type === "image") return <ImageIconLucide className="h-8 w-8 text-muted-foreground" />;
  if (type === "video") return <Video className="h-8 w-8 text-muted-foreground" />;
  if (type === "pdf") return <FileTextIconLucide className="h-8 w-8 text-muted-foreground" />;
  return <FileTextIconLucide className="h-8 w-8 text-muted-foreground" />;
};

const getStatusBadge = (status: string) => {
  if (status === "optimized") return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/> Optimized</Badge>;
  if (status === "large") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Large File</Badge>;
  if (status === "slow") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Slow Load</Badge>;
  return <Badge variant="secondary">{status || 'OK'}</Badge>;
};


export default function MediaManagerPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "mediaItems"));
        const itemsData = querySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unnamed Media',
            type: data.type || 'unknown',
            url: data.url || 'https://placehold.co/300x200.png',
            size: data.size || 'N/A',
            tags: Array.isArray(data.tags) ? data.tags : [],
            status: data.status || 'ok',
            dataAiHint: data.dataAiHint || 'placeholder',
          } as MediaItem;
        });
        setMediaItems(itemsData);
      } catch (err) {
        console.error("Error fetching media items:", err);
        setError("Failed to load media items. Please ensure the 'mediaItems' collection exists and has data.");
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, []);

  const renderMediaGrid = (items: MediaItem[]) => {
    if (items.length === 0 && !loading && !error) {
        return <p className="p-4 text-center text-muted-foreground">No media items found for this filter.</p>;
    }
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((item) => (
          <Card key={item.id} className={`overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 group ${item.status === 'large' || item.status === 'slow' ? 'border-destructive' : ''}`}>
            <CardHeader className="p-0 relative">
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={item.name}
                  width={300}
                  height={200}
                  className="aspect-[3/2] w-full object-cover"
                  data-ai-hint={item.dataAiHint || 'image'}
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png?text=Error';}} // Fallback
                />
              ) : (
                <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center">
                  {getIconForType(item.type)}
                </div>
              )}
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/70 hover:bg-background">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit3 className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                    <DropdownMenuItem><Link2 className="mr-2 h-4 w-4" /> Copy URL</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              <CardTitle className="text-sm font-medium truncate leading-tight">{item.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{item.size} &bull; {item.type}</CardDescription>
              <div className="flex flex-wrap gap-1 pt-1">
                {item.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              {getStatusBadge(item.status)}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Manager"
        description="Upload, organize, and manage your images, videos, and other files."
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search media..." className="pl-8 sm:w-[300px]" />
            </div>
            <Button>
              <UploadCloud className="mr-2 h-4 w-4" /> Upload Media
            </Button>
          </>
        }
      />
    <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Media</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="issues" className="text-destructive">Needs Attention</TabsTrigger>
        </TabsList>

        {loading && (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading media items...</p>
          </div>
        )}
        {error && <p className="p-4 text-center text-destructive">{error}</p>}
        
        {!loading && !error && (
          <>
            <TabsContent value="all">
              {renderMediaGrid(mediaItems)}
            </TabsContent>
            <TabsContent value="images">
              {renderMediaGrid(mediaItems.filter(item => item.type === 'image'))}
            </TabsContent>
            <TabsContent value="videos">
              {renderMediaGrid(mediaItems.filter(item => item.type === 'video'))}
            </TabsContent>
            <TabsContent value="documents">
              {renderMediaGrid(mediaItems.filter(item => item.type === 'pdf' || item.type === 'document'))}
            </TabsContent>
            <TabsContent value="issues">
              {renderMediaGrid(mediaItems.filter(item => item.status === 'large' || item.status === 'slow'))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

