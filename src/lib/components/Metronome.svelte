
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Range from "./Range.svelte";
    import { fly } from "svelte/transition";
    import {writable} from "svelte/store";
    import MetronomeAnimated from "./Icons/MetronomeAnimated.svelte";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher();

    let bpm = 120;
    const pattern = writable(4);

    let snareIndexes: number[] = [];

    //$: snareIndexes = Array.from({length: pattern}, (_, i) => snareIndexes[i] || 0) as number[];

    let tickDirection = 1;
    
    let index = -1;
    
    let playing = false;

    const unsubPattern = pattern.subscribe((v) => {
        snareIndexes = Array.from({length: v}, (_, i) => 0);
    });

    let mounted = false;
    onMount(() => {

        let s = localStorage.getItem('snareIndexes'); // [0, 1, 0, 1, 0, 1, 0, 1]

        if (s) {
            snareIndexes = JSON.parse(s);
        } else {
            snareIndexes = Array.from({length: $pattern}, (_, i) => snareIndexes[i] || 0);
        }

        mounted = true;
    });
    

    const context = new AudioContext();
    
    function playSound(high: boolean = false) {
        //make a sound from raw frequency
        const o = context.createOscillator();
        const g = context.createGain();
        o.connect(g);
        o.type = 'sine';
        o.frequency.value = high ? 1000 : 500;
        g.connect(context.destination);
        o.start(0);
        g.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.03);
        //stop the sound after 0.03 seconds
        o.stop(context.currentTime + 0.03);
    }

    let timeoutId: number;

    function scheduleNextBeat() {
        timeoutId = setTimeout(() => {
            index++;
            //reset the index if it's out of bounds
            if (index >= snareIndexes.length) {
                index = 0;
            }

            tickDirection *= -1;
            const bt = snareIndexes[index] == 1;
            //console.log(bt, index, snareIndexes[index], snareIndexes);
            if (bt) {
                playSound(true);
            } else {
                playSound();
            }
            
            scheduleNextBeat();
        }, (60 / bpm) * 1000);
    }

    async function play() {
        playing = !playing;
        if (playing) {
            if (context.state === 'suspended') {
                await context.resume();
            }
            dispatch('keepAwake', true);
            scheduleNextBeat();
        } else {
            index = -1;
            dispatch('keepAwake', false);
            clearTimeout(timeoutId);
        }
    }

    function selectSnare(node: HTMLElement) {
        
        node.onclick = (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('beat')) {
                const index = Number(target.dataset.beat) as number;
                snareIndexes[index] = snareIndexes[index] == 1 ? 0 : 1;
                localStorage.setItem('snareIndexes', JSON.stringify(snareIndexes));
            }
        };

        return {
            destroy() {
                node.onclick = null;
            }
        };
    }

    let clickTimes: number[] = [];

    let tapBpm = false;

    function calculateBpm() {

        //playSound(false);

        let currentTime = Date.now();

        //if last click was more than 3 seconds ago, clear the array
        if (clickTimes.length > 0 && currentTime - clickTimes[clickTimes.length - 1] > 3000) {
            clickTimes = [];
        }

        tapBpm = true;
        // Store the time of the click
        clickTimes.push(currentTime);

        // If there are at least 4 clicks
        if (clickTimes.length >= 4) {
            let totalBpm = 0;

            // Calculate the BPM for each pair of clicks and add it to the total
            for (let i = 1; i < clickTimes.length; i++) {
                let timeDifference = clickTimes[i] - clickTimes[i - 1]; // Time difference in milliseconds
                let beatsPerMillisecond = 1 / timeDifference;
                totalBpm += beatsPerMillisecond * 60000; // Convert to beats per minute
            }

            const _bpm = Math.round(totalBpm / (clickTimes.length - 1));

            if (_bpm < 40){
                bpm = 40;
            } else if (_bpm > 400) {
                bpm = 400;
            } else {
                bpm = _bpm;
            }

            // Remove the oldest click time
            clickTimes.shift();
        }
    }

    onDestroy(() => {
        clearTimeout(timeoutId);
        unsubPattern();
    });

</script>

{#if mounted}
<div class="wrapper" in:fly|global={{y: -10}}>

    <MetronomeAnimated style="transform: rotate({playing ? 20*tickDirection : 0}deg); transition: {(60 / bpm) * 1000}ms ease-in-out;" />

    <div class="beats" use:selectSnare>
        <div class="label">Beats <i class="fa-solid fa-drum"></i></div>
        <div class="beatsContainer">
            {#each Array.from({length: $pattern}) as _, i}
                <div class="beat {snareIndexes[i] === 1 ? 'snare' : ''} {playing && index == i ? 'playing' : ''}" data-beat={i}>{i+1}</div>
            {/each}
        </div>
    </div>

    <div class="inputs">
        <div class="input">
            <div class="label">BPM <i class="fa-solid fa-drum"></i></div>
            <Range fieldName="bpm" bind:value={bpm} min={40} defaultVal={120} max={400} fastStep={10}/>
        </div>
        <div class="input">
            <div class="label">Pattern <i class="fa-solid fa-dice"></i></div>
            <Range fieldName="pattern" bind:value={$pattern} min={3} defaultVal={4} max={16} fastStep={2} reference={4}/>
        </div>
    </div>

    <div class="group">
        <button class="beatButton"
        class:pressed={tapBpm}
            on:mousedown|preventDefault={calculateBpm}
            on:mouseup|preventDefault={() => tapBpm = false}
            on:touchstart|preventDefault={calculateBpm}
            on:touchend|preventDefault={() => tapBpm = false}
        >
            <i class="fa-solid fa-drum"></i>
            <div class="label">
                Tap to change BPM
            </div>
        </button>
    
        <div class="play pause">
            <button class="beatButton" class:stop={playing} on:click={play}>
                {#if playing}
                <i class="fa-solid fa-pause"></i>
                <div class="label">Stop</div>
                {:else}
                <i class="fa-solid fa-play"></i>
                <div class="label">Start</div>
                {/if}
            </button>
        </div>
    </div>

</div>
{/if}

<style lang="scss">

    .group{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        flex-wrap: wrap;
        padding: 10px;
    }

    .beats{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        max-width: 650px;
        padding: 10px;

        .beatsContainer{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            flex-wrap: wrap;
        }

        .beat{
            background: #182c44;
            border-radius: 10px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 2px solid transparent;
            font-size: 0.8rem;
            transition: 100ms ease-in-out;
            font-weight: 700;

            &.playing{
                border: 2px solid #b291ff;
            }

            &.snare{
                background: #b291ff40;
            }
        }
    }

    .inputs{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        flex-wrap: wrap;
        padding: 10px;
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        //justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 10px;
        background: var(--primary);
        border-radius: 10px;
        margin: 10px 0;
        justify-content: safe center;
        overflow-y: scroll;
        min-height: max-content;
    }

    @media (min-width: 768px){

        .inputs{
            gap: 50px;
        }

        .beats .beat{
            font-size: 1rem;
            padding: 10px 15px;
        }
    }

</style>