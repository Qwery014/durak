import { typeCard } from "./consts";
import { interfaceInGame } from "./types";

export function getCardSign(str: string, reverse?: boolean): string {
  if (!reverse) {
    return str.split(" ").slice(0, 1)[0];
  } else {
    return str.split(" ").reverse().slice(0, 1)[0];
  }
}