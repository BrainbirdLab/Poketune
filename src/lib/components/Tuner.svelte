<script lang="ts">
    import { tuneInstrument } from "$lib/tuner";
    import { PitchDetector } from "pitchy";
    import { onMount } from "svelte";
    import { fade, fly } from "svelte/transition";

    let MeterElem: HTMLElement;

    let Octave: number;
    let Note: string;
    let Cent = 0;
    let degree = 22;

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
            Cent = 0;
            Frequency = 0;
            Note = "";
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
            Cent = 0;
            return;
        }

        const tune = tuneInstrument(pitch);

        Note = tune.note;
        Octave = tune.octave;
        Cent = tune.cent;
        degree = Cent;
        Frequency = Math.round(pitch * 100) / 100;


        if (degree > 45) {
            degree = 45;
        } else if (degree < -45) {
            degree = -45;
        }

    }
</script>

<div class="tuner">
    <div class="info">
        <div class="freq">f: {Frequency} Hz</div>
        <div class="clarity">Clarity: {detectedClarity}%</div>
        <div class="cent">{Cent} C</div>
    </div>
    {#if Note} 
    <div class="noteName" in:fly|global={{y: 5}}>
        {Note}{Octave}
    </div>
    {:else}
    <div class="noteName" in:fly|global={{y: 5}}>
        -.-
    </div>
    {/if}
    <div class="meter" bind:this={MeterElem}>
        <div class="range">
            <div class="scale">
                {#each [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50] as num, i}
                    <div class="point">
                        <div class="meter-scale" class:strong={i == 0 || i == 5 || i == 11} in:fly={{ y: 10, delay: 100 * i }}/>
                        <div class="number">{num}</div>
                    </div>
                {/each}
                <div class="pointer" 
                    style="width: {Math.abs(Cent) || 2}px;
                            background: {Math.abs(Cent) < 10 ? "#00ff6a" : Math.abs(Cent) > 10 && Math.abs(Cent) < 20 ? "yellow" : "orange"}
                    "
                    class:left={Cent < -2}
                    class:right={Cent > 2}
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

<style lang="scss">
    .tuner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(0, 128, 128, 0);
        border-radius: 10px;
    }

    .meter {
        position: relative;
        border-radius: 5px;
        background: #2c3e5000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        margin-bottom: 40px;
    }

    .info{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.7rem;
        font-weight: bold;
        margin-top: 60px;
        width: 100%;
        position: relative;

        .freq{
            position: absolute;
            left: 0;
        }

        .clarity{
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
        }

        .cent{
            position: absolute;
            right: 0;
        }
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
            gap: 20px;
            width: 100%;
            position: relative;
            text-align: center;
        }

        .pointer{
            position: absolute;
            width: 2px;
            height: 18px;
            left: 50%;
            border-radius: 2px;
            transition: 100ms;
            transform: translateX(-50%);
            &.left{
                transform: translateX(calc(-100% + 2px));
                border-top-left-radius: 10px;
                border-bottom-left-radius: 10px;
            }
            &.right{
                transform: translateX(calc(0% - 2px));
                border-top-right-radius: 10px;
                border-bottom-right-radius: 10px;
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
        font-size: 10rem;
        opacity: 0.2;
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
            transform: scale(2);
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
