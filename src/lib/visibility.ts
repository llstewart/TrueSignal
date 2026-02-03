import { searchGoogleMaps } from './outscraper';

// Number of top results to check for visibility
const VISIBILITY_TOP_N = 20; // Increased to show more ranking positions

/**
 * Check if a business appears in actual Google Maps search results
 * Returns the rank position (1-based) or null if not found
 */
export async function checkSearchVisibility(
  businessName: string,
  niche: string,
  location: string
): Promise<number | null> {
  try {
    console.log(`[Visibility] Checking rank for "${businessName}" in "${niche}" search in "${location}"`);

    // Search Google Maps for the niche in location
    const results = await searchGoogleMaps(niche, location, VISIBILITY_TOP_N);

    // Check if the business appears in top results
    const normalizedBusinessName = businessName.toLowerCase().trim();

    for (let i = 0; i < results.length; i++) {
      const resultName = results[i].name.toLowerCase().trim();
      const position = i + 1; // 1-based position

      // Check for exact match or significant overlap
      if (resultName === normalizedBusinessName) {
        console.log(`[Visibility] ✓ "${businessName}" ranked #${position} (exact match)`);
        return position;
      }

      // Check if one contains the other (handles "Joe's Plumbing" vs "Joe's Plumbing LLC")
      if (resultName.includes(normalizedBusinessName) || normalizedBusinessName.includes(resultName)) {
        console.log(`[Visibility] ✓ "${businessName}" ranked #${position} (partial match: "${results[i].name}")`);
        return position;
      }

      // Check significant word overlap (3+ char words)
      const businessWords = normalizedBusinessName.split(/\s+/).filter(w => w.length > 3);
      const resultWords = resultName.split(/\s+/).filter(w => w.length > 3);
      const matchingWords = businessWords.filter(w => resultWords.includes(w));

      if (businessWords.length > 0 && matchingWords.length >= Math.ceil(businessWords.length * 0.6)) {
        console.log(`[Visibility] ✓ "${businessName}" ranked #${position} (word match: "${results[i].name}")`);
        return position;
      }
    }

    console.log(`[Visibility] ✗ "${businessName}" not found in top ${results.length} results`);
    return null;
  } catch (error) {
    console.error('[Visibility] Check failed:', error);
    return null;
  }
}

/**
 * Helper function to calculate match score between business name and search result
 * Returns: 3 for exact match, 2 for contains match, 1 for word overlap, 0 for no match
 */
function calculateMatchScore(businessName: string, resultName: string): number {
  // Exact match - highest priority
  if (resultName === businessName) {
    return 3;
  }

  // Contains match - high priority
  if (resultName.includes(businessName) || businessName.includes(resultName)) {
    return 2;
  }

  // Word overlap check - lower priority
  const businessWords = businessName.split(/\s+/).filter(w => w.length > 3);
  const resultWords = resultName.split(/\s+/).filter(w => w.length > 3);
  const matchingWords = businessWords.filter(w => resultWords.includes(w));

  if (businessWords.length > 0 && matchingWords.length >= Math.ceil(businessWords.length * 0.6)) {
    return 1;
  }

  return 0;
}

/**
 * Batch check visibility for multiple businesses
 * Makes ONE search request and checks all businesses against it
 * Each position can only be assigned to ONE business (no duplicates)
 * Uses priority matching: exact > contains > word overlap
 * Returns rank position (1-based) or null if not found
 */
export async function batchCheckVisibility(
  businesses: { name: string }[],
  niche: string,
  location: string
): Promise<Map<string, number | null>> {
  const results = new Map<string, number | null>();

  try {
    console.log(`[Visibility] Batch checking ${businesses.length} businesses for "${niche}" in "${location}"`);

    // Make ONE search request
    const searchResults = await searchGoogleMaps(niche, location, VISIBILITY_TOP_N);

    // Store search results with their positions
    const topBusinesses = searchResults.map((r, index) => ({
      name: r.name.toLowerCase().trim(),
      originalName: r.name,
      position: index + 1, // 1-based position
    }));

    console.log(`[Visibility] Top ${searchResults.length} results:`, topBusinesses.slice(0, 5).map(b => `#${b.position} ${b.name}`));

    // Track which positions have been claimed (each position can only be assigned once)
    const claimedPositions = new Set<number>();

    // Initialize all businesses as unranked
    const unmatchedBusinesses = new Set(businesses.map(b => b.name));

    // Match in priority order: exact matches first, then contains, then word overlap
    // This ensures the best matches get the positions first
    for (const matchPriority of [3, 2, 1]) {
      for (const business of businesses) {
        // Skip if already matched
        if (!unmatchedBusinesses.has(business.name)) continue;

        const normalizedName = business.name.toLowerCase().trim();
        let matchedPosition: number | null = null;

        for (const result of topBusinesses) {
          // Skip already claimed positions
          if (claimedPositions.has(result.position)) continue;

          const score = calculateMatchScore(normalizedName, result.name);

          // Only consider matches at current priority level
          if (score === matchPriority) {
            // Take the first (highest ranked) match at this priority level
            matchedPosition = result.position;
            break; // Take the first match at this priority
          }
        }

        if (matchedPosition !== null) {
          results.set(business.name, matchedPosition);
          claimedPositions.add(matchedPosition);
          unmatchedBusinesses.delete(business.name);
          console.log(`[Visibility] ✓ "${business.name}" ranked #${matchedPosition} (priority ${matchPriority})`);
        }
      }
    }

    // Set null for any businesses that weren't matched
    Array.from(unmatchedBusinesses).forEach(businessName => {
      results.set(businessName, null);
    });

    const rankedCount = Array.from(results.values()).filter(v => v !== null).length;
    console.log(`[Visibility] Batch complete: ${rankedCount}/${businesses.length} businesses found in top ${VISIBILITY_TOP_N} results`);

  } catch (error) {
    console.error('[Visibility] Batch check failed:', error);
    // Default all to null on error
    for (const business of businesses) {
      results.set(business.name, null);
    }
  }

  return results;
}
