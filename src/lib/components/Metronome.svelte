
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Range from "./Range.svelte";
    import { fly } from "svelte/transition";
    import {writable} from "svelte/store";

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

    onMount(() => {

        let s = localStorage.getItem('snareIndexes'); // [0, 1, 0, 1, 0, 1, 0, 1]

        if (s) {
            snareIndexes = JSON.parse(s);
        } else {
            snareIndexes = Array.from({length: $pattern}, (_, i) => snareIndexes[i] || 0);
        }
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
            scheduleNextBeat();
        } else {
            index = -1;
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

    onDestroy(() => {
        clearTimeout(timeoutId);
        unsubPattern();
    });

</script>

<div class="wrapper" in:fly|global={{y: -10}}>

    <div class="metronome">
        <img src="/images/metronome-body.png" alt="body">
        <img id="hand" src="/images/metronome-hand.png" alt="needle" class="needle" style="transform: rotate({playing ? 20*tickDirection : 0}deg); transition: {(60 / bpm) * 1000}ms ease-in-out;">
    </div>

    <div class="beats" use:selectSnare>
        {#each Array.from({length: $pattern}) as _, i}
            <div class="beat {snareIndexes[i] === 1 ? 'snare' : ''} {playing && index == i ? 'playing' : ''}" data-beat={i}>{i+1}</div>
        {/each}
    </div>

    <div class="inputs">
        <div class="input">
            <div class="label">BPM <i class="fa-solid fa-drum"></i></div>
            <Range fieldName="bpm" bind:value={bpm} min={40} max={400} step={5}/>
        </div>
        <div class="input">
            <div class="label">Pattern <i class="fa-solid fa-dice"></i></div>
            <Range fieldName="pattern" bind:value={$pattern} min={3} max={16} step={1} reference={4}/>
        </div>
    </div>
    <div class="play pause">
        <button class="startButton" class:stop={playing} on:click={play}>
            {#if playing}
            <i class="fa-solid fa-pause"></i>
            {:else}
            <i class="fa-solid fa-play"></i>
            {/if}
        </button>
    </div>
</div>


<style lang="scss">

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

    .metronome{
        position: relative;
        width: 150px;
        height: 120px;
        overflow: hidden;
        img{
            width: 100%;
            height: 150px;
            aspect-ratio: 1/1;
            display: block;
            position: absolute;
            z-index: 1;
            &#hand{
                transform-origin: center;
            }
        }

        //shadow of the body
        &:before{
            content: "";
            position: absolute;
            width: 100%;
            height: 10%;
            background: #00000040;
            bottom: 12%;
            left: 0;
            border-radius: 50%;
            z-index: 0;
        }

        //shadow of the needle
        #hand{
            filter: drop-shadow(-4px -2px 4px #000000e1);
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

        .input{
            .label{
                font-size: 0.7rem;
                font-weight: 700;
                i{
                    color: #b291ff;
                }
            }
            padding-bottom: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 10px;
        background: var(--primary);
        border-radius: 10px;
        margin: 10px 0;
    }

    @media (min-width: 768px){
        .metronome{
            width: 250px;
            height: 200px;
            img{
                height: 250px;
            }
        }

        .inputs{
            gap: 50px;
        }

        .beats .beat{
            font-size: 1rem;
            padding: 10px 15px;
        }
    }

</style>