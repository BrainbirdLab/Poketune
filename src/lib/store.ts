import { writable, type Writable } from "svelte/store";

export type InstrumentTypes = "guitar" | "bass" | "ukulele" | "chromatic" | "metronome" | "none";

export const selectedInstrument: Writable<InstrumentTypes> = writable("none");
export const pitchShiftBy: Writable<number> = writable(0);

export function sentenceCase(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}