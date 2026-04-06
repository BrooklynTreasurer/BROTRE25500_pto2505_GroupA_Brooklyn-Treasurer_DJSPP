const API_URL = "https://podcast-api.netlify.app/id/<ID>"

/** * Fetches detailed podcast data by ID from the API.
 * @param {string} id - The ID of the podcast to fetch.
 * @returns {Promise<Object>} Detailed podcast data.
 * @throws {Error} When the API request fails.
 * */

export async function fetchPodcastDetails(id) {
  const response = await fetch(API_URL.replace("<ID>", id));
  if (!response.ok) {
    throw new Error("Failed to fetch podcast details: " + response.status);
  }
  return response.json();
}
