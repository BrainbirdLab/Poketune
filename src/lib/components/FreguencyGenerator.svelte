<script lang="ts">
    import { sentenceCase } from "$lib/store";
    import { fly } from "svelte/transition";
    import Slider from "./Slider.svelte";
    import Range from "./Range.svelte";
    import { onDestroy, onMount } from "svelte";
    import { createEventDispatcher } from 'svelte'
    import WaveCanvas from "./waveCanvas.svelte";

    const dispatch = createEventDispatcher();

    let start = false;
    let frequency = 20;

    const waveType = ["sine", "square", "sawtooth", "triangle"];

    let selectedWaveType = 0;

    let audioCtx = new AudioContext();
    let oscillator: OscillatorNode;

    let analyserNode = audioCtx.createAnalyser();

    $: {
        if (oscillator) {
            oscillator.frequency.value = frequency;
            oscillator.type = waveType[selectedWaveType] as OscillatorType;
        }
    }

    let mounted = false;
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
            oscillator.disconnect(analyserNode);
            dispatch("keepAwake", false);
        } else {
            oscillator = audioCtx.createOscillator();
            oscillator.type = waveType[selectedWaveType] as OscillatorType;
            oscillator.frequency.value = frequency;
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            //add frequency to analyser
            oscillator.connect(analyserNode);
            dispatch("keepAwake", true);
        }
        start = !start;
    }

    onDestroy(() => {
        if (oscillator) {
            oscillator.stop();
            oscillator.disconnect(analyserNode);
        }
    });
</script>

{#if mounted}
<div class="container">
    <div class="canvas">
        <WaveCanvas color={"#b291ff"} Note={waveType[selectedWaveType]} isListening={start} analyserNode={analyserNode}/>
    </div>
    <div class="input">
        <div class="label" in:fly|global={{x: 10}}>
            Wave type
            <img src="/images/Frequency (Mini).png" alt="" />
        </div>
        <div class="waveTypes">
            {#each waveType as wave, i}
                <button
                    in:fly|global={{ y: 10, delay: 50 * (i + 1) }}
                    class="waveType"
                    class:selected={selectedWaveType == i}
                    on:click={() => {
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
    <div class="input slider" in:fly|global={{y: -10}}>
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
            fastStep={20}>
        </Range>
    </div>
    <button in:fly|global={{x: -10}} class="startButton" on:click={handleStart}>
        {#if start}
            <i class="fa-solid fa-pause"></i>
        {:else}
            <i class="fa-solid fa-play"></i>
        {/if}
    </button>
</div>
{/if}

<style lang="scss">

    .canvas{
        width: 100%;
        height: 150px;
        position: relative;
    }
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        gap: 40px;
        width: 100%;
        height: 100%;
        padding: 10px;
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
