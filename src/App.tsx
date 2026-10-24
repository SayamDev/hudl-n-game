import { SceneLoader } from "./components/SceneLoader";
import { motion } from "motion/react";
import { RoundRail } from "./components/AfterHours";
import Welcome from "./components/Welcome";
import { Scoreboard } from "./components/Scoreboard";
import ClubHome, { ClubLogo } from "./components/ClubHome";
import { Component, lazy, Suspense, useEffect, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import {
  GearSix,
  ArrowLeft,
  ArrowUpRight,
  ArrowRight,
  UsersThree,
  Clock,
  Plus,
  Trophy,
  Pause,
  Sun,
  Moon,
  House,
  SpeakerHigh,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useGame } from "./store/useGame";
import {
  games,
  lobbyGames,
  gameById,
  gamePresentation,
} from "./games/registry";
import { Avatar, Button, Mascot, Screen } from "./components/ui";
import { Dialog } from "./components/Dialog";
const Players = lazy(() =>
  import("./components/Setup").then((m) => ({ default: m.Players })),
);
import { t } from "./i18n/en";
import { storageUnavailable, safeStorage } from "./lib/storage";
import { silence } from "./lib/feedback";
import type { GameId } from "./lib/types";
const Preferences = lazy(() => import("./components/Preferences"));
const Packs = lazy(() => import("./components/Packs"));
const settingsComponents = Object.fromEntries(
  games.map((g) => [g.id, lazy(g.settings)]),
);
const resultsComponents = Object.fromEntries(
  games.map((g) => [g.id, lazy(g.results)]),
);
const gameComponents = Object.fromEntries(
  games.map((g) => [g.id, lazy(g.load)]),
);
type Page =
  | "home"
  | "players"
  | "game-settings"
  | "settings"
  | "packs"
  | "scores"
  | "privacy";
class GameBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Game interface error", error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <Screen
        title="We dropped the ball."
        subtitle="Your saved game is still on this device. Reload to try again."
      >
        <Button onClick={() => location.reload()}>Reload game</Button>
        <Button
          onClick={() => {
            useGame.getState().quit();
            location.reload();
          }}
        >
          Return home
        </Button>
      </Screen>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  const {
    players,
    preferences: p,
    setPreferences,
    session,
    patch,
    quit,
    start,
  } = useGame();
  const [welcome, setWelcome] = useState(
    () =>
      !safeStorage.getItem("hudl-welcome-v1") &&
      !players.length &&
      !session &&
      !location.hash.startsWith("#pack="),
  );
  const closeWelcome = () => {
    safeStorage.setItem("hudl-welcome-v1", "true");
    setWelcome(false);
  };
  const [storageError, setStorageError] = useState(storageUnavailable());
  useEffect(() => {
    const failed = () => setStorageError(true);
    addEventListener("hudl-storage-error", failed);
    return () => removeEventListener("hudl-storage-error", failed);
  }, []);
  useEffect(() => {
    const pauseWithKeyboard = (e: KeyboardEvent) => {
      const current = useGame.getState().session;
      if (
        e.key !== "Escape" ||
        e.repeat ||
        e.defaultPrevented ||
        !current ||
        current.paused ||
        current.phase === "results" ||
        document.querySelector('[aria-modal="true"]')
      )
        return;
      e.preventDefault();
      useGame.getState().patch({ paused: true });
      silence();
    };
    window.addEventListener("keydown", pauseWithKeyboard);
    return () => window.removeEventListener("keydown", pauseWithKeyboard);
  }, []);
  const [page, setPage] = useState<Page>(
    location.hash.startsWith("#pack=") ? "packs" : "home",
  );
  const [selected, setSelected] = useState<GameId>("imposter");
  const [rules, setRules] = useState<GameId | null>(null),
    [quitting, setQuitting] = useState(false),
    [online, setOnline] = useState(navigator.onLine);
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    document.documentElement.dataset.theme = p.dark ? "dark" : "light";
    document.documentElement.dataset.artDirection =
      p.deckStyle === false ? "previous" : "deck";
    document.documentElement.dataset.design =
      p.design === "classic" ? "classic" : "club";
    document.documentElement.dataset.edition =
      p.design === "club-original" ? "original" : "remix";
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        "content",
        p.design === "classic"
          ? p.dark
            ? "#211735"
            : "#f7f3ff"
          : p.dark
            ? "#151816"
            : "#f3f4ed",
      );
    document.documentElement.classList.toggle("large-text", p.largeText);
    document.documentElement.classList.toggle("high-contrast", p.contrast);
  }, [p]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    addEventListener("online", update);
    addEventListener("offline", update);
    const visibility = () => {
      if (document.hidden && useGame.getState().session) {
        useGame.getState().patch({ paused: true });
        silence();
      }
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", silence);
    return () => {
      removeEventListener("online", update);
      removeEventListener("offline", update);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", silence);
    };
  }, []);
  useEffect(() => {
    let wake: WakeLockSentinel | undefined;
    let ended = false;
    async function request() {
      try {
        if (
          session &&
          !session.paused &&
          session.phase !== "results" &&
          "wakeLock" in navigator
        ) {
          const lock = await navigator.wakeLock.request("screen");
          if (ended) await lock.release();
          else wake = lock;
        }
      } catch {
        /* Screen wake lock is a progressive enhancement. */
      }
    }
    void request();
    return () => {
      ended = true;
      void wake?.release();
    };
  }, [session?.id, session?.paused, session?.phase]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const h = document.querySelector<HTMLElement>("main h1");
    h?.focus({ preventScroll: true });
  }, [page, session?.phase]);
  const choose = (id: GameId) => {
    setSelected(id);
    setPage("players");
  };
  const home = () => {
    quit();
    silence();
    setPage("home");
  };
  const active = !!session && session.phase !== "results";
  const Game = session ? gameComponents[session.game] : null;
  const GameSettings = settingsComponents[selected];
  const Results = session
    ? resultsComponents[session.game]
    : resultsComponents[selected];
  return (
    <GameBoundary>
      <a className="skip-link" href="#main">
        Skip to game
      </a>
      <div
        className={`app-shell ${active ? "is-playing" : ""} ${page === "home" && !session ? "is-home" : ""}`}
      >
        <header className="site-header">
          <button
            className="brand"
            aria-label="hudl n game home"
            onClick={() => (active ? setQuitting(true) : home())}
          >
            {p.design !== "classic" ? (
              <ClubLogo />
            ) : (
              <>
                <span className="brand-mark" aria-hidden="true">
                  h<span>n</span>
                </span>
                <span>
                  hudl <span className="brand-n">n</span> game
                  <span className="brand-spark" aria-hidden="true">
                    ✳
                  </span>
                </span>
              </>
            )}
          </button>
          <div className="header-actions">
            {active ? (
              <button
                className="icon-button"
                aria-label="Pause game"
                onClick={() => {
                  patch({ paused: true });
                  silence();
                }}
              >
                <Pause size={25} weight="bold" />
              </button>
            ) : (
              <>
                <button
                  className="icon-button theme-button"
                  aria-label={
                    p.dark ? "Switch to light mode" : "Switch to dark mode"
                  }
                  onClick={() => setPreferences({ dark: !p.dark })}
                >
                  {p.dark ? <Sun size={24} /> : <Moon size={24} />}
                </button>
                <button
                  className="icon-button"
                  aria-label="Settings"
                  onClick={() => setPage("settings")}
                >
                  <GearSix size={26} weight="bold" />
                </button>
              </>
            )}
          </div>
        </header>
        {!session && page !== "home" && (
          <div className="back-row">
            <button
              onClick={() =>
                setPage(page === "game-settings" ? "players" : "home")
              }
            >
              <ArrowLeft size={20} />
              {page === "game-settings" ? "Your crew" : "Back to the party"}
            </button>
          </div>
        )}
        {storageError && (
          <p className="error" role="alert">
            This browser cannot save your party. You can play, but a refresh may
            lose progress. Free some browser storage or use a regular browser
            window.
          </p>
        )}
        <main
          id="main"
          data-game={
            session?.game || (page === "game-settings" ? selected : undefined)
          }
          data-phase={session?.phase}
          data-play-style={
            session?.options.charadesMode ||
            useGame.getState().options.charadesMode
          }
          data-page={page}
        >
          {session &&
            session.game === "imposter" &&
            session.phase !== "results" &&
            p.design === "club" &&
            p.deckStyle !== false && <RoundRail phase={session.phase} />}
          <Suspense fallback={<SceneLoader />}>
            {session ? (
              session.phase === "results" ? (
                <Results
                  session={session}
                  onHome={home}
                  onPlayers={() => {
                    setSelected(session.game);
                    quit();
                    setPage("players");
                  }}
                />
              ) : (
                <>{Game && <Game session={session} />}</>
              )
            ) : page === "home" ? (
              p.design !== "classic" ? (
                <ClubHome
                  choose={choose}
                  rules={setRules}
                  crew={() => setPage("players")}
                />
              ) : (
                <>
                  <section className="home-intro">
                    <div>
                      <h1 tabIndex={-1}>
                        Less scrolling.
                        <br />
                        <span>More shenanigans.</span>
                      </h1>
                      <p>{t("tagline")}</p>
                    </div>
                    <div className="mascot-wrap">
                      <span className="mascot-spark">✦</span>
                      <Mascot />
                      <span className="mascot-caption">
                        your chaos coordinator
                      </span>
                    </div>
                  </section>
                  <section className="game-shelf" aria-labelledby="pick-game">
                    <div className="shelf-heading">
                      <h2 id="pick-game">Pick your kind of chaos</h2>
                      <span>5 games. Zero awkward small talk.</span>
                    </div>
                    <div className="games-grid">
                      {lobbyGames.map((g, i) => (
                        <article
                          key={g.lobbyKey}
                          className={`game-card ${g.color} ${i === 0 ? "featured" : ""}`}
                        >
                          <div className="game-card-copy">
                            <div className="game-meta">
                              <span>
                                <UsersThree size={17} />
                                {g.min}-20
                              </span>
                              <span>
                                <Clock size={17} />
                                {g.duration}
                              </span>
                            </div>
                            <h3>{g.name}</h3>
                            <p>{g.subtitle}</p>
                            <div className="card-actions">
                              <button
                                className="play-game"
                                onClick={() => {
                                  if (g.charadesMode)
                                    useGame.getState().setOptions({
                                      charadesMode: g.charadesMode,
                                    });
                                  choose(g.id);
                                }}
                              >
                                {t("play")}
                                <ArrowUpRight size={21} weight="bold" />
                              </button>
                              <button
                                className="rules-link"
                                onClick={() => {
                                  if (g.charadesMode)
                                    useGame.getState().setOptions({
                                      charadesMode: g.charadesMode,
                                    });
                                  setRules(g.id);
                                }}
                                aria-label={`How to play ${g.name}`}
                              >
                                How to play
                              </button>
                            </div>
                          </div>
                          <div
                            className={`game-art art-${g.id}`}
                            aria-hidden="true"
                          >
                            {g.id === "imposter" ? (
                              <>
                                <div className="suspect-card card-back">?</div>
                                <div className="suspect-card card-front">
                                  <span className="eyes">👀</span>
                                  <b>WHO, ME?</b>
                                </div>
                                <span className="art-spark">✦</span>
                              </>
                            ) : (
                              <span className="game-emoji">{g.emoji}</span>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                  <section className="crew-strip">
                    <div className="mini-crew">
                      {players.length ? (
                        players
                          .slice(0, 4)
                          .map((pl) => <Avatar key={pl.id} player={pl} />)
                      ) : (
                        <>
                          <span>🐸</span>
                          <span>🦊</span>
                          <span>🐼</span>
                        </>
                      )}
                    </div>
                    <div>
                      <h2>
                        {players.length
                          ? "Your crew is remembered."
                          : "Good people. Questionable alibis."}
                      </h2>
                      <p>
                        {players.length
                          ? `${players.length} players ready for another round.`
                          : "Bring 3 or more friends. We’ll bring the games."}
                      </p>
                    </div>
                    <Button onClick={() => setPage("players")}>
                      {players.length ? "Edit crew" : "Add your crew"}
                      <Plus size={19} />
                    </Button>
                  </section>
                  <div className="home-tools">
                    <button onClick={() => setPage("packs")}>
                      <Plus size={22} />
                      <span>Create a word pack</span>
                      <ArrowRight size={20} />
                    </button>
                    <button onClick={() => setPage("scores")}>
                      <Trophy size={22} />
                      <span>The bragging board</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </>
              )
            ) : page === "players" ? (
              <Players
                game={selected}
                onNext={() => setPage("game-settings")}
              />
            ) : page === "game-settings" ? (
              <GameSettings
                game={selected}
                onStart={() => start(selected)}
                onPlayers={() => setPage("players")}
              />
            ) : page === "settings" ? (
              <Preferences />
            ) : page === "packs" ? (
              <Packs />
            ) : page === "scores" ? (
              <Screen
                title="The bragging board."
                subtitle="Points stay on this device until you reset them."
              >
                {players.length ? (
                  <div className="score-board-banner">
                    <Trophy size={52} weight="fill" />
                    <div>
                      <strong>
                        {players.some((p) => p.score > 0)
                          ? "Let the points do the talking."
                          : "A clean slate. A loud night."}
                      </strong>
                      <p>
                        {players.some((p) => p.score > 0)
                          ? "Same score? Share the spotlight."
                          : "Play a round to start the rivalry."}
                      </p>
                    </div>
                  </div>
                ) : null}
                {players.length ? (
                  <Scoreboard players={players} />
                ) : (
                  <p>No scores yet. Your first game starts the story.</p>
                )}
                <Button className="primary" onClick={() => setPage("home")}>
                  Pick a game
                </Button>
              </Screen>
            ) : (
              <Screen title="Your party is your business.">
                <ShieldCheck size={54} weight="duotone" />
                <h2>Your game stays with you.</h2>
                <p>
                  No accounts, ads, analytics, or tracking cookies. Names, game
                  progress, settings, and custom packs stay in this browser’s
                  local storage.
                </p>
                <p>
                  Offline mixes stay on this device. If you choose Generate AI
                  draft, only the theme you enter and the requested pack size go
                  to Groq through this app’s server. Crew names and game history
                  are not sent. Avoid private details and review generated words
                  before saving. Temporary request counters help keep generation
                  within the free allowance.
                </p>
                <p>
                  Shared pack links contain the pack’s name and words. Anyone
                  with the link can read them. Only share content you want
                  others to see.
                </p>
                <p>
                  Optional narration uses bundled voice recordings, available
                  offline after caching. It does not record your microphone.
                  Text instructions always work without sound.
                </p>
                <h2>Artwork &amp; type</h2>
                <p>
                  Alibi emblems by Delapouite, Lorc and DarkZaitzev from{" "}
                  <a
                    href="https://game-icons.net/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Game-icons.net
                  </a>
                  , used under{" "}
                  <a
                    href="https://creativecommons.org/licenses/by/3.0/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    CC BY 3.0
                  </a>
                  , with original framing. The original illustrated deck was
                  generated for Hudl n game using 12ui; the character cast and
                  game-world scenes were generated for this project using OpenAI
                  image generation. Bebas Neue by Ryoichi Tsunekawa is licensed
                  under the SIL Open Font License.
                </p>
                <p>
                  The hosting provider receives ordinary website requests. Once
                  the app says “Offline ready”, installed assets let you play
                  without a connection.
                </p>
                <Button onClick={() => setPage("home")}>
                  Back to the party
                </Button>
              </Screen>
            )}
          </Suspense>
        </main>
        {!session && p.design !== "classic" && (
          <nav className="club-nav" aria-label="Main navigation">
            {(
              [
                ["home", "Games", House],
                ["players", "Crew", UsersThree],
                ["packs", "Packs", Plus],
                ["scores", "Scores", Trophy],
              ] as const
            ).map(([destination, label, Icon]) => (
              <button
                key={destination}
                aria-current={page === destination ? "page" : undefined}
                onClick={() => setPage(destination)}
              >
                {page === destination &&
                  p.deckStyle !== false &&
                  p.design === "club" && (
                    <motion.span
                      className="night-nav-indicator"
                      layoutId="lobby-nav"
                      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                      aria-hidden="true"
                    />
                  )}
                <Icon
                  size={23}
                  weight={page === destination ? "fill" : "regular"}
                />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
        {!active && (
          <footer>
            <span>© {new Date().getFullYear()} Sayam</span>
            <span>
              <ShieldCheck size={17} />
              Free. No ads. No accounts.
            </span>
            <button onClick={() => setWelcome(true)}>How it works</button>
            <button onClick={() => setPage("privacy")}>Privacy</button>
            <span className="offline-status">
              {offlineReady
                ? "Offline ready"
                : !online
                  ? "You’re offline"
                  : "Made for being together"}
            </span>
          </footer>
        )}
        {needRefresh && !active && (
          <div className="update-notice">
            <span>A fresh version is ready.</span>
            <Button onClick={() => void updateServiceWorker(true)}>
              Update now
            </Button>
          </div>
        )}
        {welcome && !active && (
          <Welcome
            onClose={closeWelcome}
            onStart={() => {
              closeWelcome();
              setSelected("imposter");
              setPage("players");
            }}
          />
        )}
        {rules && (
          <div className="modal-backdrop">
            <Dialog label="rules-title" onClose={() => setRules(null)}>
              <h2 id="rules-title">
                How to play{" "}
                {
                  gamePresentation(
                    rules,
                    useGame.getState().options.charadesMode,
                  ).name
                }
              </h2>
              <ol>
                {gamePresentation(
                  rules,
                  useGame.getState().options.charadesMode,
                ).rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
              <Button
                autoFocus
                className="primary"
                onClick={() => setRules(null)}
              >
                Got it
              </Button>
            </Dialog>
          </div>
        )}
        {session?.paused && active && (
          <div className="modal-backdrop">
            <Dialog
              label="pause-title"
              onClose={() => patch({ paused: false })}
            >
              <h2 id="pause-title">Chaos, on hold.</h2>
              <p>Your game is safe. Pass the phone before resuming.</p>
              <Button
                autoFocus
                className="primary"
                onClick={() => patch({ paused: false })}
              >
                {t("resume")}
              </Button>
              <details>
                <summary>Rules reminder</summary>
                <ol>
                  {gamePresentation(
                    session.game,
                    session.options.charadesMode,
                  ).rules.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ol>
              </details>
              <Button onClick={() => setPreferences({ sound: !p.sound })}>
                <SpeakerHigh size={20} />
                Sound {p.sound ? "on" : "off"}
              </Button>
              <Button className="text-button" onClick={() => setQuitting(true)}>
                Leave this game
              </Button>
            </Dialog>
          </div>
        )}
        {quitting && (
          <div className="modal-backdrop quit-layer">
            <Dialog label="quit-title" alert onClose={() => setQuitting(false)}>
              <h2 id="quit-title">Leave this round?</h2>
              <p>
                The current round will end. Your crew and previous scores stay.
              </p>
              <Button
                autoFocus
                className="primary"
                onClick={() => setQuitting(false)}
              >
                Keep playing
              </Button>
              <Button
                onClick={() => {
                  setQuitting(false);
                  home();
                }}
              >
                <House size={20} />
                Leave round
              </Button>
            </Dialog>
          </div>
        )}
      </div>
    </GameBoundary>
  );
}
