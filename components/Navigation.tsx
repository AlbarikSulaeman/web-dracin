// components/Navigation.tsx
'use client';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { id: 'foryou', label: 'For You' },
    { id: 'trending', label: 'Trending' },
    { id: 'latest', label: 'Latest' },
    // { id: 'all', label: 'All Dramas' },
  ];

  return (
    <nav className="bg-white shadow-md border-b-4 border-red-600">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex gap-2 md:gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 md:px-6 py-3 font-semibold transition-all duration-200 text-sm md:text-base whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-red-600 border-b-4 border-red-600 bg-red-50'
                  : 'text-amber-800 hover:text-red-600 border-b-4 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}