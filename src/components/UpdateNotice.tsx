import { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Button } from "./ui";
/** In-flow update chrome never covers navigation or a player's private card. */
export function UpdateNotice({ onUpdate }: { onUpdate: () => Promise<void> }) {
  const [dismissed, setDismissed] = useState(false),
    [busy, setBusy] = useState(false),
    [failed, setFailed] = useState(false);
  if (dismissed) return null;
  return (
    <aside className="update-notice" aria-label="App update">
      <div>
        <strong>Ready for the next round.</strong>
        <p role="status">
          {failed
            ? "Couldn’t update just now. You can keep playing and try again."
            : busy
              ? "Updating the app…"
              : "A new version is ready. Your crew and scores stay saved."}
        </p>
      </div>
      <div className="update-actions">
        <Button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setFailed(false);
            try {
              await onUpdate();
            } catch {
              setFailed(true);
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Updating…" : "Update now"}
        </Button>
        <button
          className="icon-button"
          aria-label="Dismiss update notice"
          disabled={busy}
          onClick={() => setDismissed(true)}
        >
          <X size={20} />
        </button>
      </div>
    </aside>
  );
}
