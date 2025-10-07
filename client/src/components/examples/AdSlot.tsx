import AdSlot from '../AdSlot';

export default function AdSlotExample() {
  return (
    <div className="p-8 space-y-6">
      <AdSlot position="header" />
      <div className="grid md:grid-cols-2 gap-4">
        <AdSlot position="sidebar" />
        <AdSlot position="in-content" />
      </div>
      <AdSlot position="footer" />
    </div>
  );
}
