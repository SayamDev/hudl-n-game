import { shuffle } from "./logic";

// Recent values are oldest first. Random ties preserve surprise; unseen values lead.
export function freshOrder(
  values: string[],
  recent: string[] = [],
  random = Math.random,
) {
  const unique = [
    ...new Map(
      values.map((value) => [value.trim().toLocaleLowerCase(), value]),
    ).values(),
  ];
  const rank = new Map(
    recent.map((value, index) => [value.trim().toLocaleLowerCase(), index]),
  );
  return shuffle(unique, random).sort(
    (a, b) =>
      (rank.get(a.trim().toLocaleLowerCase()) ?? -1) -
      (rank.get(b.trim().toLocaleLowerCase()) ?? -1),
  );
}
export function remember(recent: string[] = [], values: string[]) {
  const keys = new Set(values.map((value) => value.trim().toLocaleLowerCase()));
  return [
    ...recent.filter((value) => !keys.has(value.trim().toLocaleLowerCase())),
    ...values,
  ].slice(-2000);
}
