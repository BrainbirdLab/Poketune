<script lang="ts">
    import { pitchShiftBy, selectedInstrument } from "$lib/store";
    import { getFrequency, getReferenceNotes, tuneInstrument, type Tuning } from "$lib/tuner";
    import { PitchDetector } from "pitchy";
    import { onDestroy, onMount } from "svelte";
    import { fade, fly, slide } from "svelte/transition";


    let Octave: number;
    let Note: string;
    let Cent = 0;

    let canvas: HTMLCanvasElement;

    let isListening = false;

    let audioContext: AudioContext;

    let tunedNotes = new Set<string>();

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
            canvasContext.strokeStyle = "#2c3e50";
            canvasContext.beginPath();
            canvasContext.moveTo(0, HEIGHT / 2);
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();
        } else {

            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = "#2c3e50";

            canvasContext.beginPath();

            const bufferLength = analyserNode?.frequencyBinCount;

            const dataArray = new Uint8Array(bufferLength);

            
            if (bufferLength && analyserNode){

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

    onMount(() => {
        drawCanvas();
    });

    onDestroy(() => {
        stop();
    });

    let Frequency = 0;
    let detectedClarity = 0;

    let analyserNode: AnalyserNode;

    let stream: MediaStream;

    let interval: number;

    let notes: {[key: string]: Tuning} = getReferenceNotes();

    pitchShiftBy.subscribe((val) => {
        notes = getReferenceNotes();
    });

    function stop() {
        console.log("stop");

        if (!audioContext) {
            console.log("No audio context");
            return;
        }

        if (audioContext.state === "closed") {
            console.log("Already closed");
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

        tunedNotes.clear();
        tunedNotes = new Set<string>(tunedNotes);

        stream.getTracks().forEach((track) => track.stop());

        analyserNode.disconnect();
    }

    async function start() {
        console.log("start");

        //if closed
        if (audioContext?.state != "running") {
            //create new audio context
            
            stream = await navigator.mediaDevices
            .getUserMedia({ audio: true });
            
            if (stream){

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
        if (Math.abs(Cent) < 8 && Math.abs(Cent) > 0) {
            tunedNotes.add(Note+Octave);
            tunedNotes = new Set<string>(tunedNotes);
        }
    }

    function incrementPitchBy(num: number) {
        pitchShiftBy.update((val) => {
            //if first note frequency is more than 16.35 Hz or last note frequency is less than 7902.13 Hz then only increment
            return val+num;
        });
        const tempNotes = getReferenceNotes();
        const obj = Object.values(tempNotes);
        const firstNote = obj[0].frequency;
        const lastNote = obj[obj.length - 1].frequency;

        if (firstNote < 16.35 || lastNote > 7902.13) {
            pitchShiftBy.update((val) => {
                return val-num;
            });
        } else {
            tunedNotes.clear();
            tunedNotes = new Set<string>(tunedNotes);
        }
    }
</script>

<canvas class:hidden={!isListening && !Note} in:fly={{ x: 40, delay: 500 }} bind:this={canvas} />
<div class="tuner">
    {#if Note} 
    <div class="noteName" in:fly|global={{y: 5}}>
        {Note} <div class="octave">{Octave}</div>
    </div>
    {:else}
    <div class="noteName" in:fly|global={{y: 5}}>
        -.-
    </div>
    {/if}
    <div class="meter">
        <div class="range">
            <div class="scale">
                {#each [-60, -50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50, 60] as num, i}
                    <div class="point">
                        <div class="meter-scale" class:strong={i == 0 || i == 6 || i == 12} in:fly|global={{ y: 10, delay: 40 * (i+1) }}/>
                        <div class="number" in:fly|global={{ y: 10, delay: 40 * (i+1) }}>{num}</div>
                    </div>
                {/each}
                <div class="pointer" 
                    style="width: max(calc((100% / 12)*{(Math.abs(Cent))/10}), 2%);"
                    class:left={Cent < -2}
                    class:right={Cent > 2}
                    class:strong={Math.abs(Cent) < 10}
                    class:average={Math.abs(Cent) > 10 && Math.abs(Cent) < 20}
                    class:weak={Math.abs(Cent) > 20 && Math.abs(Cent) < 30}
                    class:poor={Math.abs(Cent) > 30}
                ></div>
            </div>
            <div class="labels">
                <div class="label" in:fly={{ y: 10, delay: 100 }}> 
                    ♭
                </div>
                <div class="label" in:fly={{ y: 10, delay: 350 }}>
                    ♮
                </div>
                <div class="label" in:fly={{ y: 10, delay: 600 }}>
                    ♯
                </div>
            </div>
        </div>
    </div>
    <div class="info">
        <div class="freq">f: {Frequency} Hz</div>
        <div class="clarity">Clarity: {detectedClarity}% {detectedClarity > 80 ? "👍" : "👎"}</div>
        <div class="cent">{Cent} C {Math.abs(Cent) < 10 ? "😁" : "😢"}</div>
    </div>
    {#if $selectedInstrument != "Chromatic"}
        <div class="notes">
            {#key $pitchShiftBy}
            {#each Object.values(notes) as note, i}
                <div class="note" class:tuned={tunedNotes.has(note.note+note.octave)}>
                    <div class="name" in:fly|global={{y: 5, delay: 40*(i+1)}}>{note.note}{note.octave}</div>
                    <div class="freq" in:fly|global={{y: 5, delay: 40*(i+1)}}>{note.frequency.toFixed(2)} Hz</div>
                </div>
            {/each}
            {/key}
        </div>
        <div class="pitch">
            <button class="pitchChanger" on:click={()=>{
                incrementPitchBy(-1);
            }}> - </button>
            {#key $pitchShiftBy}
            <div class="pitchShift" in:fly={{y: 10, duration: 500}} >
                {$pitchShiftBy > 0 ? "+" : ""}{$pitchShiftBy}
            </div>
            {/key}
            <button class="pitchChanger" on:click={()=>{
                incrementPitchBy(1);
            }}> + </button>
            {#if Math.abs($pitchShiftBy) > 10}
                <button transition:slide={{axis: 'x'}} class="button">Reset</button>
            {/if}
        </div>
    {/if}
    {#if isListening}
        <button in:fade class="listenActionButton stop" on:click={stop}
            >Stop</button
        >
    {:else}
        <button in:fade class="listenActionButton start" on:click={start}
            >Start</button
        >
    {/if}
</div>

<style lang="scss">

    canvas{
        position: absolute;
        top: 25%;
        left: 50%;
        transform: translateX(-50%);
        opacity: 1;
        transition: 100ms;
        &.hidden{
            opacity: 0;
        }
    }

    .notes{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        margin-top: 20px;
        margin-bottom: 20px;
        gap: 5px;

        .note{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            padding: 10px;
            font-size: 1rem;
            text-align: center;
            border-radius: 10px;
            border: 2px solid #ffffff30;

            &.tuned{
                border: 2px solid #2ecc71;
            }

            .freq{
                font-size: 0.6rem;
                color: #ffffff80;
            }
        }
    }

    .tuner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 128, 128, 0);
        border-radius: 10px;
        height: 100%;
        width: 100%;
    }

    .pitchChanger, .button{
        border: none;
        outline: none;
        padding: 10px;
        width: 35px;
        height: 35px;
        border-radius: 10px;
        background: #2c3e50;
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover{
            filter: brightness(0.9);
        }
    }

    .button{
        width: max-content;
        height: 35px;
        margin: 10px;
    }

    .pitch{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        position: relative;
    }

    .pitchShift{
        font-size: 1.5rem;
        font-weight: bold;
        margin: 10px;
    }

    .meter {
        position: relative;
        border-radius: 5px;
        background: #2c3e5000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: row;
        margin-bottom: 40px;
        width: 100%;
    }

    .info{
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

    .range{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
        width: 100%;
        position: relative;
        padding: 0 10px;

        .scale, .labels{
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            width: 90%;
            position: relative;
            text-align: center;
        }

        .pointer{
            position: absolute;
            width: 2px;
            max-width: calc((100% / 12) * 6);
            height: 18px;
            left: 50%;
            border-radius: 2px;
            //transition: 100ms;
            transform: translateX(-50%);
            &.left{
                transform: translateX(-100%);
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;
            }
            &.right{
                transform: translateX(0%);
                border-top-right-radius: 5px;
                border-bottom-right-radius: 5px;
            }

            &.strong{
                background: #2ecc71;
            }

            &.average{
                background: #f1c40f;
            }

            &.weak{
                background: #e67e22;
            }

            &.poor{
                background: #e74c3c;
            }
        }
    }

    .point{
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        .number{
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

    .noteName {
        font-weight: bold;
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
        align-items: flex-end;
        font-size: 10rem;
        height: 10rem;
        opacity: 0.2;
        margin-bottom: 30px;
    }

    .octave{
        font-size: 4rem;
        margin-left: 5px;
        margin-bottom: 10px;
    }

    .listenActionButton {
        border: none;
        outline: none;
        padding: 10px;
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #266dfa;
        cursor: pointer;
        transition: 100ms;
        position: relative;
        margin-top: 30px;
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0;
        }
        50% {
            opacity: 0.9;
        }
        100% {
            transform: scale(1.6);
            opacity: 0;
        }
    }

    .stop {
        background: #ff0000;
        &::after{
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            border-radius: 50%;
            background: #ffffff30;
            opacity: 0;
            z-index: -1;
            transform: scale(1);
            animation: pulse 800ms infinite;
        }
    }

    .listenActionButton:hover {
        filter: brightness(0.97);
    }
</style>
