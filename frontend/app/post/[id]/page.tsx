"use client";

export const instant = false;

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, MessageCircle, Repeat2, ArrowLeft, Send, Bookmark } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Comment {
  id: number;
  author: { username: string; id: number };
  content: string;
  likes_count: number;
  created_at: string;
  is_liked?: boolean;
  replies?: Comment[];
  parent?: number | null;
}

interface Post {
  id: number;
  author: { username: string; id: number };
  company_name: string;
  company_anonymous: boolean;
  reason_category: string;
  title: string;
  content: string;
  is_anonymous: boolean;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  bookmarks_count: number;
  created_at: string;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  comments: Comment[];
}

function CommentItem({ comment, postId, token, onReply }: { comment: Comment; postId: number; token: string | null; onReply: () => void }) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [liked, setLiked] = useState(comment.is_liked);
  const [likes, setLikes] = useState(comment.likes_count);

  const handleLike = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/comments/${comment.id}/like/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setLiked(data.liked);
      setLikes(data.likes_count);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !replyText.trim()) return;
    const res = await fetch(`${API_URL}/posts/${postId}/comment/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText, parent: comment.id }),
    });
    if (res.ok) {
      setReplyText("");
      setReplying(false);
      onReply();
    }
  };

  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900/70 p-4">
      <div className="mb-1 text-sm">
        <Link href={`/profile/${comment.author.id}`} className="font-medium hover:underline">{comment.author.username}</Link>
        <span className="ml-2 text-zinc-500">{new Date(comment.created_at).toLocaleDateString()}</span>
      </div>
      <p className="text-zinc-700 dark:text-zinc-200">{comment.content}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-zinc-500">
        <button onClick={handleLike} className={`flex items-center gap-1 hover:text-red-500 ${liked ? "text-red-500" : ""}`}>
          <Heart className={`h-3 w-3 ${liked ? "fill-current" : ""}`} /> {likes}
        </button>
        <button onClick={() => setReplying(!replying)} className="hover:text-blue-500">Reply</button>
      </div>
      {replying && (
        <form onSubmit={submitReply} className="mt-3 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm outline-none"
          />
          <button type="submit" className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white">Send</button>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 ml-4 space-y-3 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
          {comment.replies.map((r) => (
            <CommentItem key={r.id} comment={r} postId={postId} token={token} onReply={onReply} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem("linkedout_token"));
    fetchPost();
  }, [params.id]);

  const fetchPost = async () => {
    try {
      const headers: any = {};
      const t = localStorage.getItem("linkedout_token");
      if (t) headers.Authorization = `Bearer ${t}`;
      const res = await fetch(`${API_URL}/posts/${params.id}/`, { headers });
      if (res.ok) setPost(await res.json());
    } catch {}
    setLoading(false);
  };

  const handleAction = async (action: "like" | "repost" | "bookmark") => {
    if (!token || !post) return;
    const res = await fetch(`${API_URL}/posts/${post.id}/${action}/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: action === "repost" ? JSON.stringify({ comment: "" }) : undefined,
    });
    if (res.ok) {
      const data = await res.json();
      setPost({
        ...post,
        likes_count: action === "like" ? data.likes_count : post.likes_count,
        is_liked: action === "like" ? data.liked : post.is_liked,
        reposts_count: action === "repost" ? data.reposts_count : post.reposts_count,
        is_reposted: action === "repost" ? data.reposted : post.is_reposted,
        bookmarks_count: action === "bookmark" ? data.bookmarks_count : post.bookmarks_count,
        is_bookmarked: action === "bookmark" ? data.bookmarked : post.is_bookmarked,
      });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !commentText.trim() || !post) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/posts/${post.id}/comment/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        setCommentText("");
        fetchPost();
      }
    } catch {}
    setSubmitting(false);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!post) return <div className="flex min-h-screen items-center justify-center">Post not found</div>;

  return (
    <div className="min-h-screen">

      <main className="mx-auto max-w-3xl px-4 py-8">
        <article className="mb-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 shadow-sm">
          <div className="mb-4 text-sm text-zinc-500">
            <Link href={`/profile/${post.author.id}`} className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline">
              {post.is_anonymous ? "Anonymous" : post.author.username}
            </Link>
            {" • "}
            {new Date(post.created_at).toLocaleDateString()}
          </div>
          <div className="mb-4 flex gap-2">
            <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-red-500">
              {post.company_anonymous ? "Anonymous Company" : post.company_name}
            </span>
            <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs">{post.reason_category.replace("_", " ")}</span>
          </div>
          <h1 className="mb-4 text-2xl font-bold">{post.title}</h1>
          <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-200 leading-relaxed">{post.content}</p>

          <div className="mt-6 flex gap-6 border-t border-zinc-200 dark:border-zinc-800 pt-4 text-zinc-500">
            <button onClick={() => handleAction("like")} className={`flex items-center gap-2 ${post.is_liked ? "text-red-500" : ""}`}>
              <Heart className={`h-5 w-5 ${post.is_liked ? "fill-current" : ""}`} />
              {post.likes_count}
            </button>
            <span className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              {post.comments_count}
            </span>
            <button onClick={() => handleAction("repost")} className={`flex items-center gap-2 ${post.is_reposted ? "text-green-500" : ""}`}>
              <Repeat2 className="h-5 w-5" />
              {post.reposts_count}
            </button>
            <button onClick={() => handleAction("bookmark")} className={`flex items-center gap-2 ${post.is_bookmarked ? "text-yellow-500" : ""}`}>
              <Bookmark className={`h-5 w-5 ${post.is_bookmarked ? "fill-current" : ""}`} />
              {post.bookmarks_count}
            </button>
          </div>
        </article>

        <section>
          <h2 className="mb-4 text-lg font-semibold">Comments ({post.comments_count})</h2>

          {token ? (
            <form onSubmit={handleComment} className="mb-6 flex gap-3">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 outline-none focus:border-red-500"
              />
              <button type="submit" disabled={submitting || !commentText.trim()} className="rounded-full bg-red-600 px-4 py-2.5 text-white hover:bg-red-700 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <p className="mb-6 text-sm text-zinc-500">
              <Link href="/login" className="text-red-500 hover:underline">Log in</Link> to comment
            </p>
          )}

          <div className="space-y-4">
            {post.comments?.filter(c => !c.parent).map((comment) => (
              <CommentItem key={comment.id} comment={comment} postId={post.id} token={token} onReply={fetchPost} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
