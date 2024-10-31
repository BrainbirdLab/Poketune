
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Range from "./controls/Range.svelte";
    import { fly } from "svelte/transition";
    import MetronomeAnimated from "./Icons/MetronomeAnimated.svelte";
    import { flip } from "svelte/animate";
    import { activateWakeLock } from "$lib/store.svelte";

    let bpm = $state(120);

    let tickDirection = $state(1);
    
    let index = $state(-1);
    
    let isPlaying = $state(false);

    let mounted = $state(false);
    
    let clickTimes: number[] = [];
    
    let tapBpm = $state(false);

    let pattern = $state(4);
    let snareIndexes: number[] = $state([]);

    onMount(() => {
        
        let s = localStorage.getItem('snareIndexes');

        let parsedData: number[] = [];

        try {
            if (s) {
                parsedData = JSON.parse(s);
                //if not format of array then throw error
                if (!Array.isArray(parsedData) || parsedData.some(i => !([0, 1].includes(i)))) {
                    throw new Error('Invalid format');
                }
            } else {
                parsedData = Array.from({length: 4}, () => 0);
            }
        } catch (_){
            console.log(_);
            parsedData = Array.from({length: 4}, () => 0);
        }

        snareIndexes = parsedData;

        mounted = true;
    });

    const audioContext = new AudioContext();
    
    function playSound(high: boolean = false) {
        //make a sound from raw frequency
        const o = audioContext.createOscillator();
        const g = audioContext.createGain();
        o.connect(g);
        o.type = 'sine';
        o.frequency.value = high ? 1000 : 500;
        g.connect(audioContext.destination);
        o.start(0);
        g.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
        //stop the sound after 0.03 seconds
        o.stop(audioContext.currentTime + 0.03);
    }

    let timeoutId: number = 0;

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
        isPlaying = !isPlaying;
        if (isPlaying) {
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            activateWakeLock.value = true;
            scheduleNextBeat();
        } else {
            index = -1;
            activateWakeLock.value = false;
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

    function calculateBpm() {

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

    function onChange(val: number) {
        if (val == snareIndexes.length) {
            return;
        }
        if (val > snareIndexes.length) {
            snareIndexes.push(0);
        } else if (val < snareIndexes.length) {
            snareIndexes.pop();
        }
        localStorage.setItem('snareIndexes', JSON.stringify(snareIndexes));
    }

</script>

<svelte:window 

onkeypress={(e) => {
    //if space is pressed, start/stop the tuner
    if (e.key == " ") {
        play();
    } else if (e.key == "Escape") {
        history.back();
    }
}} 

onkeydown={(e) => {
    if (e.key == "b") {
        calculateBpm();
    }
}}

onkeyup={(e) => {
    if (e.key == "b") {
        tapBpm = false;
    }
}}
/>

{#if mounted}
<div class="wrapper" in:fly|global={{y: -10}}>

    <MetronomeAnimated style="transform: rotate({isPlaying ? 20*tickDirection : 0}deg); transition: {(60 / bpm) * 1000}ms ease-in-out;" />

    <div class="beats" use:selectSnare>
        <div class="label">Beats <i class="fa-solid fa-drum"></i></div>
        <div class="beatsContainer">
            {#each snareIndexes as _, i (i)}
                <div animate:flip in:fly={{y: 10}} class="beat {snareIndexes[i] === 1 ? 'snare' : ''} {isPlaying && index == i ? 'playing' : ''}" data-beat={i}>{i+1}</div>
            {/each}
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
            <Range bind:value={pattern} {onChange} save={false} fieldName="pattern" min={3} defaultVal={4} max={16} fastStep={2} reference={4}
            highKey={"ArrowUp"}
            lowKey={"ArrowDown"}
            />
        </div>
    </div>

    <div class="group">
        <button class="beatButton"
        title="Shortcut key: B"
        class:pressed={tapBpm}
            onmousedown={(e) => {e.preventDefault(); calculateBpm()}}
            onmouseup={(e) => {e.preventDefault(); tapBpm = false}}
            ontouchstart={(e) => {e.preventDefault(); calculateBpm()}}
            ontouchend={(e) => {e.preventDefault(); tapBpm = false}}
            onmouseleave={(e) => {e.preventDefault(); tapBpm = false}}
        >
            <i class="fa-solid fa-drum"></i>
            <div class="label">
                Tap to change BPM
            </div>
        </button>
    
        <div class="play pause" title="Shortcut key: Space">
            <button class="beatButton" class:stop={isPlaying} onclick={play}>
                {#if isPlaying}
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