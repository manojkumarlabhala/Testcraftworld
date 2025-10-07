import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Heart, Reply, Flag } from "lucide-react";
import { useState } from "react";

interface CommentProps {
  id: string;
  author: {
    name: string;
    avatar?: string;
    role?: "admin" | "author" | "reader";
  };
  content: string;
  timestamp: string;
  likes: number;
  replies?: CommentProps[];
  depth?: number;
}

export default function Comment({
  id,
  author,
  content,
  timestamp,
  likes: initialLikes,
  replies = [],
  depth = 0,
}: CommentProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const roleBadgeColor = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
    author: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 md:ml-12 border-l-2 pl-4' : ''}`} data-testid={`comment-${id}`}>
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{author.name}</span>
            {author.role && author.role !== "reader" && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadgeColor[author.role]}`}>
                {author.role}
              </span>
            )}
            <span className="text-sm text-muted-foreground">{timestamp}</span>
          </div>
          <p className="text-foreground mb-3 leading-relaxed">{content}</p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              onClick={handleLike}
              data-testid={`button-like-comment-${id}`}
            >
              <Heart className={`h-3 w-3 mr-1 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs">{likes}</span>
            </Button>
            {depth < 3 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8"
                onClick={() => setShowReplyForm(!showReplyForm)}
                data-testid={`button-reply-comment-${id}`}
              >
                <Reply className="h-3 w-3 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8"
              data-testid={`button-flag-comment-${id}`}
            >
              <Flag className="h-3 w-3 mr-1" />
              <span className="text-xs">Report</span>
            </Button>
          </div>
          {showReplyForm && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <textarea
                className="w-full p-2 text-sm bg-background border rounded-md resize-none"
                rows={3}
                placeholder="Write a reply..."
                data-testid={`textarea-reply-${id}`}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" data-testid={`button-submit-reply-${id}`}>Post Reply</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowReplyForm(false)} data-testid={`button-cancel-reply-${id}`}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <Comment key={reply.id} {...reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
