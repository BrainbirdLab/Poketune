<script lang="ts">
    import { confetti } from "@neoconfetti/svelte";
    import { activateWakeLock, selectedInstrument, type InstrumentTypes } from "$lib/store.svelte";
    import {
        type Tuning,
        getReferenceNotes,
        tuneInstrument,
        getFrequency,
    } from "$lib/tuner";
    import { PitchDetector } from "pitchy";
    import { onDestroy, onMount } from "svelte";
    import { fade, fly } from "svelte/transition";
    import Range from "./controls/Range.svelte";
    import WaveCanvas from "./waveCanvas.svelte";
    import { tweened } from "svelte/motion";
    import Logo from "$lib/components/logo.svelte";
    import { showToastMessage } from "@itsfuad/domtoastmessage";

    //load audio
    let correctNoteSound: HTMLAudioElement;
    let allDoneSound: HTMLAudioElement;

    let Octave: number = $state(0);
    let Note: string = $state("");

    let isListening = $state(false);

    let audioContext: AudioContext;

    let tunedNotes = $state(new Set<string>());

    const Cent = tweened(0, { duration: 100 });
    const Frequency = tweened(0, { duration: 100 });
    const detectedClarity = tweened(0, { duration: 100 });

    let analyserNode: AnalyserNode = $state() as AnalyserNode;

    let stream: MediaStream;

    let interval: number;

    let pitchShiftBy = $state(0);

    let notes: { [key: string]: Tuning } = $derived(getReferenceNotes(selectedInstrument.value, pitchShiftBy));
 
    let leftNotes = $derived(Object.values(notes).slice(0, Object.values(notes).length / 2, ));

    let rightNotes = $derived(Object.values(notes).slice(Object.values(notes).length / 2));

    let lastNote = "";
    let complete = false;

    let mounted = $state(false);

    onMount(() => {
        correctNoteSound = new Audio("/sounds/correct.mp3");
        allDoneSound = new Audio("/sounds/allDone.mp3");

        const pitchShift = localStorage.getItem("pitchShiftBy") || 0;

        if (pitchShift) {
            //if pitch shift is <= 10 or >= -10 then only set, else set to 0
            if (Math.abs(Number(pitchShift)) <= 10) {
                pitchShiftBy = Number(pitchShift);
            } else {
                pitchShiftBy = 0;
            }
        }

        mounted = true;
    });

    onDestroy(() => {
        stop();
    });

    function stop() {
        

        try {
            if (!audioContext) {
                return;
            }

            if (audioContext.state === "closed") {
                return;
            }

            if (interval) {
                clearInterval(interval);
            }

            audioContext.close().then(() => {
                isListening = false;
                Cent.set(0);
                Frequency.set(0);
                Note = "";
                detectedClarity.set(0);
            });

            activateWakeLock.value = false;

            reset();

            stream.getTracks().forEach((track) => track.stop());

            analyserNode.disconnect();
        } catch (e) {
            console.error(e);
            showToastMessage(e as string);
        }
    }

    async function start() {
        

        try {
            //if closed
            if (audioContext?.state != "running") {
                //create new audio context

                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

                if (stream) {
                    audioContext = new window.AudioContext();
                    analyserNode = audioContext.createAnalyser();
                    audioContext
                        .createMediaStreamSource(stream)
                        .connect(analyserNode);

                    isListening = true;

                    activateWakeLock.value = true;

                    if (audioContext.state === "running") {
                        interval = setInterval(() => {
                            updatePitch(analyserNode, audioContext.sampleRate);
                        }, 100);
                    }
                }
            }
        } catch (e) {
            console.error(e);
            showToastMessage(e as string);
        }
    }

    const correctNotePlayedTimeout: { [key: string]: number } = {};

    function updatePitch(analyserNode: AnalyserNode, sampleRate: number) {
        

        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        const dataArray = new Float32Array(detector.inputLength);
        analyserNode.getFloatTimeDomainData(dataArray);
        const [pitch, clarity] = detector.findPitch(dataArray, sampleRate);

        if (clarity !== null) {
            detectedClarity.set(clarity * 100);
        }

        if (clarity < 0.8) {
            Frequency.set(0);
            Cent.set(0);
            return;
        }

        // Get the note, octave and cent from the pitch
        const tune = tuneInstrument(selectedInstrument.value, pitch, pitchShiftBy);

        Note = tune.note;
        Octave = tune.octave;
        Cent.set(tune.cent);
        Frequency.set((pitch * 100) / 100);

        const noteId = Note + Octave;

        if (
            selectedInstrument.value != "Chromatic" &&
            selectedInstrument.value != "none" &&
            Math.abs($Cent) < 8 &&
            Math.abs($Cent) > 0
        ) {
            tunedNotes.add(noteId);
            tunedNotes = new Set<string>(tunedNotes);
            //if correct note is played and all notes are not tuned
            if (lastNote != Note + Octave) {
                if (
                    tunedNotes.size == Object.values(notes).length &&
                    !complete
                ) {
                    allDoneSound.currentTime = 0;
                    allDoneSound.play();
                    complete = true;
                } else {
                    correctNoteSound.currentTime = 0;
                    correctNoteSound.play();
                }
            }

            const elem = document.getElementById(Note + Octave);

            if (elem) {
                clearTimeout(correctNotePlayedTimeout[noteId]);
                elem.classList.add("played");
                correctNotePlayedTimeout[noteId] = setTimeout(() => {
                    elem.classList.remove("played");
                    delete correctNotePlayedTimeout[noteId];
                }, 1000);
            }

            lastNote = Note + Octave;
        }
    }

    let audioBuffer: AudioBuffer | null = null;
    let streamMuteTimeout: number;
    let playContext: AudioContext;
    let dividerFrequency: number;

    const dividerMap: Map<InstrumentTypes, number> = new Map([
        ["Guitar", getFrequency("E", 2)],
        ["Ukulele", getFrequency("G", 4)],
        ["Bass", getFrequency("E", 1)],
    ]);

    async function loadAudioBuffers() {
        //load the selected instrument audio and adjust by the pitch shift
        try {
            dividerFrequency = dividerMap.get(selectedInstrument.value) as number;

            const response = await fetch(
                `/sounds/${selectedInstrument.value.toLowerCase()}.mp3`,
            );

            const arrayBuffer = await response.arrayBuffer();

            playContext = new AudioContext();

            audioBuffer = await playContext.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error(e);
            showToastMessage(e as string);
        }
    }

    if (dividerMap.has(selectedInstrument.value)) {
        loadAudioBuffers();
    }


    async function playNote(frequency: number) {
        try {
            const instrumentSound = playContext.createBufferSource();

            instrumentSound.buffer = audioBuffer;

            const gainNode = playContext.createGain();

            const distortion = playContext.createWaveShaper();

            const phaser = playContext.createDelay();

            phaser.delayTime.value = 0.1;

            gainNode.connect(playContext.destination);

            distortion.connect(gainNode);
            phaser.connect(distortion);
            instrumentSound.connect(gainNode);

            gainNode.gain.setValueAtTime(1, playContext.currentTime);

            gainNode.gain.exponentialRampToValueAtTime(
                0.1,
                playContext.currentTime + 1,
            );

            gainNode.gain.exponentialRampToValueAtTime(
                0.1,
                playContext.currentTime + 1.01,
            );

            instrumentSound.playbackRate.value = frequency / dividerFrequency;

            instrumentSound.start();

            //we have to mute the microphone so that the sound is not picked up by the microphone

            if (stream) {
                stream.getAudioTracks().forEach((track) => {
                    track.enabled = false;
                });
            }

            clearTimeout(streamMuteTimeout);

            streamMuteTimeout = setTimeout(() => {
                //unmute the microphone
                if (stream) {
                    stream.getAudioTracks().forEach((track) => {
                        track.enabled = true;
                    });
                }
            }, 300);
        } catch (e) {
            console.error(e);
            showToastMessage(e as string);
        }
    }

    const playNoteTimeouts: { [key: string]: number } = {};

    function handleClickOnNote(node: HTMLElement) {
        node.onclick = async (e) => {
            const target = e.target as HTMLElement;

            if (!target) {
                return;
            }

            const frequencyStr = target.dataset.frequency;
            if (!frequencyStr) {
                return;
            }

            const frequency = Number(frequencyStr);

            if (!frequency) {
                return;
            }

            if (playNoteTimeouts[frequencyStr]) {
                clearTimeout(playNoteTimeouts[frequencyStr]);
            }

            target.setAttribute("data-playing", "");

            await playNote(frequency);

            playNoteTimeouts[frequencyStr] = setTimeout(() => {
                //delete from object
                delete playNoteTimeouts[frequencyStr];
                target.removeAttribute("data-playing");
            }, 300);
        };

        return {
            destroy() {
                node.onclick = null;
            },
        };
    }

    function reset() {
        tunedNotes.clear();
        tunedNotes = new Set<string>(tunedNotes);
        lastNote = "";
        complete = false;
    }
