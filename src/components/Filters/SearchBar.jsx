import styles from "../../styles/SearchBar.module.css";

/**
 * Renders the podcast search input and submit button.
 * @param {Object} props - Component props.
 * @param {string} props.searchTerm - Current search value.
 * @param {(value: string) => void} props.onSearch - Search callback.
 * @returns {JSX.Element}
 */
export default function SearchBar({ searchTerm, onSearch }) {
  return (
    <div className={styles.searchBar}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="Search for a Podcast..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />

      <button
        type="button"
        className={styles.searchButton}
        onClick={() => onSearch(searchTerm)}
        aria-label="Search podcasts"
      >
        Search
      </button>
    </div>
  );
}
