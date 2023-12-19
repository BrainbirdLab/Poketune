<script lang="ts">
    import { PitchDetector } from "pitchy";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    export let instrument: string = "Chromatic";

    let MeterElem: HTMLElement;

    let Octave: number | string = "-";
    let Note = "-";
    let Cent = 22;

    const notes = [
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

    let canvas: HTMLCanvasElement;

    let isListening = false;

    let audioContext: AudioContext;

    function drawCanvas() {
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

    let Frequency = 0;
    let detectedClarity = 0;

    let analyserNode: AnalyserNode;

    let stream: MediaStream;

    let interval: number;

    function stop() {
        console.log("stop");

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
            Note = "-";
            Octave = "-";
            Cent = 0;
            Frequency = 0;
            detectedClarity = 0;
        });

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
            Note = "-";
            Octave = "-";
            Cent = 0;
            return;
        }

        const noteIndex = Math.round(Math.log(pitch / 440) / Math.log(2) * 12) + 57;
        Note = notes[noteIndex % 12];
        Octave = Math.floor(noteIndex / 12);
        const expectedFrequency = 440 * Math.pow(2, (noteIndex - 57) / 12);
        Cent = Math.round(1200 * Math.log(pitch / expectedFrequency) / Math.log(2));
        Frequency = Math.round(pitch);

        if (Cent > 45) {
            Cent = 45;
        } else if (Cent < -45) {
            Cent = -45;
        }

    }
</script>

<div class="instrument">
    <img src="/images/{instrument}(Custom).png" alt={instrument} width="60px" />
</div>

<div class="tuner">
    <div class="meter" bind:this={MeterElem}>
        <div class="range">
            <div
                class="meter-scale meter-scale-strong"
                in:fly={{ y: 10, delay: 100 }}
            >
                ♭
            </div>
            <div class="meter-scale" in:fly={{ y: 10, delay: 150 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 200 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 250 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 300 }} />
            <div
                class="meter-scale meter-scale-strong"
                in:fly={{ y: 10, delay: 350 }}
            >
                ♮
            </div>
            <div class="meter-scale" in:fly={{ y: 10, delay: 400 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 450 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 500 }} />
            <div class="meter-scale" in:fly={{ y: 10, delay: 550 }} />
            <div
                class="meter-scale meter-scale-strong"
                in:fly={{ y: 10, delay: 600 }}
            >
                ♯
            </div>
        </div>
        <div
            in:fade={{ duration: 1000 }}
            class="meter-pointer"
            style="transform: rotate({Cent}deg);"
        />
        <div class="meter-dot" />
        <div class="noteName">
            <div class="toneName">
                {Note}{Octave}
            </div>
            <div class="frequency">
                {Frequency}Hz | {detectedClarity}%
            </div>
        </div>
    </div>
    <canvas in:fly={{ x: 40, delay: 500 }} bind:this={canvas} />
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

<style>
    .tuner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 128, 128, 0);
        border-radius: 10px;
    }

    .instrument {
        position: fixed;
        top: 0;
        right: 0;
        padding: 10px;
    }

    .meter {
        position: relative;
        width: 200px;
        height: 200px;
        border-radius: 5px;
        background: #2c3e5000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }

    .meter-scale {
        width: 1px;
        height: 100%;
        transform-origin: bottom;
        transition: transform 0.2s;
        box-sizing: border-box;
        border-top: 10px solid;
        position: absolute;
        right: 50%;
        top: 0;
        z-index: -1;
    }

    .meter-scale:nth-child(1) {
        transform: rotate(-45deg);
    }

    .meter-scale:nth-child(2) {
        transform: rotate(-36deg);
    }

    .meter-scale:nth-child(3) {
        transform: rotate(-27deg);
    }

    .meter-scale:nth-child(4) {
        transform: rotate(-18deg);
    }

    .meter-scale:nth-child(5) {
        transform: rotate(-9deg);
    }

    .meter-scale:nth-child(6) {
        transform: rotate(0deg);
    }

    .meter-scale:nth-child(7) {
        transform: rotate(9deg);
    }

    .meter-scale:nth-child(8) {
        transform: rotate(18deg);
    }

    .meter-scale:nth-child(9) {
        transform: rotate(27deg);
    }

    .meter-scale:nth-child(10) {
        transform: rotate(36deg);
    }

    .meter-scale:nth-child(11) {
        transform: rotate(45deg);
    }

    .meter-scale-strong {
        width: 2px;
        border-top-width: 20px;
    }

    .meter-dot {
        width: 10px;
        height: 10px;
        background: #2c3e50;
        border-radius: 50%;
        position: absolute;
        bottom: -5px;
        right: 50%;
        margin-right: -4px;
    }

    .meter-pointer {
        width: 2px;
        height: 100%;
        background: #2c3e50;
        transform: rotate(22deg);
        transform-origin: bottom;
        transition: transform 0.5s;
        position: absolute;
        right: 50%;
        z-index: -3;
    }

    .noteName {
        font-weight: bold;

        position: absolute;
        display: flex;
        flex-direction: row;
        width: 250px;
        justify-content: space-between;
        bottom: -10px;
    }

    .listenActionButton {
        border: none;
        outline: none;
        padding: 10px;
        width: 60px;
        border-radius: 10px;
        background: #266dfa;
        cursor: pointer;
        transition: 100ms;
    }

    .stop {
        background: #ff0000;
    }

    .listenActionButton:hover {
        filter: brightness(0.97);
    }
</style>
