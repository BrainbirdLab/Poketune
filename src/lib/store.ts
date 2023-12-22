import { writable, type Writable } from "svelte/store";
import { instrumentNames } from "./tuner";

export type InstrumentTypes = "Guitar" | "Bass" | "Ukulele" | "Chromatic" | "Metronome" | "None";

export const selectedInstrument: Writable<InstrumentTypes> = writable("None");
export const pitchShiftBy: Writable<number> = writable(0);