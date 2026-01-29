'use client';

import { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from './LoadingState';

const STORAGE_KEY_NICHES = 'truesignal_recent_niches';
const MAX_RECENT_ITEMS = 8;

// US States
const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'DC', name: 'Washington DC' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

// Supported countries
const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'OTHER', name: 'Other', flag: '🌍' },
];

// Canadian Provinces
const CA_PROVINCES = [
  { code: 'AB', name: 'Alberta' }, { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' }, { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland' }, { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' }, { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' }, { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' }, { code: 'SK', name: 'Saskatchewan' }, { code: 'YT', name: 'Yukon' }
];

// UK Regions
const UK_REGIONS = [
  { code: 'ENG', name: 'England' }, { code: 'SCT', name: 'Scotland' },
  { code: 'WLS', name: 'Wales' }, { code: 'NIR', name: 'Northern Ireland' }
];

// Australian States
const AU_STATES = [
  { code: 'NSW', name: 'New South Wales' }, { code: 'VIC', name: 'Victoria' },
  { code: 'QLD', name: 'Queensland' }, { code: 'WA', name: 'Western Australia' },
  { code: 'SA', name: 'South Australia' }, { code: 'TAS', name: 'Tasmania' },
  { code: 'ACT', name: 'ACT' }, { code: 'NT', name: 'Northern Territory' }
];

function getRegionsForCountry(countryCode: string) {
  switch (countryCode) {
    case 'US': return US_STATES;
    case 'CA': return CA_PROVINCES;
    case 'UK': return UK_REGIONS;
    case 'AU': return AU_STATES;
    default: return [];
  }
}

function getRegionPlaceholder(countryCode: string) {
  switch (countryCode) {
    case 'US': return 'State';
    case 'CA': return 'Province';
    case 'UK': return 'Region';
    case 'AU': return 'State';
    default: return 'Region';
  }
}

function getRecentItems(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentItem(key: string, item: string) {
  if (typeof window === 'undefined') return;
  try {
    const items = getRecentItems(key);
    const filtered = items.filter(i => i.toLowerCase() !== item.toLowerCase());
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch { }
}

function clearRecentItems(key: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(key); } catch { }
}

interface SearchFormProps {
  onSearch: (niche: string, location: string) => Promise<void>;
  isLoading: boolean;
  initialNiche?: string;
  initialLocation?: string;
}

export function SearchForm({ onSearch, isLoading, initialNiche = '', initialLocation = '' }: SearchFormProps) {
  const [niche, setNiche] = useState(initialNiche);
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [country, setCountry] = useState('US');
  const [freeformLocation, setFreeformLocation] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [recentNiches, setRecentNiches] = useState<string[]>([]);
  const [showNicheSuggestions, setShowNicheSuggestions] = useState(false);
  const [activeField, setActiveField] = useState<'niche' | 'location' | null>(null);

  const countryPickerRef = useRef<HTMLDivElement>(null);
  const nicheInputRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialLocation) {
      const parts = initialLocation.split(',').map(p => p.trim());
      if (parts.length === 2) {
        setCity(parts[0]);
        setRegion(parts[1]);
      } else {
        setFreeformLocation(initialLocation);
      }
    }
  }, [initialLocation]);

  useEffect(() => {
    setRecentNiches(getRecentItems(STORAGE_KEY_NICHES));
  }, []);

  useEffect(() => {
    if (initialNiche) setNiche(initialNiche);
  }, [initialNiche]);

  const [showRegionPicker, setShowRegionPicker] = useState(false);
  const [regionSearch, setRegionSearch] = useState('');
  const regionPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setShowCountryPicker(false);
      }
      if (regionPickerRef.current && !regionPickerRef.current.contains(event.target as Node)) {
        setShowRegionPicker(false);
      }
      if (nicheInputRef.current && !nicheInputRef.current.contains(event.target as Node)) {
        setShowNicheSuggestions(false);
      }
      // Click outside form resets active field visual state
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const regions = getRegionsForCountry(country);
  const regionPlaceholder = getRegionPlaceholder(country);
  const selectedCountry = COUNTRIES.find(c => c.code === country);
  const selectedRegion = regions.find(r => r.code === region);

  const getLocationString = () => {
    if (country === 'OTHER') return freeformLocation.trim();
    if (city.trim() && region) return `${city.trim()}, ${region}`;
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const locationString = getLocationString();
    if (niche.trim() && locationString) {
      saveRecentItem(STORAGE_KEY_NICHES, niche.trim());
      setRecentNiches(getRecentItems(STORAGE_KEY_NICHES));
      await onSearch(niche.trim(), locationString);
    }
  };

  const filteredNiches = niche.length > 0
    ? recentNiches.filter(item =>
      item.toLowerCase().includes(niche.toLowerCase()) &&
      item.toLowerCase() !== niche.toLowerCase()
    ).slice(0, 5)
    : recentNiches.slice(0, 5);

  const isFormValid = niche.trim() && (
    country === 'OTHER' ? freeformLocation.trim() : city.trim() && region
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full max-w-4xl mx-auto relative z-20"
    >
      <div className={`
        relative flex flex-col md:flex-row items-stretch md:items-center
        bg-[#18181b] border border-zinc-800
        rounded-2xl transition-all duration-300
        ${activeField ? 'shadow-2xl shadow-primary/5 border-primary/30 ring-1 ring-primary/30' : 'hover:border-zinc-700 shadow-xl shadow-black/20'}
      `}>

        {/* Niche Section */}
        <div
          ref={nicheInputRef}
          className="relative flex-1 group"
        >
          <div className="px-6 py-4 md:py-5 flex flex-col justify-center h-full rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none transition-colors">
            <label className={`text-xs font-medium mb-1 block uppercase tracking-wider transition-colors ${activeField === 'niche' ? 'text-primary' : 'text-zinc-500'}`}>
              Target Niche
            </label>
            <div className="flex items-center">
              <svg className={`w-4 h-4 mr-3 transition-colors ${activeField === 'niche' ? 'text-primary' : 'text-zinc-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={niche}
                onChange={(e) => {
                  setNiche(e.target.value);
                  setShowNicheSuggestions(true);
                }}
                onFocus={() => {
                  setActiveField('niche');
                  setShowNicheSuggestions(true);
                }}
                placeholder="Ex. Dentist, Roofers..."
                className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Recent niches dropdown */}
          {showNicheSuggestions && filteredNiches.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Recent Searches</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearRecentItems(STORAGE_KEY_NICHES);
                    setRecentNiches([]);
                  }}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Clear History
                </button>
              </div>
              <div className="py-1">
                {filteredNiches.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setNiche(item);
                      setShowNicheSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-zinc-800" />
        <div className="block md:hidden h-px w-full bg-zinc-800" />

        {/* Location Section */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center relative">

          {/* Country Trigger */}
          <div ref={countryPickerRef} className="relative border-b md:border-b-0 md:border-r border-zinc-800 md:w-32">
            <button
              type="button"
              onClick={() => setShowCountryPicker(!showCountryPicker)}
              className="w-full h-full px-6 py-4 md:py-5 text-left flex flex-col justify-center transition-colors group"
            >
              <label className="text-xs font-medium text-zinc-500 mb-1 block uppercase tracking-wider group-hover:text-zinc-400 transition-colors">
                Country
              </label>
              <div className="flex items-center gap-2 text-zinc-200">
                <span className="text-sm font-medium">{selectedCountry?.code}</span>
                <svg className={`w-3 h-3 text-zinc-600 ml-auto transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {showCountryPicker && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      setRegion('');
                      setShowCountryPicker(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${country === c.code
                      ? 'bg-primary/10 text-primary'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                      }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span className="text-sm font-medium">{c.name}</span>
                    {country === c.code && (
                      <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* City/Region Inputs */}
          <div className="flex-1 px-6 py-4 md:py-5 flex flex-col justify-center transition-colors">
            <label className={`text-xs font-medium mb-1 block uppercase tracking-wider transition-colors ${activeField === 'location' ? 'text-primary' : 'text-zinc-500'}`}>
              {country === 'OTHER' ? 'Full Address' : 'City & Region'}
            </label>
            <div className="flex items-center gap-2">
              {country === 'OTHER' ? (
                <input
                  type="text"
                  value={freeformLocation}
                  onChange={(e) => setFreeformLocation(e.target.value)}
                  onFocus={() => setActiveField('location')}
                  placeholder="Enter detailed location..."
                  className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
                  disabled={isLoading}
                />
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    onFocus={() => setActiveField('location')}
                    placeholder="City Name"
                    className="flex-1 min-w-0 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 font-medium"
                    disabled={isLoading}
                  />
                  <span className="text-zinc-700">/</span>
                  <div className="relative min-w-[80px] md:min-w-[140px]" ref={regionPickerRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRegionPicker(!showRegionPicker);
                        setActiveField('location');
                        setRegionSearch(''); // Reset search on open
                      }}
                      className="w-full text-left bg-transparent outline-none text-zinc-100 font-medium flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <span className={`truncate ${!region ? 'text-zinc-600' : 'text-zinc-100'}`}>
                        {selectedRegion ? selectedRegion.code : `Select ${regionPlaceholder}`}
                      </span>
                      <svg className={`w-3 h-3 text-zinc-600 ml-auto flex-shrink-0 transition-transform ${showRegionPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showRegionPicker && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-[#18181b] border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 py-1 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Search Input Sticky Header */}
                        <div className="px-2 py-1 border-b border-zinc-800/50 mb-1">
                          <input
                            autoFocus
                            type="text"
                            value={regionSearch} // Ensure this state exists
                            onChange={(e) => setRegionSearch(e.target.value)}
                            placeholder={`Search ${regionPlaceholder}...`}
                            className="w-full px-2 py-1.5 text-sm bg-zinc-900/50 text-zinc-200 rounded-lg outline-none placeholder:text-zinc-600 focus:bg-zinc-900 border border-transparent focus:border-zinc-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                          {regions
                            .filter(r => r.name.toLowerCase().includes(regionSearch.toLowerCase()) || r.code.toLowerCase().includes(regionSearch.toLowerCase()))
                            .map((r) => (
                              <button
                                key={r.code}
                                type="button"
                                onClick={() => {
                                  setRegion(r.code);
                                  setShowRegionPicker(false);
                                  setRegionSearch('');
                                }}
                                className={`w-full px-4 py-2 text-left flex items-center justify-between text-sm transition-colors ${region === r.code
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
                                  }`}
                              >
                                <span>{r.name}</span>
                                {region === r.code && (
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>
                            ))}
                          {regions.filter(r => r.name.toLowerCase().includes(regionSearch.toLowerCase()) || r.code.toLowerCase().includes(regionSearch.toLowerCase())).length === 0 && (
                            <div className="px-4 py-3 text-center text-xs text-zinc-500">
                              No {regionPlaceholder.toLowerCase()}s found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-2 md:pl-0">
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className={`
              w-full md:w-auto h-14 md:h-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300
              ${!isFormValid
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95'
              }
            `}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="text-current" />
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </form>
  );
}
