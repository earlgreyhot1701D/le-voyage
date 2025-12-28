import { fixtureTrip } from '@/data/fixtures';

interface TopBarProps {
  date?: string;
}

// Default to fixture trip date if not provided
const defaultDate = fixtureTrip.start_date 
  ? new Date(fixtureTrip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  : 'April 2025';

export function TopBar({ date = defaultDate }: TopBarProps) {
  return (
    <div className="px-10 py-8 flex justify-between items-center">
      <div className="search-container">
        <span>🔍</span>
        <input 
          type="text" 
          placeholder="Search museums, bistros, or metro lines..." 
        />
      </div>
      <div className="flex items-center gap-5">
        <span className="text-sm font-semibold">{date}</span>
        <div 
          className="w-[45px] h-[45px] rounded-full border-[3px] border-white"
          style={{ background: 'hsl(var(--amber-glass))' }}
        />
      </div>
    </div>
  );
}
