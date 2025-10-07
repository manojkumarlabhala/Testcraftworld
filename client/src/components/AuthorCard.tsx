import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { UserPlus } from "lucide-react";

interface AuthorCardProps {
  name: string;
  avatar?: string;
  bio: string;
  articleCount: number;
}

export default function AuthorCard({ name, avatar, bio, articleCount }: AuthorCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-lg">{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-muted-foreground">{articleCount} articles</p>
            </div>
            <Button size="sm" data-testid="button-follow-author">
              <UserPlus className="h-4 w-4 mr-2" />
              Follow
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
        </div>
      </div>
    </Card>
  );
}
