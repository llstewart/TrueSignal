'use client';

import { useState, useMemo } from 'react';
import { TabContent, TabHeader } from './AppShell';

interface SavedSearch {
  id: string;
  niche: string;
  location: string;
  totalCount: number;
  analyzedCount: number;
  createdAt: Date;
  lastAccessed: Date;
}

interface LibraryTabProps {
  searches: SavedSearch[];
  isLoading?: boolean;
  onSearchClick: (search: SavedSearch) => void;
  onDeleteSearch?: (searchId: string) => void;
  onClearAll?: () => void;
}

// Helper to group searches by time period
function groupSearchesByTime(searches: SavedSearch[]): Record<string, SavedSearch[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: Record<string, SavedSearch[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'This Month': [],
    'Older': [],
  };

  searches.forEach(search => {
    const date = new Date(search.lastAccessed);
    if (date >= today) {
      groups['Today'].push(search);
    } else if (date >= yesterday) {
      groups['Yesterday'].push(search);
    } else if (date >= thisWeek) {
      groups['This Week'].push(search);
    } else if (date >= thisMonth) {
      groups['This Month'].push(search);
    } else {
      groups['Older'].push(search);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

export function LibraryTab({
  searches,
  isLoading = false,
  onSearchClick,
  onDeleteSearch,
  onClearAll,
}: LibraryTabProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Filter and group searches
  const filteredSearches = useMemo(() => {
    if (!searchFilter.trim()) return searches;
    const filter = searchFilter.toLowerCase();
    return searches.filter(
      s => s.niche.toLowerCase().includes(filter) || s.location.toLowerCase().includes(filter)
    );
  }, [searches, searchFilter]);

  const groupedSearches = useMemo(() => groupSearchesByTime(filteredSearches), [filteredSearches]);

  // Loading state
  if (isLoading) {
    return (
      <TabContent>
        <TabHeader title="Library" subtitle="Your saved searches and analyses" />
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </TabContent>
    );
  }

  // Empty state
  if (searches.length === 0) {
    return (
      <TabContent>
        <TabHeader title="Library" subtitle="Your saved searches and analyses" />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No searches yet</h3>
          <p className="text-sm text-zinc-500 max-w-sm">
            Your searches will appear here. Go to the Search tab to find businesses in your target market.
          </p>
        </div>
      </TabContent>
    );
  }

  return (
    <TabContent>
      <TabHeader
        title="Library"
        subtitle={`${searches.length} saved ${searches.length === 1 ? 'search' : 'searches'}`}
        actions={
          <div className="flex items-center gap-2">
            {onClearAll && searches.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all saved searches? This cannot be undone.')) {
                    onClearAll();
                  }
                }}
                className="px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            )}
            {onDeleteSearch && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  isEditing
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
        }
      />

      {/* Search filter */}
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter searches..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-800/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
          />
        </div>
      </div>

      {/* No results for filter */}
      {filteredSearches.length === 0 && searchFilter && (
        <div className="text-center py-8">
          <p className="text-zinc-500">No searches match &quot;{searchFilter}&quot;</p>
        </div>
      )}

      {/* Grouped searches */}
      <div className="space-y-6">
        {Object.entries(groupedSearches).map(([period, periodSearches]) => (
          <div key={period}>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
              {period}
            </h3>
            <div className="space-y-2">
              {periodSearches.map((search) => (
                <div
                  key={search.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors group"
                >
                  {/* Delete button (edit mode) */}
                  {isEditing && onDeleteSearch && (
                    <button
                      onClick={() => onDeleteSearch(search.id)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  {/* Status indicator */}
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      search.analyzedCount > 0 ? 'bg-violet-500' : 'bg-zinc-600'
                    }`}
                  />

                  {/* Content - clickable */}
                  <button
                    onClick={() => !isEditing && onSearchClick(search)}
                    className="flex-1 min-w-0 text-left"
                    disabled={isEditing}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {search.niche} in {search.location}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-zinc-500">
                            {search.totalCount} businesses
                          </span>
                          {search.analyzedCount > 0 && (
                            <>
                              <span className="text-zinc-700">·</span>
                              <span className="text-xs text-violet-400">
                                {search.analyzedCount} analyzed
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Progress indicator */}
                      {search.analyzedCount > 0 && search.analyzedCount < search.totalCount && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${(search.analyzedCount / search.totalCount) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-600">
                            {Math.round((search.analyzedCount / search.totalCount) * 100)}%
                          </span>
                        </div>
                      )}

                      {/* Completed badge */}
                      {search.analyzedCount === search.totalCount && search.analyzedCount > 0 && (
                        <span className="text-xs text-emerald-400 font-medium">Complete</span>
                      )}

                      {/* Chevron */}
                      {!isEditing && (
                        <svg
                          className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TabContent>
  );
}
