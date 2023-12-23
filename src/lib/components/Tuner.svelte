<script lang="ts">
    
    import { confetti } from "@neoconfetti/svelte";
    import { pitchShiftBy, selectedInstrument } from "$lib/store";
    import {
        getFrequency,
        getReferenceNotes,
        tuneInstrument,
        type Tuning,
    } from "$lib/tuner";
    import { PitchDetector } from "pitchy";
    import { onDestroy, onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    //load audio
    let correctNoteSound: HTMLAudioElement;
    let allDoneSound: HTMLAudioElement;

    let guitarSound: HTMLAudioElement;
    let ukuleleSound: HTMLAudioElement;
    let bassSound: HTMLAudioElement;

    let Octave: number;
    let Note: string;
    let Cent = 0;

    let canvas: HTMLCanvasElement;

    let isListening = false;

    let audioContext: AudioContext;

    let tunedNotes = new Set<string>();

    onMount(() => {

        correctNoteSound = new Audio("/sounds/correct.mp3");
        allDoneSound = new Audio("/sounds/allDone.mp3");

        guitarSound = new Audio("/sounds/guitar.mp3");
        ukuleleSound = new Audio("/sounds/ukulele.mp3");
        bassSound = new Audio("/sounds/bass.mp3");

        drawCanvas();
        const pitchShift = localStorage.getItem("pitchShiftBy") || "0";
        if (pitchShift) {
            //if pitch shift is <= 10 or >= -10 then only set, else set to 0
            if (Math.abs(Number(pitchShift)) <= 10) {
                pitchShiftBy.set(Number(pitchShift));
            } else {
                pitchShiftBy.set(0);
            }
        }

        pitchShiftBy.subscribe((val) => {
            notes = getReferenceNotes();
            localStorage.setItem("pitchShiftBy", val.toString());
        });
        });

        onDestroy(() => {
        stop();
    });

    function drawCanvas() {
        if (!canvas) {
            return;
        }

        const canvasContext = canvas.getContext(
            "2d",
        ) as CanvasRenderingContext2D;
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        if (!isListening) {
            //draw  a straight line
            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = "var(--secondary)";
            canvasContext.beginPath();
            canvasContext.moveTo(0, HEIGHT / 2);
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();
        } else {
            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = "var(--secondary)";

            canvasContext.beginPath();

            const bufferLength = analyserNode?.frequencyBinCount;

            const dataArray = new Uint8Array(bufferLength);

            if (bufferLength && analyserNode) {
                analyserNode.getByteTimeDomainData(dataArray);

                //console.log(bufferLength, dataArray);
                let sliceWidth = (WIDTH * 1.0) / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    let v = dataArray[i] / 128.0;

                    let y = (v * HEIGHT) / 2;

                    if (i === 0) {
                        canvasContext.moveTo(x, y);
                    } else {
                        canvasContext.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasContext.lineTo(canvas.width, canvas.height / 2);
                canvasContext.stroke();
            }
        }

        requestAnimationFrame(drawCanvas);
    }


    let Frequency = 0;
    let detectedClarity = 0;

    let analyserNode: AnalyserNode;

    let stream: MediaStream;

    let interval: number;

    let notes: { [key: string]: Tuning } = getReferenceNotes();

    $: leftNotes = Object.values(notes).slice(
        0,
        Object.values(notes).length / 2,
    );
    $: rightNotes = Object.values(notes).slice(Object.values(notes).length / 2);

    function stop() {
        //console.log("stop");

        if (!audioContext) {
            //console.log("No audio context");
            return;
        }

        if (audioContext.state === "closed") {
            //console.log("Already closed");
            return;
        }

        if (interval) {
            clearInterval(interval);
        }

        audioContext.close().then(() => {
            console.log("closed");
            isListening = false;
            Cent = 0;
            Frequency = 0;
            Note = "";
            detectedClarity = 0;
        });

        reset();

        stream.getTracks().forEach((track) => track.stop());

        analyserNode.disconnect();
    }

    async function start() {
        console.log("start");

        //if closed
        if (audioContext?.state != "running") {
            //create new audio context

            stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            if (stream) {
                audioContext = new window.AudioContext();
                analyserNode = audioContext.createAnalyser();
                audioContext
                    .createMediaStreamSource(stream)
                    .connect(analyserNode);

                isListening = true;

                if (audioContext.state === "running") {
                    interval = setInterval(() => {
                        updatePitch(analyserNode, audioContext.sampleRate);
                    }, 100);
                }
            }
        }

        //if running
        if (audioContext.state === "running") {
            console.log("running");
        }
    }

    let lastNote = "";
    let complete = false;

    function updatePitch(analyserNode: AnalyserNode, sampleRate: number) {
        //console.log("updatePitch ", count++);
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        const dataArray = new Float32Array(detector.inputLength);
        analyserNode.getFloatTimeDomainData(dataArray);
        const [pitch, clarity] = detector.findPitch(dataArray, sampleRate);

        if (clarity !== null) {
            detectedClarity = Math.round(clarity * 100);
        }

        if (clarity < 0.8) {
            Frequency = 0;
            Cent = 0;
            return;
        }

        const tune = tuneInstrument(pitch);

        Note = tune.note;
        Octave = tune.octave;
        Cent = tune.cent;
        Frequency = Math.round(pitch * 100) / 100;
        
        if (($selectedInstrument != "chromatic" && $selectedInstrument != "none") && Math.abs(Cent) < 8 && Math.abs(Cent) > 0) {
            tunedNotes.add(Note + Octave);
            tunedNotes = new Set<string>(tunedNotes);
            console.log(tunedNotes, notes);
            //if correct note is played and all notes are not tuned
            if (
                lastNote != Note + Octave
            ) {
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
                elem.classList.add("played");
                setTimeout(() => {
                    elem.classList.remove("played");
                }, 1000);
            }

            lastNote = Note + Octave;
        }
    }

    function incrementPitchBy(num: number) {
        pitchShiftBy.update((val) => {
            //if first note frequency is more than 16.35 Hz or last note frequency is less than 7902.13 Hz then only increment
            return val + num;
        });
        const tempNotes = getReferenceNotes();
        const obj = Object.values(tempNotes);
        const firstNote = obj[0].frequency;
        const lastNote = obj[obj.length - 1].frequency;

        if (firstNote < 16.35 || lastNote > 7902.13) {
            pitchShiftBy.update((val) => {
                return val - num;
            });
        } else {
            reset();
        }
    }

    let audioBuffer: AudioBuffer | null = null;

    async function playNote(frequency: number){
       
        let dividerFrequency: number = 0;
        //load audio
        let url = '';
        if ($selectedInstrument == "guitar"){
            url = "/sounds/guitar.mp3";
            dividerFrequency = getFrequency("E", 2);
        } else if ($selectedInstrument == "ukulele"){
            url = "/sounds/ukulele.mp3";
            dividerFrequency = getFrequency("G", 4);
        } else if ($selectedInstrument == "bass"){
            url = "/sounds/bass.mp3";
            dividerFrequency = getFrequency("E", 1);
        }

        const noteAudioContext = new AudioContext();

        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await noteAudioContext.decodeAudioData(arrayBuffer);

        const source = noteAudioContext.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = noteAudioContext.createGain();
        const distortion = noteAudioContext.createWaveShaper();
        const phaser = noteAudioContext.createDelay();
        phaser.delayTime.value = 0.1;

        gainNode.connect(noteAudioContext.destination);
        distortion.connect(gainNode);
        phaser.connect(distortion);
        source.connect(gainNode);


        gainNode.gain.setValueAtTime(1, noteAudioContext.currentTime);

        gainNode.gain.exponentialRampToValueAtTime(
            0.1,
            noteAudioContext.currentTime + 1,
        );

        gainNode.gain.exponentialRampToValueAtTime(
            0.1,
            noteAudioContext.currentTime + 1.01,
        );

        source.playbackRate.value = frequency / dividerFrequency;
        source.start();
    }

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

            await playNote(frequency);
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

<div class="tuner" in:fly|global={{y: -10}}>
    <div class="noteContainer">
        {#if Note}
            <div class="noteName" in:fly|global={{ y: 5 }}>
                {Note}
                <div class="octave">{Octave}</div>
            </div>
        {:else}
            <div class="noteName" in:fly|global={{ y: 5 }}>-.-</div>
        {/if}
        <canvas
            class:hidden={!isListening && !Note}
            in:fly={{ x: 40, delay: 500 }}
            bind:this={canvas}
        />
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
                        />
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
                    style="width: max(calc((100% / 12)*{Math.abs(Cent) /
                        10}), 2%);"
                    class:left={Cent < -2}
                    class:right={Cent > 2}
                    class:strong={Math.abs(Cent) < 10}
                    class:average={Math.abs(Cent) > 10 && Math.abs(Cent) < 20}
                    class:weak={Math.abs(Cent) > 20 && Math.abs(Cent) < 30}
                    class:poor={Math.abs(Cent) > 30}
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
        <div class="freq">f: {Frequency} Hz</div>
        <div class="clarity">
            Clarity: {detectedClarity}% {detectedClarity > 80 ? "👍" : "👎"}
        </div>
        <div class="cent">{Cent} C {Math.abs(Cent) < 10 ? "😁" : "😢"}</div>
    </div>
    {#if $selectedInstrument != "chromatic"}
        {#if tunedNotes.size == Object.values(notes).length}
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
                        in:fly|global={{ y: 5, delay: 40 * (i + 1) }}
                        class:tuned={tunedNotes.has(note.note + note.octave)}
                    >
                        <div class="name">{note.note}{note.octave}</div>
                        <div class="freq">{note.frequency.toFixed(2)} Hz</div>
                    </div>
                {/each}
            </div>
            <div class="pitch">
                <div class="label">Change pitch</div>
                <div class="settings">
                    <button
                    class="updateButton"
                    on:click={() => {
                        incrementPitchBy(-1);
                    }}
                >
                <i class="fa-solid fa-minus"></i>
                </button>
                {#key $pitchShiftBy}
                    <div class="pitchShift" in:fly={{ y: 10, duration: 500 }}>
                        {$pitchShiftBy > 0 ? "+" : ""}{$pitchShiftBy}
                    </div>
                {/key}
                <button
                    class="updateButton"
                    on:click={() => {
                        incrementPitchBy(1);
                    }}
                >
                <i class="fa-solid fa-plus"></i>
                </button>
                </div>
            </div>
            <div class="notes right">
                <!-- Display G B E -->
                {#each Object.values(rightNotes) as note, i}
                    <div
                        class="note"
                        id="{note.note}{note.octave}"
                        data-frequency={note.frequency}
                        in:fly|global={{ y: 5, delay: 40 * (i + 1) }}
                        class:tuned={tunedNotes.has(note.note + note.octave)}
                    >
                        <div class="name">{note.note}{note.octave}</div>
                        <div class="freq">{note.frequency.toFixed(2)} Hz</div>
                    </div>
                {/each}
            </div>
        </div>
        {/if}
        <div class="buttons on-off">
            {#if isListening}
                <button in:fade class="startButton stop" on:click={stop}
                    ><i class="fa-solid fa-guitar"></i></button
                >
            {:else}
                <button in:fade class="startButton start" on:click={start}
                    ><i class="fa-solid fa-guitar"></i></button
                >
            {/if}
        </div>
</div>

<style lang="scss">

    .conf {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
    }

    canvas {
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        opacity: 1;
        transition: 100ms;
        z-index: -1;
        &.hidden {
            opacity: 0;
        }
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
            max-width: 65px;
            transition: 100ms;
            cursor: pointer;

            &.tuned {
                border: 2px solid #2ecc71;
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
        background: #2ecc7074;
    }

    .tuner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        background: rgba(0, 128, 128, 0);
        border-radius: 10px;
        height: max-content;
        width: 100%;
        gap: 10px;
        overflow: scroll;
    }

    .pitch {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        width: 100%;
        font-size: 0.7rem;
        color: var(--secondary);

        .settings{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            position: relative;
            width: 100%;
        }
    }

    .pitchShift {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 10px;
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
            //transition: 100ms;
            transform: translateX(-50%);
            &.left {
                transform: translateX(-100%);
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
            }
            &.right {
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
        align-items: flex-end;
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
