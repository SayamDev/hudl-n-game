/** Always available: no animation library, artwork fetch or delayed game state. */
export function SceneLoader() {
  return (
    <section
      className="scene-loader"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loader-deck" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div className={`loader-card loader-card-${i}`} key={i}>
            <svg viewBox="0 0 120 168" focusable="false">
              <path
                d="M15 3h90l12 12v138l-12 12H15L3 153V15Z"
                fill="currentColor"
              />
              <path d="M20 12h80l8 8v128l-8 8H20l-8-8V20Z" fill="#111019" />
              <path
                d="m60 35 28 49-28 49-28-49Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="m39 76 15 5-4 13-14-7m45-11-15 5 4 13 14-7"
                fill="currentColor"
              />
              <path
                d="m23 22 4 6-4 6-4-6Zm74 112 4 6-4 6-4-6Z"
                fill="currentColor"
              />
            </svg>
          </div>
        ))}
      </div>
      <h2>Setting the scene</h2>
      <p>Loading your next screen…</p>
      <div className="loader-track" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
