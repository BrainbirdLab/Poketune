import { writable, type Writable } from "svelte/store";

export const selectedInstrument: Writable<"Guitar" | "Bass" | "Ukulele" | "Chromatic" | "None"> = writable("Chromatic");