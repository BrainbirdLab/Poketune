import { writable, type Writable } from "svelte/store";

export const selectedInstrument: Writable<"Guitar" | "Bass" | "Ukulele" | "Chromatic" | "Metronome" | "None"> = writable("None");
export const pitchShiftBy: Writable<number> = writable(0);