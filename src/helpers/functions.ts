import { typeCard } from "./consts";
import { interfaceInGame } from "./types";

export function getCardSign(str: string): string {
  return str.split(" ").slice(0, 1)[0];
}