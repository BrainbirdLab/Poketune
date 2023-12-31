import { writable, type Writable } from "svelte/store";

export type InstrumentTypes = "Guitar" | "Bass" | "Ukulele" | "Chromatic" | "Metronome" | "Frequency" | "none";

export const selectedInstrument: Writable<InstrumentTypes> = writable("none");

export function sentenceCase(str: string) {
    //lower case everything
    str = str.toLowerCase();
    //uppercase first letter of each word
    str = str.replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
    });

    return str;
}

export const lastPage: Writable<string> = writable("");

//list of instruments
export const instrumentNames = [
    'Guitar',
    'Bass',
    'Ukulele',
    'Chromatic',
    'Metronome',
    'Frequency',
];