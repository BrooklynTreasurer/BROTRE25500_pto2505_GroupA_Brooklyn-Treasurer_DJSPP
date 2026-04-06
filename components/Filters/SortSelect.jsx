import styles from "../../styles/SortSelect.module.css";

/**
 * Renders the sort dropdown used to order podcasts.
 * @param {Object} props - Component props.
 * @param {{ key: string, label: string }[]} props.options - Sort options.
 * @param {string} props.selectedSort - Selected sort key.
 * @param {(sortKey: string) => void} props.onSelectSort - Sort change callback.
 * @returns {JSX.Element}
 */
export default function SortSelect({ options, selectedSort, onSelectSort }) {
  return (
    <div className={styles.sortSelect}>
      <label htmlFor="sort-select" className={styles.label}>
        Sort by:
      </label>
      <select
        id="sort-select"
        className={styles.select}
        value={selectedSort}
        onChange={(e) => onSelectSort(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
