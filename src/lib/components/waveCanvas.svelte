
<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    export let Note: string;
    export let isListening: boolean;
    export let analyserNode: AnalyserNode;
    
    let canvas: HTMLCanvasElement;
    let canvasContext: CanvasRenderingContext2D;
    let WIDTH: number;
    let HEIGHT: number;

    onMount(() => {
        canvasContext = canvas.getContext("2d") as CanvasRenderingContext2D;
        WIDTH = canvas.width;
        HEIGHT = canvas.height;
        drawCanvas();
    });

    function drawCanvas() {
        if (!canvas) {
            return;
        }

        if (!isListening) {
            //draw  a straight line
            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = "#2c3e5030";
            canvasContext.beginPath();
            canvasContext.moveTo(0, HEIGHT / 2);
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();
        } else {

            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = 2;
            canvasContext.strokeStyle = "#2c3e5030";
            canvasContext.beginPath();

            const bufferLength = analyserNode?.frequencyBinCount;

            const dataArray = new Uint8Array(bufferLength);

            if (bufferLength) {
                
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
</script>


<canvas
    class:hidden={!isListening && !Note}
    in:fly={{ x: 40, delay: 500 }}
    bind:this={canvas}
/>

<style lang="scss">
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
</style>