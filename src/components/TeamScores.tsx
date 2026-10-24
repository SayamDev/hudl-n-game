import type { Player, Team } from "../lib/types";
export function TeamScores({
  players,
  teams,
}: {
  players: Player[];
  teams?: Team[];
}) {
  if (!teams?.length) return null;
  return (
    <section className="team-scores" aria-label="Group totals">
      <h2>Better together.</h2>
      <p>Combined player points. Individual scores stay below.</p>
      <div role="list" aria-label="Team scores">
        {teams
          .map((team) => ({
            team,
            members: players.filter((p) => team.playerIds.includes(p.id)),
          }))
          .map(({ team, members }) => ({
            team,
            members,
            score: members.reduce((n, p) => n + p.score, 0),
          }))
          .sort((a, b) => b.score - a.score)
          .map(({ team, members, score }) => (
            <div key={team.id} role="listitem">
              <div>
                <strong>{team.name}</strong>
                <span>{members.map((p) => p.name).join(" + ")}</span>
              </div>
              <b>
                {score}
                <small>pts</small>
              </b>
            </div>
          ))}
      </div>
    </section>
  );
}
