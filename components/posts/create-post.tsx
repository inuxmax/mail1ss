"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, X, Smile, Send } from "lucide-react";
import { toast } from "sonner";
import { mutate } from "swr";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CreatePost() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() && !image) return;

    setIsSubmitting(true);
    try {
        let imageUrl = null;
        if (image) {
            const formData = new FormData();
            formData.append("file", image);
            const uploadRes = await fetch("/api/posts/upload", {
                method: "POST",
                body: formData
            });
            if (!uploadRes.ok) throw new Error("Image upload failed");
            const data = await uploadRes.json();
            imageUrl = data.url;
        }

        const res = await fetch("/api/posts", {
            method: "POST",
            body: JSON.stringify({ content, image: imageUrl })
        });

        if (!res.ok) throw new Error("Failed to create post");

        toast.success("Post created successfully!");
        setContent("");
        removeImage();
        mutate("/api/posts?page=1&limit=10");
    } catch (error) {
        toast.error("Something went wrong. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const insertEmoji = (emoji: string) => {
      setContent(prev => prev + emoji);
  };

  // Simple Emoji List (Can be replaced with a full library if needed)
  const commonEmojis = ["😀", "😂", "😍", "🥳", "😎", "🤔", "😭", "😡", "👍", "👎", "❤️", "🔥", "🎉", "✨"];

  return (
    <Card className="mb-8 shadow-md border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4">
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                    <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                    <AvatarFallback className="bg-primary/5 font-semibold text-primary">{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                    <Textarea 
                        placeholder={`What's on your mind, ${session?.user?.name?.split(' ')[0]}?`} 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[80px] text-lg bg-transparent border-none focus-visible:ring-0 resize-none p-0 placeholder:text-muted-foreground/50"
                    />
                    
                    {imagePreview && (
                        <div className="relative w-full rounded-xl overflow-hidden border bg-muted/30">
                            <div className="relative aspect-video max-h-[400px]">
                                <Image src={imagePreview} alt="Preview" fill className="object-contain" />
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                                onClick={removeImage}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />
                    <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2 rounded-full px-3"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <ImagePlus className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Photo/Video</span>
                    </Button>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10 gap-2 rounded-full px-3"
                            >
                                <Smile className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">Feeling/Activity</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                            <div className="grid grid-cols-7 gap-1">
                                {commonEmojis.map(emoji => (
                                    <button 
                                        key={emoji} 
                                        className="p-1.5 hover:bg-muted rounded-md text-xl transition-colors"
                                        onClick={() => insertEmoji(emoji)}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <Button 
                    onClick={() => handleSubmit()} 
                    disabled={isSubmitting || (!content.trim() && !image)}
                    className="rounded-full px-6 gap-2 font-semibold shadow-sm"
                    size="sm"
                >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post
                </Button>
            </div>
        </CardContent>
    </Card>
  );
}
