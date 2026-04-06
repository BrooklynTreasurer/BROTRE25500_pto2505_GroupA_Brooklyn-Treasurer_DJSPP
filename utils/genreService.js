/**
 * Service to retrieve genre titles from genre IDs.
 *
 * @principle SRP - Single Responsibility Principle: Only responsible for mapping genre IDs to names.
 */
const GENRES_BY_ID = {
  1: "Personal Growth",
  2: "Investigative Journalism",
  3: "History",
  4: "Comedy",
  5: "Entertainment",
  6: "Business",
  7: "Fiction",
  8: "News",
  9: "Kids and Family",
};

export const GenreService = {
  /**
   * Resolves an array of genre IDs into an array of genre titles.
   * @param {number[]} genreIds - Array of genre IDs.
   * @returns {string[]} Array of genre titles.
   */
  getNames(genreIds) {
    if (!Array.isArray(genreIds)) return [];
    return genreIds.map((id) => GENRES_BY_ID[id] || "Unknown");
  },

  /**
   * Returns all known genres in dropdown-friendly format.
   * @returns {{ id: number, name: string }[]}
   */
  getAll() {
    return Object.entries(GENRES_BY_ID).map(([id, name]) => ({
      id: Number(id),
      name,
    }));
  },
};
