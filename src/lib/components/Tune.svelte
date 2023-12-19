<!-- PitchDetector.svelte -->
<script lang="ts">

    import { PitchDetector } from "pitchy";

    let detectedFrequency = 0;
    let detectedClarity = 0;

    let audioContext: AudioContext;
    let analyserNode: AnalyserNode;

    let interval: number;

    function stop() {
        console.log("stop");

        if (audioContext.state === "closed") {
            console.log("Already closed");
            return;
        }

        if (interval){
            clearInterval(interval);
        }

        audioContext.close().then(() => {
            console.log("closed");
        });
    }

    function start() {
        console.log("start");

        //if closed
        if (audioContext?.state != "running") {
            console.log("closed");
            //create new audio context
            audioContext = new window.AudioContext();
            analyserNode = audioContext.createAnalyser();

            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    audioContext
                        .createMediaStreamSource(stream)
                        .connect(analyserNode);

                    if (audioContext.state === "running") {
                        interval = setInterval(() => {
                            updatePitch(analyserNode, audioContext.sampleRate);
                        }, 200);
                    }
                })
        
                .catch((error) => {
                    console.error("Error accessing microphone:", error);
                });
        }

        //if running
        if (audioContext.state === "running") {
            console.log("running");
        }
    }

    let count = 0;
    
    function updatePitch(analyserNode: AnalyserNode, sampleRate: number) {
        console.log("updatePitch ", count++);
        const detector = PitchDetector.forFloat32Array(analyserNode.fftSize);
        const input = new Float32Array(detector.inputLength);

        analyserNode.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input, sampleRate);
        if (clarity !== null) {
            detectedClarity = Math.round(clarity * 100);
        }

        if (clarity > 0.8) {
            detectedFrequency = 0;
            if (pitch !== null) {
                detectedFrequency = Math.round(pitch * 10) / 10;
            }
        } else {
            detectedFrequency = 0;
        }
    }
</script>

<h1>Real-time Pitch Detector</h1>
<div id="detected-frequency">
    Detected Frequency: {detectedFrequency.toFixed(2)} Hz
    Clarity of Pitch: {detectedClarity}%
</div>

<button on:click={start}>Start</button>
<button on:click={stop}>Stop</button>

<style>
    button{
        background-color: #fff;
        color: #000;
        border: none;
        padding: 10px;
        border-radius: 10px;
        margin: 10px;
        cursor: pointer;
    }
</style>
