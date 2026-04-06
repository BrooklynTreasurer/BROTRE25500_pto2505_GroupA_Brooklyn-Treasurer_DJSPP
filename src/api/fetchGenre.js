const API_URL = "https://podcast-api.netlify.app/genre/<ID>";
const genreCache = new Map();

/**
 * Genre payload returned by the genre API endpoint.
 * @typedef {Object} GenreApiResponse
 * @property {number|string} [id] - Genre identifier.
 * @property {string} [title] - Genre display title.
 * @property {string} [name] - Alternative genre name field.
 * @property {string} [genre] - Legacy/alternate genre name field.
 */

/**
 * Converts a mixed value to a valid positive integer genre id.
 * @param {unknown} value - Incoming id-like value.
 * @returns {number|null} Parsed id or `null` when invalid.
 */
function toValidGenreId(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

/**
 * Normalizes a genre label by removing a leading "Genre " prefix.
 * @param {unknown} value - Incoming genre label.
 * @returns {string} Cleaned genre label.
 */
function cleanGenreName(value) {
  if (typeof value !== "string") return "";
  return value.replace(/^genre\s+/i, "").trim();
}

/**
 * Excludes non-category labels from UI display.
 * @param {unknown} value - Candidate genre label.
 * @returns {boolean} Whether this label should be shown.
 */
function isDisplayGenre(value) {
  const normalized = String(value).trim().toLowerCase();
  return normalized !== "" && normalized !== "all" && normalized !== "featured";
}

/**
 * Fetches detailed genre data by ID from the API.
 * Results are memoized in-memory by id for this browser session.
 * @param {string|number} id - The ID of the genre to fetch.
 * @returns {Promise<GenreApiResponse>} Genre data.
 * @throws {Error} When the API request fails.
 */
export async function fetchGenre(id) {
  const cacheKey = String(id);
  if (genreCache.has(cacheKey)) {
    return genreCache.get(cacheKey);
  }

  const response = await fetch(API_URL.replace("<ID>", id));
  if (!response.ok) {
    throw new Error("Failed to fetch genre details: " + response.status);
  }

  const data = await response.json();
  genreCache.set(cacheKey, data);
  return data;
}

/**
 * Resolves genre values from a show payload to clean display names.
 * Accepts both numeric ids and plain-text genre labels.
 * @param {(string|number)[]} genreIds - Raw genre values from show data.
 * @returns {Promise<string[]>} Deduplicated, display-ready genre names.
 */
export async function fetchGenreNames(genreIds) {
  if (!Array.isArray(genreIds) || genreIds.length === 0) return [];

  const inlineNames = [];
  const numericIds = [];

  for (const item of genreIds) {
    const maybeId = toValidGenreId(item);
    if (maybeId) {
      numericIds.push(maybeId);
      continue;
    }

    const cleaned = cleanGenreName(item);
    if (isDisplayGenre(cleaned)) {
      inlineNames.push(cleaned);
    }
  }

  const uniqueIds = [...new Set(numericIds)];
  const uniqueInlineNames = [...new Set(inlineNames)];
  if (uniqueIds.length === 0) return uniqueInlineNames;

  const results = await Promise.allSettled(uniqueIds.map((id) => fetchGenre(id)));

  const fetchedNames = uniqueIds.map((id, index) => {
    const result = results[index];
    if (result.status === "fulfilled") {
      const rawName =
        result.value?.title || result.value?.name || result.value?.genre || "";
      const cleanedName = cleanGenreName(rawName);
      return isDisplayGenre(cleanedName) ? cleanedName : "";
    }

    return "";
  });

  const combined = [...uniqueInlineNames, ...fetchedNames.filter(Boolean)];
  return [...new Set(combined)];
}
