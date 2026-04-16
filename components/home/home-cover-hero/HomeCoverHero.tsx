import styles from "./HomeCoverHero.module.css";

export function HomeCoverHero() {
  return (
    <div className={styles.root}>
      <p className={styles.kicker}>Blog editorial</p>
      <h1 className={styles.title}>
        Ideas que{" "}
        <span className={styles.titleAccent}>merecen</span> ser leídas
      </h1>
      <p className={styles.lead}>
        Textos breves, categorías curadas y un listado pensado para navegar con calma —
        sin ruido, solo contenido.
      </p>
      <div className={styles.rule} aria-hidden />
    </div>
  );
}
