import React from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { Search, X } from 'lucide-react';

const SearchBar = () => {
  const searchQuery = useSheetStore(state => state.searchQuery);
  const setSearchQuery = useSheetStore(state => state.setSearchQuery);

  return (
    <div className="relative w-full max-w-xl mx-auto mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search size={18} className="text-tuf-muted" />
      </div>
      
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2.5 border border-tuf-border rounded-lg leading-5 bg-tuf-card text-tuf-text placeholder-tuf-muted focus:outline-none focus:bg-[#252525] focus:border-tuf-red transition-colors sm:text-sm"
        placeholder="Search questions (e.g. 'Two Sum', 'Hard')..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-tuf-muted hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;