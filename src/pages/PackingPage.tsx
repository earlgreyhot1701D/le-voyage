import { AppShell, MainContent, RightPanel } from '@/components/layout';
import { useState } from 'react';

const mockPackingItems = [
  { id: 'pi1', name: 'Passport', category: 'documents', isPacked: true, isEssential: true },
  { id: 'pi2', name: 'Phone Charger', category: 'electronics', isPacked: false, isEssential: true },
  { id: 'pi3', name: 'Walking Shoes', category: 'clothing', isPacked: false, isEssential: true },
  { id: 'pi4', name: 'Rain Jacket', category: 'clothing', isPacked: false, isEssential: false },
  { id: 'pi5', name: 'Toiletry Bag', category: 'toiletries', isPacked: false, isEssential: true },
  { id: 'pi6', name: 'Camera', category: 'electronics', isPacked: true, isEssential: false },
  { id: 'pi7', name: 'Travel Adapter', category: 'electronics', isPacked: false, isEssential: true },
];

const categoryIcons: Record<string, string> = {
  documents: '✉',
  electronics: '⚡',
  clothing: '◇',
  toiletries: '◉',
  misc: '•',
};

const categories = ['documents', 'electronics', 'clothing', 'toiletries', 'misc'];

function PackingItem({ item, onToggle }: { item: typeof mockPackingItems[0]; onToggle: () => void }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer ${
        item.isPacked ? 'bg-primary/10' : 'bg-card hover:bg-secondary'
      }`}
      onClick={onToggle}
    >
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.isPacked
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-border'
        }`}
      >
        {item.isPacked && <span className="text-xs">✓</span>}
      </div>
      <span className="text-lg">{categoryIcons[item.category] || '•'}</span>
      <span
        className={`flex-1 ${
          item.isPacked ? 'line-through text-muted-foreground' : 'text-foreground'
        }`}
      >
        {item.name}
      </span>
      {item.isEssential && !item.isPacked && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium">
          Essential
        </span>
      )}
    </div>
  );
}

function PackingProgress() {
  const packed = mockPackingItems.filter((i) => i.isPacked).length;
  const total = mockPackingItems.length;
  const percentage = Math.round((packed / total) * 100);

  return (
    <RightPanel title="Progress">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Items Packed</span>
          <span className="font-semibold">{packed}/{total}</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category) => {
          const items = mockPackingItems.filter((i) => i.category === category);
          const packedCount = items.filter((i) => i.isPacked).length;
          if (items.length === 0) return null;
          
          return (
            <div key={category} className="flex items-center justify-between text-sm">
              <span className="capitalize text-muted-foreground">{category}</span>
              <span className={packedCount === items.length ? 'text-primary' : 'text-foreground'}>
                {packedCount}/{items.length}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="font-serif font-semibold mb-3">Tips</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Pack essentials in your carry-on</li>
          <li>• Roll clothes to save space</li>
          <li>• Check weather at destination</li>
        </ul>
      </div>
    </RightPanel>
  );
}

export default function PackingPage() {
  const [items, setItems] = useState(mockPackingItems);

  const toggleItem = (id: string) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, isPacked: !item.isPacked } : item
    ));
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter((i) => i.category === category);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <AppShell rightPanel={<PackingProgress />}>
      <MainContent
        title="Packing Lists"
        subtitle="Paris Adventure • Mar 15-22, 2025"
      >
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryItems = groupedItems[category];
            if (!categoryItems || categoryItems.length === 0) return null;

            return (
              <div key={category} className="content-card">
                <h3 className="font-serif text-lg font-semibold capitalize mb-4 flex items-center gap-2">
                  <span>{categoryIcons[category]}</span>
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <PackingItem
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button className="mt-6 w-full p-4 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          + Add Item
        </button>
      </MainContent>
    </AppShell>
  );
}