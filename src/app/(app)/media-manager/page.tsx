import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Search, Image as ImageIcon, Video, FileTextIcon, MoreVertical, Edit3, Link2, Trash, AlertTriangle, CheckCircle } from "lucide-react";
import Image from "next/image"; // Using next/image for optimized images
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const mediaItems = [
  { id: "m1", name: "Hero Background", type: "image", url: "https://placehold.co/300x200.png", size: "1.2MB", tags: ["homepage", "banner"], status: "optimized", dataAiHint: "abstract background" },
  { id: "m2", name: "Product Demo", type: "video", url: "https://placehold.co/300x200.png", size: "15.7MB", tags: ["product", "demo"], status: "large", dataAiHint: "video play" },
  { id: "m3", name: "Company Brochure", type: "pdf", url: "https://placehold.co/300x200.png", size: "5.3MB", tags: ["marketing", "document"], status: "ok", dataAiHint: "document icon" },
  { id: "m4", name: "Team Portrait", type: "image", url: "https://placehold.co/300x200.png", size: "850KB", tags: ["team", "about us"], status: "optimized", dataAiHint: "group photo" },
  { id: "m5", name: "Icon Set", type: "image", url: "https://placehold.co/300x200.png", size: "50KB", tags: ["icons", "ui"], status: "optimized", dataAiHint: "icons collection" },
  { id: "m6", name: "Old Presentation", type: "pdf", url: "https://placehold.co/300x200.png", size: "22MB", tags: ["archive", "presentation"], status: "slow", dataAiHint: "presentation slides" },
];

const getIconForType = (type: string) => {
  if (type === "image") return <ImageIcon className="h-8 w-8 text-muted-foreground" />;
  if (type === "video") return <Video className="h-8 w-8 text-muted-foreground" />;
  if (type === "pdf") return <FileTextIcon className="h-8 w-8 text-muted-foreground" />;
  return <FileTextIcon className="h-8 w-8 text-muted-foreground" />;
};

const getStatusBadge = (status: string) => {
  if (status === "optimized") return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/> Optimized</Badge>;
  if (status === "large") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Large File</Badge>;
  if (status === "slow") return <Badge variant="destructive"><AlertTriangle className="mr-1 h-3 w-3"/> Slow Load</Badge>;
  return <Badge variant="secondary">OK</Badge>;
};


export default function MediaManagerPage() {
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

        <TabsContent value="all">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mediaItems.map((item) => (
              <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 group">
                <CardHeader className="p-0 relative">
                  {item.type === "image" ? (
                    <Image
                      src={item.url}
                      alt={item.name}
                      width={300}
                      height={200}
                      className="aspect-[3/2] w-full object-cover"
                      data-ai-hint={item.dataAiHint}
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
        </TabsContent>
        {/* Placeholder for other tabs */}
        <TabsContent value="images"><p className="text-muted-foreground">Images tab content here.</p></TabsContent>
        <TabsContent value="videos"><p className="text-muted-foreground">Videos tab content here.</p></TabsContent>
        <TabsContent value="documents"><p className="text-muted-foreground">Documents tab content here.</p></TabsContent>
        <TabsContent value="issues">
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {mediaItems.filter(item => item.status === 'large' || item.status === 'slow').map((item) => (
                   <Card key={item.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 group border-destructive">
                     <CardHeader className="p-0 relative">
                       {item.type === "image" ? (
                         <Image
                           src={item.url}
                           alt={item.name}
                           width={300}
                           height={200}
                           className="aspect-[3/2] w-full object-cover"
                           data-ai-hint={item.dataAiHint}
                         />
                       ) : (
                         <div className="aspect-[3/2] w-full bg-muted flex items-center justify-center">
                           {getIconForType(item.type)}
                         </div>
                       )}
                     </CardHeader>
                     <CardContent className="p-3 space-y-1">
                       <CardTitle className="text-sm font-medium truncate leading-tight">{item.name}</CardTitle>
                       <CardDescription className="text-xs text-muted-foreground">{item.size} &bull; {item.type}</CardDescription>
                     </CardContent>
                     <CardFooter className="p-3 pt-0">
                       {getStatusBadge(item.status)}
                     </CardFooter>
                   </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
