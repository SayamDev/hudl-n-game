import { Scoreboard } from "./Scoreboard";
import { WinnerArtwork } from "./WinnerArtwork";
import { Identity } from "./Identity";
import { useEffect, useRef, useState } from "react";
import { useGame } from "../store/useGame";
import { Button, Screen, Mascot } from "./ui";
import { feedback } from "../lib/feedback";
import type { Session } from "../lib/types";
export default function Results({
  session,
  onHome,
  onPlayers,
}: {
  session: Session;
  onHome: () => void;
  onPlayers: () => void;
}) {
  const { players, preferences } = useGame();
  const remix =
    preferences.design !== "classic" && preferences.design !== "club-original";
  const refined = remix && preferences.deckStyle !== false;
  const [animated, setAnimated] = useState(false);
  const animation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    feedback("success");
    if (refined) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let disposed = false;
    let player: { destroy: () => void } | undefined;
    void import("canvas-confetti").then(({ default: confetti }) => {
      if (!disposed)
        void confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.65 },
          disableForReducedMotion: true,
          colors: remix
            ? ["#d4fa77", "#dacdeb", "#c9e4d7", "#f0d0b3"]
            : ["#7C3AED", "#FFD60A", "#2EE6A6", "#FF3D8B"],
        });
    });
    void Promise.all([
      import("lottie-web/build/player/lottie_light"),
      fetch(
        `${import.meta.env.BASE_URL}projects/hudl/scene-${remix ? 2 : 1}/lottie.json`,
      ).then((r) => r.json()),
    ])
      .then(([{ default: lottie }, data]) => {
        if (!disposed && animation.current) {
          setAnimated(true);
          player = lottie.loadAnimation({
            container: animation.current,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData: data,
          });
        }
      })
      .catch(() => {});
    return () => {
      disposed = true;
      player?.destroy();
    };
  }, []);
  return (
    <Screen
      className="results-stage"
      title={session.result}
      subtitle="Same friends. New bragging rights."
    >
      {refined ? (
        <WinnerArtwork
          players={players.filter((p) => session.winners.includes(p.id))}
        />
      ) : (
        <div className="win-animation" aria-hidden="true">
          {!animated &&
            (remix ? <Identity seed="🐸" /> : <Mascot mood="win" />)}
          <div ref={animation} />
        </div>
      )}
      {["imposter", "spy"].includes(session.game) && (
        <p className="answer">
          The secret was <strong>{session.secret}</strong>.
        </p>
      )}
      {session.game === "secret-hitler" && session.parliament && (
        <details open>
          <summary>Secret roles revealed</summary>
          <ul>
            {players.map((p) => (
              <li key={p.id}>
                {p.name} · {session.parliament!.roles[p.id]}
              </li>
            ))}
          </ul>
        </details>
      )}
      <Scoreboard
        players={players}
        winners={session.winners}
        points={session.options.points}
      />
      {session.history.length > 0 && (
        <details>
          <summary>Round recap</summary>
          <ol>
            {session.history.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ol>
        </details>
      )}
      <Button className="primary" onClick={onPlayers}>
        Play again
      </Button>
      <Button onClick={onHome}>Next game</Button>
    </Screen>
  );
}
