import styles from "./PostsSearchBar.module.css";

export type PostsSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
};

export function PostsSearchBar({ value, onChange, id = "posts-search" }: PostsSearchBarProps) {
  return (
    <div className={styles.wrap}>
      <label className={styles.label} htmlFor={id}>
        Buscar publicaciones
      </label>
      <div className={styles.field}>
        <input
          id={id}
          className={styles.input}
          type="search"
          name="q"
          value={value}
          onChange={(changeEvent) => onChange(changeEvent.target.value)}
          placeholder="Filtra por título o contenido…"
          autoComplete="off"
          enterKeyHint="search"
        />
        {value.trim() !== "" && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => onChange("")}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
