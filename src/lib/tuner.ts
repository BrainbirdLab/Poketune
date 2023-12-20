import { get } from "svelte/store";
import { selectedInstrument, pitchShiftBy } from "./store";

const chromaticNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

//list of instruments
export const instrumentNames = [
    'Guitar',
    'Bass',
    'Ukulele',
    'Chromatic'
];

export type Tuning = {
    note: string;
    octave: number;
    frequency: number;
    expectedFrequency: number;
    cent: number;
};

export function getReferenceNotes(): {[key: string]: Tuning}{

    if (get(selectedInstrument) == "Chromatic") {
        return {}
    }

    //assuming user chooses Guiter. Standard tuning is E2 A2 D3 G3 B3 E4 and shiftBy is 0
    let instrumentNotes: string[] = [];
    let instrumentOctaves: number[] = [];

    switch (get(selectedInstrument)) {
        case "Guitar":
            instrumentNotes = ["E", "A", "D", "G", "B", "E"];
            instrumentOctaves = [2, 2, 3, 3, 3, 4];
            break;
        case "Bass":
            instrumentNotes = ["E", "A", "D", "G"];
            instrumentOctaves = [1, 2, 2, 3];
            break;
        case "Ukulele":
            instrumentNotes = ["G", "C", "E", "A"];
            instrumentOctaves = [4, 4, 4, 4];
            break;
    }

    //if get(pitchShiftBy) is not 0, then we need to shift the notes and octaves
    if (get(pitchShiftBy) != 0) {
        for (let i = 0; i < instrumentNotes.length; i++) {
            const noteIndex = chromaticNotes.indexOf(instrumentNotes[i]);
            const shiftedNoteIndex = (noteIndex + get(pitchShiftBy) + (chromaticNotes.length) * 10) % chromaticNotes.length;
            instrumentNotes[i] = chromaticNotes[shiftedNoteIndex];
            instrumentOctaves[i] += Math.floor((noteIndex + get(pitchShiftBy)) / chromaticNotes.length);
        }
    }

    //return the notes and octaves along with their frequencies. E.g. {E: {Octave: 2, Frequency: 82.41}, A: {Octave: 2, Frequency: 110.00}, ...}
    const tuningKeys: {[key: string]: Tuning} = {}

    for (let i = 0; i < instrumentNotes.length; i++) {
        const note = instrumentNotes[i];
        const octave = instrumentOctaves[i];
        const frequency = getFrequency(note, octave);

        tuningKeys[note+octave] = {
            note: note,
            octave: octave,
            frequency: frequency,
            expectedFrequency: frequency,
            cent: 0,
        }
    }

    return tuningKeys;
}

export function getNote(frequency: number): Tuning {
    const noteIndex =
    Math.round((Math.log(frequency / 440) / Math.log(2)) * 12) + 57;
    const note = chromaticNotes[noteIndex % 12];
    const octave = Math.floor(noteIndex / 12);
    const expectedFrequency = 440 * Math.pow(2, (noteIndex - 57) / 12);
    const cent = Math.round(
        (1200 * Math.log(frequency / expectedFrequency)) / Math.log(2),
    );
    return {
        note: note,
        octave: octave,
        frequency: frequency,
        expectedFrequency: expectedFrequency,
        cent: cent,
    };
}

export function getFrequency(note: string, octave: number): number {
    const noteIndex = chromaticNotes.indexOf(note);
    const frequency = 440 * Math.pow(2, (noteIndex - 57 + octave * 12) / 12);
    return frequency;
}

export function tuneInstrument(pitch: number): Tuning {

    if (get(selectedInstrument) == "Chromatic") {

        const frequency = Math.round(pitch);

        if (pitch < 16.35) {
            pitch = 16.35;
        } else if (pitch > 7902.13) {
            pitch = 7902.13;
        }

        const noteIndex =
            Math.round((Math.log(pitch / 440) / Math.log(2)) * 12) + 57;
        //const noteIndex = ((Math.round(Math.log(pitch / 440) / Math.log(2) * 12) + 69) + 12) % 12;
        const note = chromaticNotes[noteIndex % 12];
        const octave = Math.floor(noteIndex / 12);
        const expectedFrequency = 440 * Math.pow(2, (noteIndex - 57) / 12);
        const cent = Math.round(
            (1200 * Math.log(frequency / expectedFrequency)) / Math.log(2),
        );

        return {
            note: note,
            octave: octave,
            frequency: frequency,
            expectedFrequency: expectedFrequency,
            cent: cent,
        };

    } else {
        const standardTuning = getReferenceNotes();
        const closestNote = getClosestNote(standardTuning, pitch);
        return closestNote;
    }

    function getClosestNote(
        standardTuning: { [key: string]: Tuning },
        pitch: number,
    ): Tuning {
        let closestNote = "";
        let diff = Infinity;

        Object.keys(standardTuning).forEach((note) => {
            //console.log(`standardTuning[{note}]: ${standardTuning[note]} - pitch: ${pitch} < diff: ${diff}`);
            //console.log(`Note: ${standardTuning[note]} - diff: ${Math.abs(standardTuning[note] - pitch)}`);
            if (Math.abs(standardTuning[note].frequency - pitch) < Math.abs(diff)) {
                diff = standardTuning[note].frequency - pitch;
                closestNote = note;
            } else if (!isFinite(diff)) {
                diff = standardTuning[note].frequency - pitch;
                closestNote = note;
            }
        });

        const cents = Math.floor(
            1200 * Math.log2(pitch / standardTuning[closestNote].frequency),
        );

        return {
            note: standardTuning[closestNote].note,
            octave: standardTuning[closestNote].octave,
            frequency: pitch,
            expectedFrequency: standardTuning[closestNote].frequency,
            cent: cents,
        };
    }
}