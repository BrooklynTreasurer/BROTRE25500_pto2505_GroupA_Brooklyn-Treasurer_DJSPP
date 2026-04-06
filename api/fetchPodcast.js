const API_URL = "https://podcast-api.netlify.app/shows";

let cachedPodcasts = null;

/**
 * Fetches podcast data from the API and caches it in memory.
 * @returns {Promise<Object[]>} A list of podcasts.
 * @throws {Error} When the API request fails.
 */
export async function fetchPodcasts() {
  if (cachedPodcasts) return cachedPodcasts;
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch podcasts: " + response.status);
  }

  const data = await response.json();
  cachedPodcasts = data;

  return data;
}
