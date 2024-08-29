
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Range from "./controls/Range.svelte";
    import { fly } from "svelte/transition";
    import MetronomeAnimated from "./Icons/MetronomeAnimated.svelte";
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher();

    let bpm = 120;

    let pattern: number;

    let snareIndexes: number[] = [];

    $: {
        //add 0s to the end of the array if the pattern is bigger than the snareIndexes
        if (snareIndexes.length < pattern) {
            snareIndexes = [...snareIndexes, ...Array.from({length: pattern - snareIndexes.length}, () => 0)];
        } else {
            snareIndexes = snareIndexes.slice(0, pattern);
        }
    }

    let tickDirection = 1;
    
    let index = -1;
    
    let playing = false;

    let mounted = false;

    onMount(() => {

        let s = localStorage.getItem('snareIndexes'); // [0, 1, 0, 1, 0, 1, 0, 1]

        if (localStorage.getItem('pattern')) {
            pattern = parseInt(localStorage.getItem('pattern') as string);
        } else {
            pattern = 4;
            localStorage.setItem('pattern', pattern.toString());
        }

        try {
            if (s) {
                snareIndexes = JSON.parse(s);
                //if not format of array then throw error
                if (!Array.isArray(snareIndexes) || snareIndexes.some(i => ![0, 1].includes(i))) {
                    throw new Error('Invalid format');
                }
                

            }
        } catch (_){
            

            snareIndexes = Array.from({length: pattern}, () => 0);
            localStorage.setItem('snareIndexes', JSON.stringify(snareIndexes));
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
    });

    let bpmBtn: HTMLButtonElement;

</script>

<svelte:window on:keypress={(e) => {
    //if space is pressed, start/stop the tuner
    if (e.key == " ") {
        play();
    } else if (e.key == "Escape") {
        history.back();
    }
}} 
on:keydown={(e) => {
    if (e.key == "g") {
        calculateBpm();
    }
}}
on:keyup={(e) => {
    if (e.key == "g") {
        tapBpm = false;
    }
}}
/>

{#if mounted}
<div class="wrapper" in:fly|global={{y: -10}}>

    <MetronomeAnimated style="transform: rotate({playing ? 20*tickDirection : 0}deg); transition: {(60 / bpm) * 1000}ms ease-in-out;" />

    <div class="beats" use:selectSnare>
        <div class="label">Beats <i class="fa-solid fa-drum"></i></div>
        <div class="beatsContainer">
            {#key snareIndexes}
            {#each snareIndexes as _, i}
                <div class="beat {snareIndexes[i] === 1 ? 'snare' : ''} {playing && index == i ? 'playing' : ''}" data-beat={i}>{i+1}</div>
            {/each}
            {/key}
        </div>
    </div>

    <div class="inputs">
        <div class="input" title="Shortcut key: Left and right Arrow">
            <div class="label">BPM <i class="fa-solid fa-drum"></i></div>
            <Range fieldName="bpm" bind:value={bpm} min={40} defaultVal={120} max={400} fastStep={10}
                highKey={"ArrowRight"}
                lowKey={"ArrowLeft"}
            />
        </div>
        <div class="input" title="Shortcut key: Up and down Arrow">
            <div class="label">Pattern <i class="fa-solid fa-dice"></i></div>
            <Range fieldName="pattern" bind:value={pattern} min={3} defaultVal={4} max={16} fastStep={2} reference={4}
            highKey={"ArrowUp"}
            lowKey={"ArrowDown"}
            />
        </div>
    </div>

    <div class="group">
        <button class="beatButton"
        title="Shortcut key: G"
        bind:this={bpmBtn}
        class:pressed={tapBpm}
            on:mousedown|preventDefault={calculateBpm}
            on:mouseup|preventDefault={() => tapBpm = false}
            on:touchstart|preventDefault={calculateBpm}
            on:touchend|preventDefault={() => tapBpm = false}
            on:mouseleave|preventDefault={() => tapBpm = false}
        >
            <i class="fa-solid fa-drum"></i>
            <div class="label">
                Tap to change BPM
            </div>
        </button>
    
        <div class="play pause" title="Shortcut key: Space">
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