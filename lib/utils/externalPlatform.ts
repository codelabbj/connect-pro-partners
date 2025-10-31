import { ExternalPlatformData } from "@/lib/types/betting"

const EXTERNAL_API_URL = "https://api.blaffa.net/blaffa/app_name"

/**
 * Fetches external platform data from Blaffa API
 * This provides additional information like location (city, street), images, and tutorial content
 * The API returns a direct array, not wrapped in an object
 */
export async function fetchExternalPlatforms(): Promise<ExternalPlatformData[]> {
  try {
    const response = await fetch(EXTERNAL_API_URL)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch external platforms: ${response.status}`)
    }
    
    // The API returns a direct array, not wrapped in { platforms: [...] }
    const data: ExternalPlatformData[] = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("Error fetching external platforms:", error)
    return []
  }
}

/**
 * Matches a betting platform with external platform data using external_id
 * @param externalId - The external_id from BettingPlatform
 * @param externalPlatforms - Array of external platform data
 * @returns Matching ExternalPlatformData or null
 */
export function matchExternalPlatform(
  externalId: string,
  externalPlatforms: ExternalPlatformData[]
): ExternalPlatformData | null {
  return externalPlatforms.find(platform => platform.id === externalId) || null
}

/**
 * Gets external platform data for a specific platform by external_id
 * @param externalId - The external_id from BettingPlatform
 * @returns ExternalPlatformData or null
 */
export async function getExternalPlatformData(
  externalId: string
): Promise<ExternalPlatformData | null> {
  const platforms = await fetchExternalPlatforms()
  return matchExternalPlatform(externalId, platforms)
}

