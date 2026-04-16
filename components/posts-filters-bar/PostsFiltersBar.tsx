import { PostsSearchBar } from "@/components/posts-search-bar/PostsSearchBar";
import {
  JSON_PLACEHOLDER_AUTHOR_USER_IDS,
  POST_LIST_SORT_OPTIONS,
  type SortOption,
} from "@/data/post-filters";
import styles from "./PostsFiltersBar.module.css";

export type PostsFiltersBarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  /** Solo en listado completo: elegir autor vía API */
  authorUserId: number | null;
  onAuthorChange: (userId: number | null) => void;
  /** true = viene de /listado?categoria=…, el autor no se elige aquí */
  lockAuthor: boolean;
  lockedAuthorId: number | null;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
};

export function PostsFiltersBar({
  searchQuery,
  onSearchChange,
  sort,
  onSortChange,
  authorUserId,
  onAuthorChange,
  lockAuthor,
  lockedAuthorId,
  onClearFilters,
  hasActiveFilters,
}: PostsFiltersBarProps) {
  return (
    <div className={styles.toolbar}>
      <PostsSearchBar value={searchQuery} onChange={onSearchChange} />

      <div className={styles.row}>
        {lockAuthor && lockedAuthorId != null ? (
          <p className={styles.locked} role="status">
            Autor acotado por la categoría:{" "}
            <span className={styles.lockedCode}>userId {lockedAuthorId}</span>
          </p>
        ) : (
          <div className={styles.field}>
            <label className={styles.label} htmlFor="filter-autor">
              Autor
            </label>
            <select
              id="filter-autor"
              className={styles.select}
              value={authorUserId ?? ""}
              onChange={(event) => {
                const selectedValue = event.target.value;
                onAuthorChange(
                  selectedValue === ""
                    ? null
                    : Number.parseInt(selectedValue, 10),
                );
              }}
            >
              <option value="">Todos los autores</option>
              {JSON_PLACEHOLDER_AUTHOR_USER_IDS.map((authorUserIdOption) => (
                <option key={authorUserIdOption} value={authorUserIdOption}>
                  Usuario {authorUserIdOption}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="filter-orden">
            Ordenar por
          </label>
          <select
            id="filter-orden"
            className={styles.select}
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as SortOption)
            }
          >
            {POST_LIST_SORT_OPTIONS.map((sortOption) => (
              <option key={sortOption.value || "default"} value={sortOption.value}>
                {sortOption.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearAll}
            onClick={onClearFilters}
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
