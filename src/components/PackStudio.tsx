import { useEffect, useRef, useState } from "react";
import {
  Sparkle,
  Shuffle,
  WifiSlash,
  PencilSimple,
} from "@phosphor-icons/react";
import { Button } from "./ui";
import { makeOfflineMix, mixThemes, extendWords } from "../lib/packStudio";
import { validatePack } from "../lib/logic";
import type { Pack } from "../lib/types";
type Draft = Pick<Pack, "name" | "words" | "adult">;
export default function PackStudio({
  onUseDraft,
}: {
  onUseDraft: (draft: Draft) => void;
}) {
  const [notice, setNotice] = useState("");
  const [mode, setMode] = useState<"offline" | "ai">("offline");
  const [theme, setTheme] = useState("snacks"),
    [idea, setIdea] = useState(""),
    [count, setCount] = useState(24);
  const [available, setAvailable] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [draft, setDraft] = useState<{
    pack: Draft;
    source: "offline" | "ai";
  } | null>(null);
  const recent = useRef<string[]>([]),
    controller = useRef<AbortController | null>(null);
  const review = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const status = new AbortController();
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    fetch("/api/pack-studio/status", { signal: status.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAvailable(data?.available === true))
      .catch(() => {});
    return () => {
      status.abort();
      controller.current?.abort();
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [online]);
  useEffect(() => {
    if (draft) review.current?.focus();
  }, [draft]);
  const makeDraft = async (extend = false) => {
    setError("");
    setNotice("");
    const previous = extend && draft ? draft.pack.words : [];
    const accept = (pack: Draft, source: "offline" | "ai") => {
      const words = extendWords(previous, pack.words);
      if (words.length === previous.length) {
        setNotice(
          "No new words in that batch. Try another theme or save this draft and make a new pack.",
        );
        return;
      }
      if (words.length > 200) {
        setNotice(
          "Save this pack, then start another. Your collection can keep growing across packs.",
        );
        return;
      }
      recent.current = extendWords(recent.current, pack.words).slice(-2000);
      setDraft({
        pack: {
          ...pack,
          name: extend && draft ? draft.pack.name : pack.name,
          words,
        },
        source: extend && draft?.source === "ai" ? "ai" : source,
      });
      setNotice(
        `${words.length - previous.length} words added. Review them before saving.`,
      );
    };
    if (mode === "offline") {
      const pack = makeOfflineMix(theme, count, recent.current);
      accept(pack, "offline");
      return;
    }
    setBusy(true);
    const abort = new AbortController();
    controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 30000);
    try {
      const response = await fetch("/api/pack-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: idea.trim(),
          count,
          exclude: [...recent.current, ...previous].slice(-48),
        }),
        signal: abort.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(
          data.error || "The AI draft is unavailable. Try an offline mix.",
        );
      accept(validatePack({ ...data.draft, adult: false }), "ai");
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Could not make a draft. Try an offline mix.",
        );
      else
        setError(
          "Generation stopped. You can try again or make an offline mix.",
        );
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
      controller.current = null;
    }
  };
  return (
    <section className="pack-studio" aria-labelledby="studio-title">
      <div className="studio-heading">
        <Sparkle size={34} weight="duotone" aria-hidden="true" />
        <div>
          <h2 id="studio-title">Mix something good.</h2>
          <p>A pack with your kind of chaos.</p>
        </div>
      </div>
      <div
        className="studio-modes"
        role="group"
        aria-label="Pack creation method"
      >
        <button
          aria-pressed={mode === "offline"}
          disabled={busy}
          onClick={() => {
            setMode("offline");
            setError("");
          }}
        >
          <Shuffle size={20} />
          Offline mix
        </button>
        <button
          aria-pressed={mode === "ai"}
          disabled={busy}
          onClick={() => {
            setMode("ai");
            setError("");
          }}
        >
          <Sparkle size={20} />
          AI theme
        </button>
      </div>
      {mode === "offline" ? (
        <>
          <p className="studio-description">
            <WifiSlash size={18} aria-hidden="true" />
            Curated words, freshly shuffled. No internet needed.
          </p>
          <div className="studio-themes" role="group" aria-label="Mix theme">
            {mixThemes.map((t) => (
              <button
                key={t.id}
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
          <p className="helper">
            {mixThemes.find((t) => t.id === theme)?.description}
          </p>
        </>
      ) : (
        <>
          <label>
            Your theme
            <input
              value={idea}
              maxLength={120}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Space adventures, 90s movies…"
              disabled={busy}
              aria-describedby="ai-disclosure"
            />
          </label>
          <p className="helper" id="ai-disclosure">
            Your theme, batch size and up to 48 recent draft words go to Groq to
            avoid repeats. Leave out private details. Every draft is made for a
            family audience; review it for your group.
          </p>
          {(!available || !online) && (
            <p className="studio-unavailable" role="status">
              {!online
                ? "You’re offline. Saved packs and offline mixes are ready."
                : "AI mixing isn’t connected on this site. The local studio can generate drafts; save or share them here. Offline mixes work now."}
            </p>
          )}
        </>
      )}
      <div className="studio-size">
        <label htmlFor="studio-count">Words in your mix</label>
        <select
          id="studio-count"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          disabled={busy}
        >
          <option value={12}>12 · Quick round</option>
          <option value={24}>24 · A good mix</option>
          <option value={36}>36 · Keep it going</option>
        </select>
      </div>
      <Button
        className="primary"
        disabled={
          busy ||
          (mode === "ai" && (!available || !online || idea.trim().length < 3))
        }
        onClick={() => void makeDraft()}
      >
        {busy
          ? "Making your draft…"
          : mode === "offline"
            ? "Mix my pack"
            : "Generate AI draft"}
      </Button>
      {busy && (
        <>
          <p role="status">
            Finding words for your theme. You can cancel any time.
          </p>
          <Button onClick={() => controller.current?.abort()}>
            Cancel generation
          </Button>
        </>
      )}
      {notice && <p role="status">{notice}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {draft && (
        <div className="studio-draft">
          <h3 ref={review} tabIndex={-1}>
            Meet “{draft.pack.name}”
          </h3>
          <p>
            {draft.pack.words.length} words ·{" "}
            {draft.source === "ai"
              ? "AI draft · Review before playing"
              : "Curated offline mix"}
          </p>
          <ul className="draft-words">
            {draft.pack.words.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <Button
            disabled={
              busy ||
              (mode === "ai" &&
                (!available || !online || idea.trim().length < 3))
            }
            onClick={() => void makeDraft(true)}
          >
            Add another batch
          </Button>
          <p className="helper">
            New batches merge without duplicate words. Save more packs to grow
            your collection. AI availability depends on the connected service’s
            free limits.
          </p>
          <Button onClick={() => onUseDraft(draft.pack)}>
            <PencilSimple size={20} />
            Edit & save this draft
          </Button>
        </div>
      )}
    </section>
  );
}
