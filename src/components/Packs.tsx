import { useEffect, useRef, useState } from "react";
import PackStudio from "./PackStudio";
import QRCode from "qrcode";
import { useGame } from "../store/useGame";
import { decodePack, encodePack, validatePack } from "../lib/logic";
import { Button, Screen, Toggle } from "./ui";
import type { Pack } from "../lib/types";
export default function Packs() {
  const [view, setView] = useState<"mix" | "write" | "saved">("mix");
  const nameInput = useRef<HTMLInputElement>(null);
  const { customPacks, addPack, removePack, preferences } = useGame();
  const [name, setName] = useState(""),
    [words, setWords] = useState(""),
    [adult, setAdult] = useState(false),
    [error, setError] = useState(""),
    [status, setStatus] = useState(""),
    [share, setShare] = useState(""),
    [qr, setQr] = useState(""),
    [importPack, setImportPack] = useState<Pack | null>(null);
  useEffect(() => {
    const hash = location.hash;
    if (hash.startsWith("#pack=")) {
      try {
        setImportPack(decodePack(hash.slice(6)));
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }, []);
  const sharePack = async (p: Pack) => {
    const url = `${location.origin}${location.pathname}#pack=${encodePack(p)}`;
    setShare(url);
    try {
      setQr(
        await QRCode.toDataURL(url, {
          width: 240,
          margin: 2,
          errorCorrectionLevel: "L",
        }),
      );
    } catch {
      setQr("");
    }
    setStatus("Share this link or scan the code to import the pack.");
  };
  return (
    <Screen
      title="Your words. Their chaos."
      subtitle="Make a pack of inside jokes, favourite things, or suspiciously specific snacks."
    >
      {importPack && (
        <div className="notice">
          <h2>Import “{importPack.name}”?</h2>
          <p>
            {importPack.words.length} words. Shared packs are written by other
            players.{importPack.adult ? " This pack is marked 18+." : ""}
          </p>
          <Button
            className="primary"
            disabled={
              !!importPack.adult && (!preferences.adult || preferences.family)
            }
            onClick={() => {
              addPack(importPack);
              setImportPack(null);
              history.replaceState(null, "", location.pathname);
              setStatus("Pack imported. Find it in game settings.");
            }}
          >
            Import pack
          </Button>
          {importPack.adult && (!preferences.adult || preferences.family) && (
            <p>Enable adult content in settings to import this pack.</p>
          )}
          <Button
            onClick={() => {
              setImportPack(null);
              history.replaceState(null, "", location.pathname);
            }}
          >
            Decline
          </Button>
        </div>
      )}
      <nav className="pack-tabs" aria-label="Pack workspace">
        <button aria-pressed={view === "mix"} onClick={() => setView("mix")}>
          Mix a pack
        </button>
        <button
          aria-pressed={view === "write"}
          onClick={() => setView("write")}
        >
          Write your own
        </button>
        <button
          aria-pressed={view === "saved"}
          onClick={() => setView("saved")}
        >
          Saved ({customPacks.length})
        </button>
      </nav>
      <div hidden={view !== "mix"}>
        <PackStudio
          onUseDraft={(draft) => {
            if (
              (name || words) &&
              !confirm("Replace the unsaved words below with this draft?")
            )
              return;
            setView("write");
            setName(draft.name);
            setWords(draft.words.join("\n"));
            setAdult(false);
            setError("");
            setStatus("Draft ready. Edit any words, then save your pack.");
            requestAnimationFrame(() => {
              nameInput.current?.focus();
              nameInput.current?.scrollIntoView({ block: "center" });
            });
          }}
        />
      </div>
      <div className="pack-write" hidden={view !== "write"}>
        <h2>Make it yours</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              const p = validatePack({
                name,
                words: words
                  .split(/[\n,]/)
                  .map((w) => w.trim())
                  .filter(Boolean),
                adult,
              });
              if (p.words.length < 6)
                throw Error("Add at least six different words.");
              addPack(p);
              setView("saved");
              setName("");
              setWords("");
              setError("");
              setStatus(
                "Pack saved. Choose it in Imposter or Heads Up settings.",
              );
            } catch (err) {
              setError((err as Error).message);
            }
          }}
        >
          <label>
            Pack name
            <input
              ref={nameInput}
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Our inside jokes"
              required
            />
          </label>
          <label>
            Words
            <textarea
              value={words}
              onChange={(e) => setWords(e.target.value)}
              placeholder="One word or phrase per line"
              rows={6}
              required
              maxLength={12000}
            />
          </label>
          <p className="helper">
            6-200 words. Separate with new lines or commas.
          </p>
          <Toggle
            label="Mark this pack as 18+"
            checked={adult}
            onChange={setAdult}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button className="primary" type="submit">
            Save pack
          </Button>
        </form>
      </div>
      {error && view !== "write" && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {status && <p role="status">{status}</p>}
      {share && (
        <div className="share-box">
          {qr && (
            <img
              src={qr}
              width="240"
              height="240"
              alt="QR code for this custom word pack"
            />
          )}
          <label>
            Shareable pack link
            <input readOnly value={share} onFocus={(e) => e.target.select()} />
          </label>
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(share);
                setStatus("Link copied.");
              } catch {
                setStatus("Select and copy the link above.");
              }
            }}
          >
            Copy link
          </Button>
        </div>
      )}
      <div className="pack-saved" hidden={view !== "saved"}>
        <h2>Your collection</h2>
        {customPacks.length ? (
          customPacks.map((p) => (
            <div className="pack-row" key={p.id}>
              <div>
                <strong>{p.name}</strong>
                <small>
                  {p.words.length} words{p.adult ? " · 18+" : ""}
                </small>
              </div>
              <Button onClick={() => sharePack(p)}>Share</Button>
              <Button
                aria-label={`Delete ${p.name}`}
                onClick={() => {
                  if (confirm(`Delete “${p.name}” from this device?`))
                    removePack(p.id);
                }}
              >
                Delete
              </Button>
            </div>
          ))
        ) : (
          <p>Your first pack is waiting to happen.</p>
        )}
      </div>
    </Screen>
  );
}
