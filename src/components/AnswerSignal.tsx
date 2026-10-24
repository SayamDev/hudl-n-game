/** Public, room-readable marks. No private role or word is ever passed in. */
export function AnswerSignal({ correct }: { correct: boolean }) {
  return (
    <div
      className={`answer-signal ${correct ? "answer-correct" : "answer-skip"}`}
      role="status"
    >
      <svg viewBox="0 0 240 180" aria-hidden="true" focusable="false">
        {correct ? (
          <>
            <path
              className="signal-rays"
              d="m120 12 6 22m56-8-11 18m46 22-22 7M23 66l22 7m13-47 11 18M31 128l24-8m154 8-24-8"
            />
            <path
              className="signal-laurel"
              d="M82 153C32 130 38 71 57 48m101 105c50-23 44-82 25-105M54 90 36 76m21 39-24-8m32 30-23-1m144-46 18-14m-21 39 24-8m-32 30 23-1"
            />
            <path className="signal-check" d="m79 89 29 30 57-64" />
            <path d="m97 153 23-9 23 9-23 9Z" fill="currentColor" />
          </>
        ) : (
          <>
            <path
              className="signal-cards"
              d="m65 51-25 7 23 96 69-16m-58-96 71-11 18 112-71 11Z"
            />
            <path className="signal-arrow" d="M99 96h80m-25-25 26 25-26 25" />
            <path
              className="signal-rays"
              d="m193 43 14-12m-8 115 16 10M35 37l-9-12"
            />
          </>
        )}
      </svg>
      <strong>{correct ? "CORRECT!" : "SKIP!"}</strong>
      <span>{correct ? "+1 for your team" : "Fresh word coming up"}</span>
    </div>
  );
}
