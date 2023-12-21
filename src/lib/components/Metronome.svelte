
<script lang="ts">
    let bpm = 120;
    //user can choose from may pattern
    //pattern - 1: 1, 2, 3, 4; 1, 2, 3, 4; 1, 2, 3, 4; 1, 2, 3, 4;
    //pattern - 2: 1, 2, 3; 1, 2, 3; 1, 2, 3; 1, 2, 3;
    //pattern - 3: 1, 2; 1, 2; 1, 2; 1, 2;
    //pattern - 4: 1; 1; 1; 1;
    //pattern - 5: 1, 2, 3; 1, 2, 3; 1, 2, 3, 4, 5; 1, 2, 3, 4, 5;

    //now name the pattern and put them in a object
    const patterns: {[key: string]: number[]} = {
        '4/4': [1, 2, 3, 4],
        '3/4': [1, 2, 3],
        '2/4': [1, 2],
        '1/4': [1],
        '5/4': [1, 2, 3, 1, 2, 3, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5] 
    };

    let selected = '4/4';
    let beat: HTMLElement;

    let index = -1;

    let playing = false;
    let timer: number;

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

    async function play() {
        playing = !playing;
        if (playing) {
            if (context.state === 'suspended') {
                await context.resume();
            }

            timer = setInterval(() => {
                index++;
                console.log(index);
                if (index > patterns[selected].length - 1) {
                    index = 0;
                }
                playSound(patterns[selected][index] === 1);
            }, (60 / bpm) * 1000);
        } else {
            console.log('stoped');
            clearInterval(timer);
            index = -1;
        }
    }

</script>

<div class="wrapper">
    <div class="bpm">
        <div class="label">BPM {bpm}</div>
        <!-- use range -->
        <input type="range" min="60" max="240" step="1" bind:value={bpm} />
    </div>
    <div class="pattern">
        <div class="label">Pattern</div>
        <select bind:value={selected}>
            {#each Object.keys(patterns) as pattern}
                <option value={pattern}>{pattern}</option>
            {/each}
        </select>
    </div>
    <div class="play pause">
        <button on:click={play}>
            {playing ? 'Pause' : 'Play'}
        </button>
    </div>
</div>

<div class="display">
    <div class="beat" bind:this={beat}></div>
    <div class="count">{
            playing ? patterns[selected][index] || "Starting..." : "Play to start"
        }</div>
</div>

<style lang="scss">
    .wrapper {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        justify-content: center;
        gap: 10px;
        padding: 10px;
        background: var(--primary);
        border-radius: 10px;
        margin: 10px 0;
    }

    .bpm,
    .pattern {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    .label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #ffffff;
    }

    input{
        width: 100px;
        padding: 5px 10px;
        border-radius: 5px;
        background: transparent;
        border: 1px solid #ffffff;
        color: #ffffff;
        font-size: 1rem;
        font-weight: 700;
        outline: none;
    }

    select {
        padding: 5px 10px;
        border-radius: 5px;
        background: transparent;
        border: 1px solid #ffffff;
        color: #ffffff;
        font-size: 1rem;
        font-weight: 700;
        outline: none;
    }

    .play {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
    }

    button {
        padding: 5px 10px;
        border-radius: 5px;
        background: transparent;
        border: 1px solid #ffffff;
        color: #ffffff;
        font-size: 1rem;
        font-weight: 700;
        outline: none;
        cursor: pointer;
    }

    .display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 5px;
        margin-top: 10px;
    }

    .beat {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ffffff;
        opacity: 0.5;
    }

    .count {
        font-size: 1.5rem;
        font-weight: 700;
        color: #ffffff;
    }

    @keyframes beat {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.2);
        }
        100% {
            transform: scale(1);
        }
    }
</style>