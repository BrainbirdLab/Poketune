
<script lang="ts">
    import { onMount } from "svelte";
    import { slide } from "svelte/transition";

    interface Props {
        Note: string;
        isListening: boolean;
        analyserNode: AnalyserNode;
        color?: string;
        waveWidth?: number;
        absolute?: boolean;
        zIndex?: number;
        height?: number;
    }

    let { Note, isListening, analyserNode, color = "#2c3e5030", waveWidth = 2, absolute = true, zIndex = -1, height = 100 }: Props = $props();

    let canvas: HTMLCanvasElement = $state() as HTMLCanvasElement;
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
            canvasContext.lineWidth = waveWidth;
            canvasContext.strokeStyle = color;
            canvasContext.beginPath();
            canvasContext.moveTo(0, HEIGHT / 2);
            canvasContext.lineTo(canvas.width, canvas.height / 2);
            canvasContext.stroke();
        } else {

            canvasContext.clearRect(0, 0, WIDTH, HEIGHT);
            canvasContext.lineWidth = waveWidth;
            canvasContext.strokeStyle = color;
            canvasContext.beginPath();

            const bufferLength = analyserNode?.frequencyBinCount;

            const dataArray = new Uint8Array(bufferLength);

            if (bufferLength) {
                
                analyserNode.getByteTimeDomainData(dataArray);

                

                let sliceWidth = (WIDTH * 1.0) / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    let v = dataArray[i] / 128.0;

                    let y = ((v * HEIGHT) / 2);
                    //center the y by translating it to the middle of the canvas

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
    style="position: {absolute ? "absolute" : "relative"}; height: {height}px; z-index: {zIndex};"
    class:hidden={!isListening && !Note}
    in:slide|global={{ axis: "x", delay: 100 }}
    bind:this={canvas}
>
</canvas>

<style lang="scss">
    canvas {
        left: 50%;
        width: 100%;
        transform: translateX(-50%);
        opacity: 1;
        transition: 100ms;
        &.hidden {
            opacity: 0;
        }
    }
</style>