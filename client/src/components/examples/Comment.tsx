import Comment from '../Comment';

export default function CommentExample() {
  const sampleComments = [
    {
      id: "1",
      author: { name: "Alice Johnson", role: "admin" as const },
      content: "Great article! This really helped me understand the topic better. Looking forward to more content like this.",
      timestamp: "2 hours ago",
      likes: 12,
      replies: [
        {
          id: "2",
          author: { name: "Bob Smith" },
          content: "I agree! The examples were really clear and practical.",
          timestamp: "1 hour ago",
          likes: 5,
        },
      ],
    },
    {
      id: "3",
      author: { name: "Carol White", role: "author" as const },
      content: "Thanks for sharing this perspective. I've been working on similar ideas and this gave me some new insights.",
      timestamp: "3 hours ago",
      likes: 8,
    },
  ];

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      {sampleComments.map((comment) => (
        <Comment key={comment.id} {...comment} />
      ))}
    </div>
  );
}
