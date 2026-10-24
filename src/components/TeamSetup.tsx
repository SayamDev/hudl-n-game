import { UsersThree, Plus, X } from "@phosphor-icons/react";
import { useGame } from "../store/useGame";
import { cleanTeams, defaultTeams, teamError } from "../lib/teams";
import type { GameId, Team } from "../lib/types";

export function TeamSetup({ game }: { game: GameId }) {
  const { players, options, setOptions } = useGame();
  const teams = options.teams || [];
  const save = (next: Team[]) =>
    setOptions({ teams: next.length ? next : undefined });
  const error = teamError(players, game, options);
  return (
    <section className="team-setup" aria-labelledby="teams-heading">
      <div className="team-heading">
        <UsersThree size={26} aria-hidden="true" />
        <h2 id="teams-heading">Your people. Your teams.</h2>
      </div>
      <p>
        {game === "charades"
          ? "Choose who plays together and name your teams. Otherwise, we’ll alternate the crew list."
          : "Pair up or choose your own groups. Secret roles and game rules stay the same; we’ll also show your combined points."}
      </p>
      {!teams.length ? (
        <button className="button" onClick={() => save(defaultTeams(players))}>
          Choose teams
        </button>
      ) : (
        <>
          <div className="team-names">
            {teams.map((team, i) => (
              <div className="team-name" key={team.id}>
                <label>
                  Group {i + 1}
                  <input
                    aria-label={`Name of group ${i + 1}`}
                    value={team.name}
                    maxLength={24}
                    onChange={(e) =>
                      save(
                        teams.map((t) =>
                          t.id === team.id ? { ...t, name: e.target.value } : t,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  aria-label={`Remove group ${i + 1}`}
                  className="icon-button"
                  disabled={teams.length <= 2}
                  onClick={() => {
                    const remaining = teams.filter((t) => t.id !== team.id);
                    save(
                      remaining.map((t, j) =>
                        j === 0
                          ? {
                              ...t,
                              playerIds: [...t.playerIds, ...team.playerIds],
                            }
                          : t,
                      ),
                    );
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="team-members">
            {players.map((player) => (
              <label key={player.id}>
                <span>{player.name}</span>
                <select
                  aria-label={`Group for ${player.name}`}
                  value={
                    teams.find((t) => t.playerIds.includes(player.id))?.id || ""
                  }
                  onChange={(e) =>
                    save(
                      teams.map((t) => ({
                        ...t,
                        playerIds:
                          t.id === e.target.value
                            ? [
                                ...t.playerIds.filter((id) => id !== player.id),
                                player.id,
                              ]
                            : t.playerIds.filter((id) => id !== player.id),
                      })),
                    )
                  }
                >
                  <option value="" disabled>
                    Choose a group
                  </option>
                  {teams.map((team, i) => (
                    <option key={team.id} value={team.id}>
                      {team.name || `Group ${i + 1}`}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <div className="team-tools">
            <button
              className="button"
              disabled={teams.length >= Math.min(10, players.length)}
              onClick={() =>
                save([
                  ...teams,
                  {
                    id: crypto.randomUUID(),
                    name: `Team ${teams.length + 1}`,
                    playerIds: [],
                  },
                ])
              }
            >
              <Plus size={18} />
              Add group
            </button>
            <button className="button text-button" onClick={() => save([])}>
              {game === "charades" ? "Use default teams" : "Play individually"}
            </button>
          </div>
          {error && (
            <p className="error" role="status">
              {error}
            </p>
          )}
          {!error && (
            <p className="team-ready">
              {cleanTeams(teams, players)
                .map((t) => `${t.name} · ${t.playerIds.length}`)
                .join(" / ")}
            </p>
          )}
        </>
      )}
    </section>
  );
}
