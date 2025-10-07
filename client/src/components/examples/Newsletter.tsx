import Newsletter from '../Newsletter';
import { Toaster } from "@/components/ui/toaster";

export default function NewsletterExample() {
  return (
    <div className="p-8">
      <Newsletter />
      <Toaster />
    </div>
  );
}