</script>

<svelte:window
    onkeypress={(e) => {
        //if space is pressed, start/stop the tuner
        if (e.key == " ") {
            if (isListening) {
                stop();
            } else {
                start();
            }
        } else if (e.key == "Escape") {
            history.back();
        }
    }}
/>

{#if mounted}
    <div class="tuner" in:fly|global={{ y: -10 }}>
        <div class="noteContainer">
            {#if Note}
                <div class="noteName" in:fly|global={{ y: 5 }}>
                    {Note}
                    <div class="octave">{Octave}</div>
                </div>
            {:else}
                <div class="noteName" in:fly|global={{ y: 5 }}>-.-</div>
            {/if}
            <WaveCanvas {Note} {analyserNode} {isListening} />
        </div>
        <div class="meter">
            <div class="range">
                <div class="scale">
                    {#each [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60] as num, i}
                        <div class="point">
                            <div
                                class="meter-scale"
                                class:strong={i == 0 || i == 6 || i == 12}
                                in:fly|global={{ y: 10, delay: 40 * (i + 1) }}
                            ></div>
                            <div
                                class="number"
                                in:fly|global={{ y: 10, delay: 40 * (i + 1) }}
                            >
                                {num}
                            </div>
                        </div>
                    {/each}
                    <div
                        class="pointer"
                        style="width: max(calc((100% / 12)*{Math.abs($Cent) /
                            10}), 5px);"
                        class:left={$Cent < -2}
                        class:right={$Cent > 2}
                        class:strong={Math.abs($Cent) < 10}
                        class:average={Math.abs($Cent) > 10 &&
                            Math.abs($Cent) < 20}
                        class:weak={Math.abs($Cent) > 20 &&
                            Math.abs($Cent) < 30}
                        class:poor={Math.abs($Cent) > 30}
                    ></div>
                </div>
                <div class="labels">
                    <div class="label" in:fly={{ y: 10, delay: 100 }}>♭</div>
                    <div class="label" in:fly={{ y: 10, delay: 350 }}>♮</div>
                    <div class="label" in:fly={{ y: 10, delay: 600 }}>♯</div>
                </div>
            </div>
        </div>
        <div class="info">
            <div class="freq">f: {Math.round($Frequency)} Hz</div>
            <div class="clarity">
                Clarity: {Math.round($detectedClarity)}% {$detectedClarity > 80
                    ? "👍"
                    : "👎"}
            </div>
            <div class="cent">
                {Math.round($Cent)} C {Math.abs($Cent) < 10 ? "😁" : "😢"}
            </div>
        </div>
        {#if selectedInstrument.value != "Chromatic"}
            {#if tunedNotes.size != 0 && tunedNotes.size == Object.values(notes).length}
                <div class="conf" use:confetti></div>
            {/if}

            <div class="noteVisual" use:handleClickOnNote>
                <div class="notes left">
                    <!-- Display E A D -->
                    {#each Object.values(leftNotes) as note, i}
                        <div
                            class="note"
                            id="{note.note}{note.octave}"
                            data-frequency={note.frequency}
                            class:inRange={Note + Octave ==
                                note.note + note.octave}
                            in:fly|global={{ y: 5, delay: 40 * (i + 1) }}
                            class:tuned={tunedNotes.has(
                                note.note + note.octave,
                            )}
                        >
                            <div class="name">{note.note}{note.octave}</div>
                            <div class="freq">
                                {note.frequency.toFixed(2)} Hz
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="input pitch" in:fly|global={{ y: 20 }} title="Shortcut key: Left and right Arrow">
                    <div class="label">
                        Change pitch <i class="fa-solid fa-wave-square"></i>
                    </div>
                    <Range
                        showSign={true}
                        fieldName="pitchShiftBy"
                        fastStep={10}
                        bind:value={pitchShiftBy}
                        min={-100}
                        defaultVal={0}
                        max={100}
                        highKey={"ArrowRight"}
                        lowKey={"ArrowLeft"}
                    />
                </div>
                <div class="notes right">
                    <!-- Display G B E -->
                    {#each Object.values(rightNotes) as note, i}
                        <div
                            class="note"
                            id="{note.note}{note.octave}"
                            data-frequency={note.frequency}
                            class:inRange={Note + Octave ==
                                note.note + note.octave}
                            in:fly|global={{ y: 5, delay: 40 * (i + 1) }}
                            class:tuned={tunedNotes.has(
                                note.note + note.octave,
                            )}
                        >
                            <div class="name">{note.note}{note.octave}</div>
                            <div class="freq">
                                {note.frequency.toFixed(2)} Hz
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        <div class="buttons on-off">
            {#if isListening}
                <button
                    class:listening={isListening}
                    in:fade
                    class="startButton stop"
                    onclick={stop}
                >
                    <Logo size={50} />
                </button>
            {:else}
                <button
                    class:listening={isListening}
                    in:fade
                    class="startButton start"
                    onclick={start}
                >
                    <Logo size={50} />
                </button>
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    .on-off {
        min-height: 100px;
    }
    .on-off button {
        position: relative;
        background: transparent !important;
        z-index: 2;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        //ripple effect
        &.listening:after {
            content: "";
            position: absolute;
            pointer-events: none;
            width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ffffff30;
            border-radius: 50%;
            animation: ripple 1s infinite;
            z-index: -1;
        }
    }

    @keyframes ripple {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
        }
    }

    .conf {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    .noteVisual {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        width: 100%;
        position: relative;
    }

    .notes {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        gap: 5px;

        &.left {
            flex-direction: column-reverse;
        }

        .note {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 100%;
            text-align: center;
            border-radius: 10px;
            padding: 5px;
            border: 2px solid #ffffff30;
            width: 100%;
            max-width: 75px;
            aspect-ratio: 2/1.6;
            transition: 100ms;
            cursor: pointer;

            &.tuned {
                background: #ffffff1a;
            }

            &.inRange {
                border: 2px solid rgb(16, 131, 246);
            }

            .freq {
                font-size: 60%;
                color: #ffffff80;
            }

            > * {
                pointer-events: none;
            }
        }
    }

    :global(.note.played) {
        border: 2px solid #2ecc71 !important;
    }

    :global(.note[data-playing]) {
        border: 2px solid #b291ff !important;
    }

    .tuner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: safe center;
        background: rgba(0, 128, 128, 0);
        border-radius: 10px;
        height: max-content;
        width: min(100%, 500px);
        min-height: 100%;
        gap: 10px;
        overflow: scroll;
    }

    .meter {
        position: relative;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        width: 100%;
    }

    .info {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        padding: 15px 20px 20px 20px;
        width: 100%;
        position: relative;
    }

    .range {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
        width: 100%;
        position: relative;
        padding: 0 10px;

        .scale,
        .labels {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 90%;
            position: relative;
            text-align: center;
        }

        .pointer {
            position: absolute;
            width: 2px;
            max-width: calc((100% / 12) * 6);
            height: 18px;
            left: 50%;
            border-radius: 2px;
            transform: translateX(-50%);
            transition: none;
            &.left {
                transition: width 300ms;
                transform: translateX(-100%);
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
            }
            &.right {
                transition: width 300ms;
                transform: translateX(0%);
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
            }

            &.strong {
                background: #2ecc71;
            }

            &.average {
                background: #f1c40f;
            }

            &.weak {
                background: #e67e22;
            }

            &.poor {
                background: #e74c3c;
            }
        }
    }

    .point {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        .number {
            position: absolute;
            font-size: 0.6rem;
            text-align: center;
            bottom: -10px;
            background: var(--primary);
        }
    }

    .meter-scale {
        width: 2px;
        height: 25px;
        background: #aec4e651;

        &.strong {
            width: 2px;
            height: 35px;
        }
    }

    .noteContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 100%;
        position: relative;
        pointer-events: none;
    }

    .noteName {
        font-weight: bold;
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
        align-items: center;
        font-size: 6rem;
        height: 10rem;
        color: #607d8b;
        .octave {
            font-size: 3rem;
            margin-left: 5px;
            margin-bottom: 10px;
            color: #607d8b;
        }
    }

    //for larger screens increase font size
    @media (min-width: 768px) {
        .noteName {
            font-size: 10rem;
            height: 15rem;
            .octave {
                font-size: 4rem;
            }
        }

        .notes {
            .note {
                font-size: 120%;
                padding: 10px;
                width: 100%;
                max-width: 100px;
            }
        }
    }
</style>
