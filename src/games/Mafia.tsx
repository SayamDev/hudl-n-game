import narration from "../content/narration.json";
import { useState } from "react";
import { useGame } from "../store/useGame";
import { mafiaWinner, resolveNight } from "../lib/logic";
import {
  Avatar,
  Button,
  Narration,
  Peek,
  Screen,
  Timer,
} from "../components/ui";
import { PrivateMessage } from "../components/PrivateMessage";
import { Vote } from "../components/Vote";
import type { GameProps } from "../lib/types";
const roleOrder = ["Mafia", "Doctor", "Detective", "Bodyguard", "Vigilante"];
export default function Mafia({ session: s }: GameProps) {
  const { players, patch, finish } = useGame();
  const [selected, setSelected] = useState(""),
    [privateResult, setPrivateResult] = useState("");
  const living = players.filter((p) => s.alive.includes(p.id));
  const winner = (alive: string[]) => {
    const win = mafiaWinner(alive, s.roles);
    if (win)
      finish(
        `${win} wins!`,
        players
          .filter((p) =>
            win === "Mafia"
              ? s.roles[p.id] === "Mafia"
              : !["Mafia", "Jester"].includes(s.roles[p.id]),
          )
          .map((p) => p.id),
      );
    return !!win;
  };
  const nextNightRole = (current?: string, night = s.night) => {
    setSelected("");
    setPrivateResult("");
    const roles = roleOrder.filter(
      (r) =>
        living.some((p) => s.roles[p.id] === r) &&
        !(
          r === "Vigilante" &&
          s.history.some((h) => h.includes("Vigilante fired"))
        ),
    );
    const next = current ? roles[roles.indexOf(current) + 1] : roles[0];
    if (next) patch({ phase: `night-cover:${next}`, night });
    else {
      const dead = resolveNight(s.alive, s.roles, night),
        alive = s.alive.filter((id) => !dead.includes(id));
      const line = dead.length
        ? `Night ${s.round}: ${dead.map((id) => players.find((p) => p.id === id)?.name).join(" and ")} left the village.`
        : `Night ${s.round}: Everyone survived.`;
      patch({
        phase: "dawn",
        alive,
        night,
        history: [
          ...s.history,
          line,
          ...(night.Vigilante ? ["The Vigilante fired their one shot."] : []),
        ],
      });
    }
  };
  if (s.phase === "peek")
    return (
      <Peek
        key={s.peekIndex}
        session={s}
        onDone={() => patch({ phase: "night" })}
      />
    );
  if (s.phase === "night")
    return (
      <Screen title={`Night ${s.round}`}>
        <Narration
          manual={s.options.manual}
          text="Everyone, close your eyes. Keep the phone in the middle. Only the role called may look at the screen."
        />
        <p className="helper">
          Keep device sounds low. Role players pass the phone discreetly. Manual
          mode lets a human read the script.
        </p>
        <Button className="primary" onClick={() => nextNightRole()}>
          Begin night
        </Button>
      </Screen>
    );
  if (s.phase.startsWith("night-cover:")) {
    const role = s.phase.split(":")[1];
    return (
      <Screen title="Eyes closed, village.">
        <Narration
          manual={s.options.manual}
          text={`${role}, open your eyes. Take the phone and choose your action. Everyone else, keep your eyes closed.`}
        />
        <Button
          className="primary"
          onClick={() => patch({ phase: `night-action:${role}` })}
        >
          {role} is ready
        </Button>
      </Screen>
    );
  }
  if (s.phase.startsWith("night-action:")) {
    const role = s.phase.split(":")[1];
    const action =
      role === "Mafia"
        ? "Choose a victim together"
        : role === "Doctor"
          ? "Choose someone to save"
          : role === "Detective"
            ? "Choose someone to investigate"
            : role === "Bodyguard"
              ? "Choose someone to protect"
              : "Choose your one-shot target";
    const targets = living.filter((p) =>
      role === "Mafia"
        ? s.roles[p.id] !== "Mafia"
        : role === "Detective" || role === "Bodyguard" || role === "Vigilante"
          ? s.roles[p.id] !== role
          : true,
    );
    return (
      <Screen
        title={privateResult ? "Detective’s finding" : action}
        subtitle={
          role === "Mafia"
            ? "All living Mafia must agree before confirming."
            : undefined
        }
      >
        {privateResult ? (
          <>
            <PrivateMessage message={privateResult} />
            <Button className="primary" onClick={() => nextNightRole(role)}>
              Hide result & close eyes
            </Button>
          </>
        ) : (
          <>
            <div className="player-options">
              {targets.map((p) => (
                <button
                  key={p.id}
                  className={`player-option ${selected === p.id ? "selected" : ""}`}
                  aria-pressed={selected === p.id}
                  onClick={() => setSelected(p.id)}
                >
                  <Avatar player={p} />
                  {p.name}
                </button>
              ))}
            </div>
            <Button
              className="primary"
              disabled={!selected}
              onClick={() => {
                if (role === "Detective") {
                  setPrivateResult(
                    `${players.find((p) => p.id === selected)?.name} is ${s.roles[selected] === "Mafia" ? "Mafia" : "not Mafia"}.`,
                  );
                } else nextNightRole(role, { ...s.night, [role]: selected });
              }}
            >
              Confirm {role === "Mafia" ? "team choice" : "choice"}
            </Button>
            {role === "Vigilante" && (
              <Button onClick={() => nextNightRole(role)}>Save my shot</Button>
            )}
          </>
        )}
      </Screen>
    );
  }
  if (s.phase === "dawn")
    return (
      <Screen title="Good morning…">
        <Narration manual={s.options.manual} text={narration.dawn} />
        <p className="night-report">
          {s.history.filter((h) => h.startsWith("Night")).at(-1) ||
            "The village wakes."}
        </p>
        {s.options.showRoles &&
          s.history.filter((h) => h.startsWith("Night")).at(-1) && (
            <p>
              Eliminated roles:{" "}
              {players
                .filter((p) => !s.alive.includes(p.id))
                .map((p) => `${p.name}: ${s.roles[p.id]}`)
                .join(", ") || "None"}
            </p>
          )}
        <Button
          className="primary"
          onClick={() => {
            if (!winner(s.alive))
              patch({
                phase: "discuss",
                timerRemaining: s.options.seconds,
                timerRunning: s.options.seconds !== 0,
              });
          }}
        >
          Gather the village
        </Button>
      </Screen>
    );
  if (s.phase === "discuss")
    return (
      <Screen
        title="Someone knows something."
        subtitle={`${living.length} villagers remain. Discuss, accuse, defend.`}
      >
        <Timer session={s} />
        <Button
          className="primary"
          onClick={() =>
            patch({
              phase: "vote",
              votes: {},
              voterIndex: 0,
              timerRunning: false,
            })
          }
        >
          Vote someone out
        </Button>
      </Screen>
    );
  if (s.phase === "vote")
    return (
      <Vote
        session={s}
        onResult={(id) => {
          const p = players.find((p) => p.id === id)!;
          const alive = s.alive.filter((a) => a !== id);
          patch({
            alive,
            accused: id,
            phase: "eliminated",
            history: [...s.history, `Day ${s.round}: ${p.name} was voted out.`],
          });
        }}
      />
    );
  if (s.phase === "eliminated") {
    const p = players.find((p) => p.id === s.accused)!;
    return (
      <Screen
        title={`${p.name} leaves the village.`}
        subtitle={
          s.options.showRoles
            ? `Their role was ${s.roles[p.id]}.`
            : "Their role stays a secret."
        }
      >
        <div className="center">
          <Avatar player={p} big />
        </div>
        <Button
          className="primary"
          onClick={() => {
            if (s.roles[p.id] === "Jester")
              finish("The Jester got their wish!", [p.id]);
            else if (!winner(s.alive))
              patch({ phase: "night", round: s.round + 1, night: {} });
          }}
        >
          Continue
        </Button>
      </Screen>
    );
  }
  return null;
}
