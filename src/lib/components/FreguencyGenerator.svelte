<script lang="ts">
    import { activateWakeLock, sentenceCase } from "$lib/store.svelte.ts";
    import { fly } from "svelte/transition";
    import Slider from "./controls/Slider.svelte";
    import Range from "./controls/Range.svelte";
    import { onDestroy, onMount } from "svelte";
    import WaveCanvas from "./waveCanvas.svelte";

    let start = $state(false);
    let frequency = $state(20);

    const waveType = ["sine", "square", "sawtooth", "triangle"];

    let selectedWaveType = $state(0);

    let audioCtx = new AudioContext();
    
    let oscillator: OscillatorNode = $state<OscillatorNode>() as OscillatorNode;
    let analyserNode = audioCtx.createAnalyser();


    $effect(() => {
        if (!oscillator) {
            return;
        }
        oscillator.frequency.value = frequency;
        oscillator.type = waveType[selectedWaveType] as OscillatorType;
    });

    let mounted = $state(false);

    onMount(() => {
        const v = localStorage.getItem("selectedWave");
        if (v && !isNaN(parseInt(v)) && parseInt(v) < waveType.length && parseInt(v) >= 0) {
            selectedWaveType = parseInt(v);
        } else {
            selectedWaveType = 0;
        }
        mounted = true;
    });

    function handleStart() {
        if (start) {
            oscillator.stop();
            //remove frequency from analyser
            if (analyserNode) {
                analyserNode.disconnect();
            }
            activateWakeLock.value = false;
        } else {
            oscillator = audioCtx.createOscillator();
            oscillator.type = waveType[selectedWaveType] as OscillatorType;
            oscillator.frequency.value = frequency;
            oscillator.connect(audioCtx.destination);
            oscillator.connect(analyserNode);
            oscillator.start();
            //add frequency to analyser
            activateWakeLock.value = true;
        }
        start = !start;
    }

    onDestroy(() => {
        if (oscillator) {
            if (analyserNode){
                analyserNode.disconnect();
            }
            oscillator.stop();
        }
    });
</script>

<svelte:window onkeypress={(e) => {
    //if space is pressed, start/stop the tuner
    if (e.key == " ") {
        handleStart();
    } else if (e.key == "Escape") {
        history.back();
    }
}} />


{#if mounted}
<div class="container">
    <div class="input">
        <div class="label" in:fly|global={{x: 10}}>
            Wave type
            <img src="/images/wave-{waveType[selectedWaveType]}.png" alt="{waveType[selectedWaveType]}_wave" />
        </div>
        <div class="waveTypes">
            {#each waveType as wave, i}
                <button
                    in:fly|global={{ y: 10, delay: 50 * (i + 1) }}
                    class="waveType"
                    class:selected={selectedWaveType == i}
                    onclick={() => {
                        selectedWaveType = i;
                        localStorage.setItem("selectedWave", i.toString());
                    }}
                >
                    {sentenceCase(wave)}
                    <img src="/images/wave-{wave}.png" alt="{wave}_wave" />
                </button>
            {/each}
        </div>
    </div>
    <div class="input slider" in:fly|global={{y: -10}} title="Shortcut key: Left and right Arrow">
        <div class="label">
            Change frequency <i class="fas fa-wave-square"></i>
        </div>
        <div class="label warning">
            Warning: High frequency can cause hearing damage <i class="fa-solid fa-ear-listen"></i> 
        </div>
        <Slider min={20} max={20_000} bind:value={frequency} />
        <Range
            fieldName="frequency"
            min={20}
            defaultVal={300}
            max={20_000}
            bind:value={frequency}
            unit="Hz"
            fastStep={20}
            highKey={"ArrowRight"}
            lowKey={"ArrowLeft"}
        >
        </Range>
    </div>
    <button in:fly|global={{x: -10}} onclick={handleStart} class="beatButton">
        {#if start}
        <WaveCanvas height={50} waveWidth={3} zIndex={-1} absolute={true} color={"#b291ff3d"} Note={waveType[selectedWaveType]} isListening={start} analyserNode={analyserNode}/>
            <i class="fa-solid fa-pause"></i> Stop
        {:else}
            <i class="fa-solid fa-play"></i> Start
        {/if}
    </button>
</div>
{/if}

<style lang="scss">

    .beatButton{
        width: 150px;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 25px;
        width: 100%;
        height: 100%;
        justify-content: safe center;
        overflow-y: scroll;
        min-height: max-content;
        padding: 25px 10px;
        box-sizing: border-box;
    }

    .slider{
        width: 100%;
        min-width: 300px;
        max-width: 500px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .label {
        font-size: 0.7rem;
        font-weight: 700;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;

        &.warning{
            color: #df2424;
            font-size: 0.6rem;
            font-weight: 400;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }

        img {
            width: 15px;
            height: 15px;
            display: inline-block;
        }
    }

    .waveTypes {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        min-width: 300px;
        max-width: 500px;

        .waveType {
            border: none;
            outline: none;
            padding: 10px;
            width: 120px;
            height: 60px;
            border-radius: 10px;
            font-size: 0.7rem;
            background: transparent;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: center;
            border: 2px solid var(--secondary);

            img {
                width: 20px;
                height: 20px;
            }

            &.selected {
                border: 2px solid #b291ff;
            }
        }
    }
</style>
