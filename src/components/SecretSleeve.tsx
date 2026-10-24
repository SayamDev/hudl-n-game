import { WorldArt } from "./IllustratedCast";
import { useGame } from "../store/useGame";
/** Original geometric deck artwork. No secret or role data enters this graphic. */
export function SecretSleeve({
  ready,
  seen,
}: {
  ready: boolean;
  seen: boolean;
}) {
  const noir = useGame(
    (s) =>
      s.preferences.deckStyle !== false &&
      !["classic", "club-original"].includes(s.preferences.design),
  );
  const session = useGame((s) => s.session);
  const world =
    session?.game === "charades"
      ? session.options.charadesMode === "classic"
        ? "charades"
        : "heads-up"
      : session?.game || "imposter";
  if (noir)
    return (
      <div
        className={`secret-sleeve noir-private-deck ${ready ? "is-ready" : ""}`}
        aria-hidden="true"
      >
        <span className="private-card-back" />
        <span className="private-card-back second" />
        <div className="private-card-face">
          <WorldArt world={world} />
          <span className="private-n">n</span>
        </div>
      </div>
    );
  return (
    <div
      className={`secret-sleeve ${ready ? "is-ready" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 300 160" focusable="false">
        <g className="sleeve-back">
          <rect
            x="78"
            y="18"
            width="140"
            height="116"
            rx="12"
            fill="#bcb0ff"
            transform="rotate(-10 148 76)"
          />
          <rect
            x="82"
            y="20"
            width="140"
            height="116"
            rx="12"
            fill="#76e3c7"
            transform="rotate(8 152 78)"
          />
        </g>
        <g className="sleeve-front">
          <rect x="68" y="35" width="164" height="108" rx="12" fill="#d4fa77" />
          <path
            d="M69 53 150 99 231 53"
            fill="none"
            stroke="#19211c"
            strokeWidth="3"
          />
          <path
            d="m69 130 51-43m111 43-51-43"
            fill="none"
            stroke="#19211c"
            strokeWidth="2"
          />
          <rect
            x="125"
            y="72"
            width="50"
            height="46"
            rx="9"
            fill="#19211c"
            transform="rotate(-8 150 95)"
          />
          <path
            d="M138 87v18m0-13q14-13 14 1v11"
            fill="none"
            stroke="#d4fa77"
            strokeWidth="5"
          />
        </g>
        <path
          className="sleeve-tab"
          d="m140 16 10-9 10 9m-10-8v23"
          fill="none"
          stroke="#d4fa77"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        {seen ? "SEALED AGAIN" : ready ? "SEALED FOR YOU" : "PASS IT ON"}
      </span>
    </div>
  );
}
