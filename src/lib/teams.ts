import type { GameId, GameOptions, Player, Session, Team } from "./types";

export function cleanTeams(
  teams: Team[] | undefined,
  players: Player[],
): Team[] {
  const available = new Set(players.map((p) => p.id)),
    used = new Set<string>();
  return (teams || []).slice(0, 10).map((team, i) => ({
    id: team.id || `team-${i}`,
    name: team.name.trim().slice(0, 24) || `Team ${i + 1}`,
    playerIds: team.playerIds.filter((id) => {
      if (!available.has(id) || used.has(id)) return false;
      used.add(id);
      return true;
    }),
  }));
}
export function defaultTeams(players: Player[], count = 2): Team[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i}`,
    name: `Team ${i + 1}`,
    playerIds: players.filter((_, n) => n % count === i).map((p) => p.id),
  }));
}
export function teamError(
  players: Player[],
  game: GameId,
  options: GameOptions,
) {
  if (!options.teams?.length) return "";
  const teams = cleanTeams(options.teams, players);
  if (teams.length < 2) return "Add at least two groups, or turn teams off.";
  if (teams.some((t) => t.playerIds.length === 0))
    return "Every group needs a player. Move someone into an empty group or remove it.";
  if (teams.flatMap((t) => t.playerIds).length !== players.length)
    return "Choose a group for everyone before starting.";
  if (
    game === "charades" &&
    options.charadesMode === "classic" &&
    teams.some((t) => t.playerIds.length < 2)
  )
    return "Charades needs an actor and a guesser in every team. Give each team at least two players.";
  if (new Set(teams.map((t) => t.name.toLowerCase())).size !== teams.length)
    return "Give each group a different name.";
  return "";
}
export function roundTeams(session: Session, players: Player[]) {
  return session.teams?.length ? session.teams : defaultTeams(players);
}
