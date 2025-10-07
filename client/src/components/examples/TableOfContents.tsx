import TableOfContents from '../TableOfContents';

export default function TableOfContentsExample() {
  const sampleHeadings = [
    { id: "intro", text: "Introduction", level: 2 },
    { id: "what-is-ai", text: "What is AI?", level: 2 },
    { id: "machine-learning", text: "Machine Learning", level: 3 },
    { id: "deep-learning", text: "Deep Learning", level: 3 },
    { id: "applications", text: "Applications in Development", level: 2 },
    { id: "code-generation", text: "Code Generation", level: 3 },
    { id: "testing", text: "Automated Testing", level: 3 },
    { id: "conclusion", text: "Conclusion", level: 2 },
  ];

  return (
    <div className="p-8 max-w-xs">
      <TableOfContents headings={sampleHeadings} />
    </div>
  );
}
