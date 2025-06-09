
"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Search, Image as ImageIconLucide, Video, FileTextIcon as FileTextIconLucide, MoreVertical, Edit3, Link2, Trash, AlertTriangle, CheckCircle, Copy, Loader2 } from "lucide-react";
import Image from "next/image"; // Using next/image for optimized images
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from '@/lib/firebase';
import { collection, getDocs, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "pdf" | string; // Allow string for flexibility
  url: string;
  size?: string; // Made optional as OneDrive items might not have it
  tags?: string[]; // Made optional
  status?: string; // Made optional
  dataAiHint?: string;
  source?: 'firestore' | 'onedrive'; // To differentiate items
}

const simulatedOneDriveItems: MediaItem[] = [
  { id: 'od1', name: 'apollo_logo_light.png', type: 'image', url: 'https://placehold.co/300x200.png?text=Logo+Light', dataAiHint: 'logo light', source: 'onedrive', size: 'N/A' },
  { id: 'od2', name: 'apollo_logo_dark.png', type: 'image', url: 'https://placehold.co/300x200.png?text=Logo+Dark', dataAiHint: 'logo dark', source: 'onedrive', size: 'N/A' },
  { id: 'od3', name: 'home-hero-1.jpg', type: 'image', url: 'https://placehold.co/600x400.png?text=Hero+1', dataAiHint: 'hero landscape', source: 'onedrive', size: 'N/A' },
  { id: 'od4', name: 'home-hero-2.jpg', type: 'image', url: 'https://placehold.co/600x400.png?text=Hero+2', dataAiHint: 'hero abstract', source: 'onedrive', size: 'N/A' },
  { id: 'od5', name: 'home-hero-3.jpg', type: 'image', url: 'https://placehold.co/600x400.png?text=Hero+3', dataAiHint: 'hero nature', source: 'onedrive', size: 'N/A' },
  { id: 'od6', name: 'about-banner.jpg', type: 'image', url: 'https://placehold.co/800x300.png?text=About+Banner', dataAiHint: 'banner team', source: 'onedrive', size: 'N/A' },
  { id: 'od7', name: 'program-card-1.jpg', type: 'image', url: 'https://placehold.co/400x300.png?text=Program+1', dataAiHint: 'education program', source: 'onedrive', size: 'N/A' },
  { id: 'od8', name: 'program-card-2.jpg', type: 'image', url: 'https://placehold.co/400x300.png?text=Program+2', dataAiHint: 'learning students', source: 'onedrive', size: 'N/A' },
  { id: 'od9', name: 'program-card-3.jpg', type: 'image', url: 'https://placehold.co/400x300.png?text=Program+3', dataAiHint: 'research science', source: 'onedrive', size: 'N/A' },
  { id: 'od10', name: 'centre-image-1.jpg', type: 'image', url: 'https://placehold.co/500x350.png?text=Centre+1', dataAiHint: 'building modern', source: 'onedrive', size: 'N/A' },
  { id: 'od11', name: 'centre-image-2.jpg', type: 'image', url: 'https://placehold.co/500x350.png?text=Centre+2', dataAiHint: 'campus university', source: 'onedrive', size: 'N/A' },
];


const getIconForType = (type: string) => {
  if (type === "image") return <ImageIconLucide className="h-8 w-8 text-muted-foreground" />;
  if (type === "video") return <Video className="h-8 w-8 text-muted-foreground" />;
  if (type === "pdf") return <FileTextIconLucide className="h-8 w-8 text-muted-foreground" />;
  return <FileTextIconLucide className="h-8 w-8 text-muted-foreground" />;
};

const getStatusBadge = (status?: string) => {
  if (!status) return null;
  if (status === "optimized") return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/> Optimized</Badge>;
  if (status === "large") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Large File</Badge>;
  if (status === "slow") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Slow Load</Badge>;
  return <Badge variant="secondary">{status || 'OK'}</Badge>;
};


export default function MediaManagerPage() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
            source: 'firestore',
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

  const handleCopyUrl = useCallback((url: string, name: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied!",
        description: `URL for "${name}" copied to clipboard.`,
      });
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
      toast({
        title: "Copy Failed",
        description: "Could not copy URL to clipboard.",
        variant: "destructive",
      });
    });
  }, [toast]);

  const renderMediaGrid = (items: MediaItem[], gridTitle?: string) => {
    if (items.length === 0 && !loading && !error && gridTitle !== "OneDrive (Simulated)") { // For OneDrive, show message if empty even if not loading Firestore
        return <p className="p-4 text-center text-muted-foreground">No media items found for this filter.</p>;
    }
     if (items.length === 0 && gridTitle === "OneDrive (Simulated)") {
        return (
            <div className="p-4 text-center text-muted-foreground">
                <p>No OneDrive items available (simulation).</p>
                <p className="text-xs mt-2">For actual OneDrive integration, API setup with Microsoft Graph is required.</p>
            </div>
        );
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
                    <DropdownMenuItem onClick={() => handleCopyUrl(item.url, item.name)}>
                        <Copy className="mr-2 h-4 w-4" /> Copy URL
                    </DropdownMenuItem>
                    {item.source === 'firestore' && ( // Only show edit/delete for Firestore items
                        <>
                            <DropdownMenuItem><Edit3 className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="p-3 space-y-1">
              <CardTitle className="text-sm font-medium truncate leading-tight">{item.name}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {item.size || 'N/A'} {item.type ? `• ${item.type}` : ''} {item.source === 'onedrive' ? '• OneDrive' : ''}
              </CardDescription>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                </div>
              )}
            </CardContent>
            {item.source === 'firestore' && item.status && (
                <CardFooter className="p-3 pt-0">
                {getStatusBadge(item.status)}
                </CardFooter>
            )}
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
          <TabsTrigger value="all">All Local</TabsTrigger>
          <TabsTrigger value="images">Local Images</TabsTrigger>
          <TabsTrigger value="videos">Local Videos</TabsTrigger>
          <TabsTrigger value="documents">Local Documents</TabsTrigger>
          <TabsTrigger value="onedrive">OneDrive (Simulated)</TabsTrigger>
          <TabsTrigger value="issues" className="text-destructive">Needs Attention</TabsTrigger>
        </TabsList>

        {loading && (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading local media items...</p>
          </div>
        )}
        {error && <p className="p-4 text-center text-destructive">{error}</p>}
        
        {!loading && !error && (
          <>
            <TabsContent value="all">
              {renderMediaGrid(mediaItems.filter(item => item.source === 'firestore'))}
            </TabsContent>
            <TabsContent value="images">
              {renderMediaGrid(mediaItems.filter(item => item.type === 'image' && item.source === 'firestore'))}
            </TabsContent>
            <TabsContent value="videos">
              {renderMediaGrid(mediaItems.filter(item => item.type === 'video' && item.source === 'firestore'))}
            </TabsContent>
            <TabsContent value="documents">
              {renderMediaGrid(mediaItems.filter(item => (item.type === 'pdf' || item.type === 'document') && item.source === 'firestore'))}
            </TabsContent>
             <TabsContent value="onedrive">
              {renderMediaGrid(simulatedOneDriveItems, "OneDrive (Simulated)")}
            </TabsContent>
            <TabsContent value="issues">
              {renderMediaGrid(mediaItems.filter(item => (item.status === 'large' || item.status === 'slow') && item.source === 'firestore'))}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

