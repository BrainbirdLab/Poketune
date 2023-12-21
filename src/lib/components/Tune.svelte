<script lang="ts">
    const chromaticNotes = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B",
    ];

    enum INSTRUMENT {
        GUITAR,
        BASS,
        UKULELE,
        CHROMATIC,
    }

    function tuneInstrument(instrument: INSTRUMENT, pitch: number) {
        const standardGuiterTuning: { [key: string]: number } = {
            E2: 82.41,
            A2: 110.0,
            D3: 146.83,
            G3: 196.0,
            B3: 246.94,
            E4: 329.63,
        };

        const standardBassTuning: { [key: string]: number } = {
            E1: 41.2,
            A1: 55.0,
            D2: 73.42,
            G2: 98.0,
            B2: 123.47,
            E3: 164.81,
        };

        const standardUkuleleTuning: { [key: string]: number } = {
            G4: 392.0,
            C4: 261.63,
            E4: 329.63,
            A4: 440.0,
        };

        if (instrument == INSTRUMENT.GUITAR) {
            console.log(getClosestNote(standardGuiterTuning, pitch));
        } else if (instrument == INSTRUMENT.BASS) {
            console.log(getClosestNote(standardBassTuning, pitch));
        } else if (instrument == INSTRUMENT.UKULELE) {
            console.log(getClosestNote(standardUkuleleTuning, pitch));
        } else if (instrument == INSTRUMENT.CHROMATIC) {

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
            console.log(noteIndex % 12);
            const octave = Math.floor(noteIndex / 12);
            const expectedFrequency = 440 * Math.pow(2, (noteIndex - 57) / 12);
            const cent = Math.round(
                (1200 * Math.log(frequency / expectedFrequency)) / Math.log(2),
            );
        }

        function getClosestNote(
            standardTuning: { [key: string]: number },
            pitch: number,
        ) {
            let closestNote = "";
            let diff = 1000000;

            Object.keys(standardTuning).forEach((note) => {
                //console.log(`standardTuning[{note}]: ${standardTuning[note]} - pitch: ${pitch} < diff: ${diff}`);
                //console.log(`Note: ${standardTuning[note]} - diff: ${Math.abs(standardTuning[note] - pitch)}`);
                if (Math.abs(standardTuning[note] - pitch) < Math.abs(diff)) {
                    diff = standardTuning[note] - pitch;
                    closestNote = note;
                }
            });

            let cents = Math.floor(
                1200 * Math.log2(pitch / standardTuning[closestNote]),
            );

            return {
                note: closestNote,
                cents: cents,
            };
        }
    }

    tuneInstrument(INSTRUMENT.CHROMATIC, 1000.32);
</script>
