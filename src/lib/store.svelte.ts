export type InstrumentTypes = "Guitar" | "Bass" | "Ukulele" | "Chromatic" | "Metronome" | "Frequency" | "none";

export const selectedInstrument = ref<InstrumentTypes>("none");

export function sentenceCase(str: string) {
    //lower case everything
    str = str.toLowerCase();
    //uppercase first letter of each word
    str = str.replace(/\b[a-z]/g, function (letter) {
        return letter.toUpperCase();
    });

    return str;
}

export const lastPage = ref("");

//list of instruments
export const instrumentNames = [
    'Guitar',
    'Bass',
    'Ukulele',
    'Chromatic',
    'Metronome',
    'Frequency',
];

export const activateWakeLock = ref(false);

export function ref<T>(value: T) {
    let val = $state(value);
    return {
        set value(newVal: T) {
            val = newVal;
        },
        get value() {
            return val;
        }
    }
}