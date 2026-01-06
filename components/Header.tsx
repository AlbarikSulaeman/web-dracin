import { Film } from 'lucide-react';

export default function Header() {
  return (
    <header className="wood-gradient-dark sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-50">
                Cici<span className="text-red-500">Draci</span>
              </h1>
              <p className="text-xs md:text-sm text-amber-100">China Drama Streaming</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}