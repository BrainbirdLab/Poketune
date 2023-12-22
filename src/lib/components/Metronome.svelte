
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import Range from "./Range.svelte";
    import {writable, type Unsubscriber, type Writable} from "svelte/store";
    import { fly } from "svelte/transition";

    const bpm = writable(120);
    const pattern = writable(4);

    let tickDirection = 1;
    
    let index = -1; 
    
    let playing = false;
    
    const patterns: Writable<{[key: string]: boolean}> = writable({});
    

    let bpmUnsub: Unsubscriber;
        
    let patternUnsub: Unsubscriber;

    let allPatternsUnsub: Unsubscriber;

    function patternSaver(val: number){
        patterns.set({});
        for (let i = 0; i < val; i++) {
            patterns.update((val) => {
                val[i] = false;
                return val;
            });
        }
        localStorage.setItem('pattern', val.toString());
    }

    function bpmSaver(val: number){
        localStorage.setItem('bpm', val.toString());
    }

    function allPatternsSaver(val: {[key: string]: boolean}){
        localStorage.setItem('activePattern', JSON.stringify(val));
    }

    onMount(() => {

        const b = localStorage.getItem('bpm');
        const p = localStorage.getItem('pattern');
        const a = localStorage.getItem('activePattern');
        
        bpmUnsub = bpm.subscribe(bpmSaver);
        if (b) {
            bpm.set(Number(b));
        } else {
            bpm.set(120);
        }
        patternUnsub = pattern.subscribe(patternSaver);
        if (p) {
            pattern.set(Number(p));
        } else {
            pattern.set(4);
        }
        allPatternsUnsub = patterns.subscribe(allPatternsSaver);
        if (a) {
            patterns.set(JSON.parse(a));
        } else {
            patterns.set({});
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
            tickDirection *= -1;
            const bt = $patterns[index % $pattern];
            if (bt) {
                playSound(true);
            } else {
                playSound();
            }

            //reset the index
            if (index >= $pattern) {
                index = 0;
            }

            scheduleNextBeat();
        }, (60 / $bpm) * 1000);
    }

    async function play() {
        playing = !playing;
        if (playing) {
            if (context.state === 'suspended') {
                await context.resume();
            }
            scheduleNextBeat();
        } else {
            clearTimeout(timeoutId);
        }
    }

    function selectSnare(node: HTMLElement) {
        
        node.onclick = (e) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('beat')) {
                const index = target.dataset.beat as string;
                patterns.update((val) => {
                    val[index] = !val[index];
                    return val;
                });
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
        bpmUnsub();
        patternUnsub();
        allPatternsUnsub();
    });

</script>

<div class="wrapper">

    <div class="metronome">
        <img src="/images/metronome-body.png" alt="body">
        <img id="hand" src="/images/metronome-hand.png" alt="needle" class="needle" style="transform: rotate({playing ? 20*tickDirection : 0}deg); transition: {(60 / $bpm) * 1000}ms ease-in-out;">
    </div>

    <div class="beats" use:selectSnare>
        {#each Object.entries($patterns) as pattern, i}
            <div in:fly={{y: 10}} out:fly={{y: 10, duration: 50}} class="beat" class:playing={i == index} data-beat={i} class:snare={pattern[1]}>{i+1}</div>
        {/each}
    </div>

    <div class="inputs">
        <div class="input">
            <div class="label">BPM <i class="fa-solid fa-drum"></i></div>
            <Range fieldName="bpm" bind:value={$bpm} min={40} max={400} step={5}/>
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