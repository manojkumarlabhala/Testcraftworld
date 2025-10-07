import { Card } from "./ui/card";
import { useState } from "react";

interface TableOfContentsProps {
  headings: { id: string; text: string; level: number }[];
}

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id || "");

  const handleClick = (id: string) => {
    setActiveId(id);
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Card className="p-6 sticky top-20">
      <h3 className="font-semibold mb-4">Table of Contents</h3>
      <nav className="space-y-2">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleClick(heading.id)}
            className={`block w-full text-left text-sm py-1 px-2 rounded-md hover-elevate transition-colors ${
              heading.level === 2 ? "pl-2" : "pl-6"
            } ${
              activeId === heading.id
                ? "text-foreground font-medium bg-muted"
                : "text-muted-foreground"
            }`}
            data-testid={`toc-${heading.id}`}
          >
            {heading.text}
          </button>
        ))}
      </nav>
    </Card>
  );
}
