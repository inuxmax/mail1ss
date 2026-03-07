"use client";

import { useState } from "react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fetcher } from "@/lib/utils";

interface Post {
  id: string;
  content: string;
  image?: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
}

export function PostCard({ post, isAdmin }: { post: Post; isAdmin: boolean }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const { data: comments, mutate: mutateComments } = useSWR(
    showComments ? `/api/posts/${post.id}/comment` : null,
    fetcher
  );

  const handleLike = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
    
    try {
      await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
    } catch (error) {
      // Revert
      setIsLiked(!newLiked);
      setLikeCount(prev => !newLiked ? prev + 1 : prev - 1);
    }
  };

  const handleComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
        id: `temp-${Date.now()}`,
        content: commentText,
        user: {
            name: session?.user?.name || "Me",
            image: session?.user?.image || ""
        },
        createdAt: new Date().toISOString(),
        replies: [],
        likeCount: 0,
        isLiked: false,
        parentId: parentId || null
    };

    // Optimistic Update
    mutateComments((currentData: any) => {
        if (!currentData) return [newComment];
        if (parentId) {
             return currentData.map((c: any) => 
                c.id === parentId 
                ? { ...c, replies: [...c.replies, newComment] } 
                : c
             );
        }
        return [newComment, ...currentData];
    }, false);

    try {
      await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: commentText, parentId }),
      });
      setCommentText("");
      mutateComments();
    } catch (error) {
      toast.error("Failed to post comment");
      mutateComments(); // Revert on error
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
      // Optimistic Update for comment like
      mutateComments((currentData: any) => {
          if (!currentData) return currentData;
          const updateLike = (c: any) => {
              if (c.id === commentId) {
                  return { ...c, isLiked: !isLiked, likeCount: isLiked ? c.likeCount - 1 : c.likeCount + 1 };
              }
              if (c.replies) {
                  return { ...c, replies: c.replies.map(updateLike) };
              }
              return c;
          };
          return currentData.map(updateLike);
      }, false);

      try {
          await fetch(`/api/comments/${commentId}/like`, { method: "POST" });
      } catch (error) {
          mutateComments(); // Revert
      }
  };

  const CommentItem = ({ comment, isReply = false }: { comment: any, isReply?: boolean }) => {
      const [replying, setReplying] = useState(false);
      const [replyText, setReplyText] = useState("");

      const onReplySubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!replyText.trim()) return;
          // Reuse main handleComment logic but need to pass parentId
          // Since handleComment uses commentText state, we need to adapt it or create separate handler
          // For simplicity, let's call API directly here with optimistic update locally scoped if possible, 
          // or just reuse the main one but we need to change how state is managed.
          // Better: Refactor handleComment to accept text and parentId.
          
          // Let's just use the main handleComment for now, but we need to expose a way to call it with specific text.
          // Refactoring handleComment above to accept text would be best.
          
          // Workaround for this component structure:
          // We will trigger the mutation from here.
          
          const newReply = {
            id: `temp-${Date.now()}`,
            content: replyText,
            user: {
                name: session?.user?.name || "Me",
                image: session?.user?.image || ""
            },
            createdAt: new Date().toISOString(),
            replies: [],
            likeCount: 0,
            isLiked: false,
            parentId: comment.id
          };

          mutateComments((currentData: any) => {
              return currentData.map((c: any) => 
                  c.id === comment.id 
                  ? { ...c, replies: [...c.replies, newReply] } 
                  : c
              );
          }, false);

          fetch(`/api/posts/${post.id}/comment`, {
              method: "POST",
              body: JSON.stringify({ content: replyText, parentId: comment.id }),
          }).then(() => {
              setReplyText("");
              setReplying(false);
              mutateComments();
          });
      };

      return (
        <div className={`flex gap-3 group ${isReply ? "mt-2 ml-10" : ""}`}>
            <Avatar className="h-7 w-7 mt-0.5">
                <AvatarImage src={comment.user.image} />
                <AvatarFallback className="text-[10px]">{comment.user.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-full">
                <div className="bg-muted/80 p-2.5 rounded-2xl rounded-tl-none text-sm w-fit max-w-[90%]">
                    <span className="font-semibold text-xs block mb-0.5 text-foreground/80">{comment.user.name}</span>
                    <span className="text-foreground/90">{comment.content}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                    <button 
                        className={`text-[11px] font-semibold hover:underline ${comment.isLiked ? "text-red-500" : "text-muted-foreground"}`}
                        onClick={() => handleLikeComment(comment.id, comment.isLiked)}
                    >
                        Like {comment.likeCount > 0 && `(${comment.likeCount})`}
                    </button>
                    {!isReply && (
                        <button 
                            className="text-[11px] font-semibold text-muted-foreground hover:underline"
                            onClick={() => setReplying(!replying)}
                        >
                            Reply
                        </button>
                    )}
                </div>
                
                {/* Replies */}
                {comment.replies?.length > 0 && (
                    <div className="mt-2">
                        {comment.replies.map((reply: any) => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}

                {/* Reply Form */}
                {replying && (
                     <form onSubmit={onReplySubmit} className="flex gap-2 relative mt-2 w-full max-w-[90%]">
                        <Input 
                            placeholder={`Reply to ${comment.user.name}...`}
                            value={replyText} 
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-muted/30 border-none focus-visible:ring-1 pr-12 h-8 text-xs rounded-full"
                            autoFocus
                        />
                        <Button 
                            type="submit" 
                            size="sm" 
                            disabled={!replyText.trim()} 
                            className="absolute right-1 top-0.5 h-6 rounded-full px-3 text-[10px]"
                        >
                            Reply
                        </Button>
                    </form>
                )}
            </div>
        </div>
      );
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      toast.success("Post deleted");
      mutate("/api/posts?page=1&limit=10"); // Refresh list
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-border/50 bg-card/50 backdrop-blur-sm h-auto">
      <CardHeader className="flex flex-row items-start gap-4 p-5 pb-2 space-y-0">
        <Avatar className="h-10 w-10 ring-2 ring-primary/10">
          <AvatarImage src={post.user.image} alt={post.user.name} />
          <AvatarFallback className="bg-primary/5 font-semibold text-primary">{post.user.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{post.user.name}</p>
            {isAdmin && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">Admin</span>}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        {isAdmin && (
          <Button variant="ghost" size="icon" className="ml-auto -mr-2 h-8 w-8 hover:bg-destructive/10 hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-2 flex-1">
        <p className="whitespace-pre-wrap text-sm mb-4 leading-relaxed text-foreground/90">{post.content}</p>
        {post.image && (
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/30 shadow-sm group">
            <Image
              src={
                post.image.startsWith("http")
                  ? post.image
                  : `https://${post.image}`
              }
              alt="Post image"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col p-0 border-t bg-muted/5 mt-auto">
        <div className="flex w-full items-center justify-between p-2">
            <div className="flex items-center w-full">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex-1 gap-2 rounded-lg hover:bg-background ${isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"}`} 
                    onClick={handleLike}
                >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span className="text-xs font-medium">{likeCount > 0 ? likeCount : "Like"}</span>
                </Button>
                <div className="w-px h-4 bg-border/50"></div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex-1 gap-2 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground" 
                    onClick={() => setShowComments(!showComments)}
                >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{post.commentCount > 0 ? post.commentCount : "Comment"}</span>
                </Button>
            </div>
        </div>
        
        {showComments && (
            <div className="w-full space-y-4 p-4 pt-2 border-t bg-background/50">
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                    {comments?.map((comment: any) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
                
                <form onSubmit={(e) => handleComment(e)} className="flex gap-2 relative">
                    <Input 
                        placeholder="Write a comment..." 
                        value={commentText} 
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-muted/30 border-none focus-visible:ring-1 pr-12 h-9 text-sm rounded-full"
                    />
                    <Button 
                        type="submit" 
                        size="sm" 
                        disabled={!commentText.trim()} 
                        className="absolute right-1 top-1 h-7 rounded-full px-3 text-xs"
                    >
                        Post
                    </Button>
                </form>
            </div>
        )}
      </CardFooter>
    </Card>
  );
}
