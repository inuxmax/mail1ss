import { constructMetadata } from "@/lib/utils";
import { CreatePost } from "@/components/posts/create-post";
import { PostFeed } from "@/components/posts/post-feed";

export const metadata = constructMetadata({
  title: "Manage Posts",
  description: "Create and manage community posts.",
});

export default function AdminPostsPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Manage Posts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
             <CreatePost />
             <PostFeed />
        </div>
        <div className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Posts will appear on the user dashboard.</li>
                    <li>You can include text and one image per post.</li>
                    <li>Users can like and comment on posts.</li>
                    <li>As an admin, you can delete any post.</li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
