import ShareButtons from '../ShareButtons';
import { Toaster } from "@/components/ui/toaster";

export default function ShareButtonsExample() {
  return (
    <div className="p-8">
      <ShareButtons title="The Future of AI in Software Development" />
      <Toaster />
    </div>
  );
}
