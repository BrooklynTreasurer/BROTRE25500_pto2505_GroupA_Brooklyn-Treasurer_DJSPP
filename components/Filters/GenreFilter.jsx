import { useMemo, useState } from "react";
import styles from "../../styles/GenreFilter.module.css";

/**
 * Renders a genre dropdown filter with selectable options.
 * @param {Object} props - Component props.
 * @param {{ id: number, name: string }[]} props.genres - Available genres.
 * @param {string | number} props.selectedGenre - Selected genre id.
 * @param {(genreId: string) => void} props.onSelectGenre - Genre change callback.
 * @returns {JSX.Element}
 */
export default function GenreFilter({ genres, selectedGenre, onSelectGenre }) {
  const [isOpen, setIsOpen] = useState(false);
  const options = useMemo(
    () => [{ id: "all", name: "All Genres" }, ...genres],
    [genres]
  );

  const selectedOption =
    options.find((option) => String(option.id) === String(selectedGenre)) ||
    options[0];

  const handleSelect = (id) => {
    onSelectGenre(String(id));
    setIsOpen(false);
  };

  return (
    <div className={styles.genreFilter}>
      <label className={styles.label}>Filter by Genre:</label>
      <div className={styles.dropdown}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className={styles.triggerText}>{selectedOption.name}</span>
          <span className={styles.arrow}>{isOpen ? "^" : "v"}</span>
        </button>

        {isOpen && (
          <div className={styles.menu}>
            {options.map((option) => {
              const isSelected = String(option.id) === String(selectedGenre);
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`${styles.option} ${
                    isSelected ? styles.optionSelected : ""
                  }`}
                  onClick={() => handleSelect(option.id)}
                >
                  {option.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
