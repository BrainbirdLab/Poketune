<script lang="ts">
    //import animation libs to fly in the instrument buttons
    import { fade, fly } from 'svelte/transition';;
    import {instrumentNames} from '$lib/tuner';
    import {selectedInstrument} from '$lib/store';

</script>

<div class="title" in:fly={{x: 10}}>
    <div class="t">
        PokeTune
    </div>
    <img src="/images/icon(Custom).png" alt="Logo" class="logo" width="50px" />
</div>
<div class="wrapper">
    <div class="instruments">
        {#each instrumentNames as instrument, i}
            <div class="instrument" in:fly|global={{y: 100*(i+1)}}>
                <input type="radio" id="{instrument}" name="instrument" bind:group={$selectedInstrument} value={instrument} />
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label for="{instrument}">
                    <img src="/images/{instrument}(Custom).png" alt="{instrument}">
                    <span>{instrument}</span>
                </label>
            </div>
        {/each}
    </div>
</div>
<div class="footer" in:fade>
    <a href="https://github.com/itsfuad/Poketune" target="_blank" rel="noopener noreferrer">
        View on GitHub
    </a>
</div>

<style lang="scss">
    .title {
        font-size: 1.3rem;
        color: #fff;
        font-weight: 700;
        display: flex;
        padding: 0px 10px 0 10px;
        gap: 10px;
        width: min(100vw, 500px);
        height: 35px;
        align-items: center;
        justify-content: flex-start;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        width: 100%;
        background: var(--primary);

        .t{
            display: flex;
            align-items: center;
            gap: 10px;
        }
    }
    .footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px;
        text-align: center;
        font-size: 12px;
        color: #fff;
        background: var(--primary);
        a {
            color: #fff;
            text-decoration: underline;
        }
    }

    .wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        align-content: center;
        height: 100vh;
        overflow: hidden;
    }

    .instruments {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        gap: 25px;
        padding: 30px 10px;
        overflow: scroll;
        align-content: flex-start;
    }

    .instrument {
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: clamp(100px, 20vw, 160px);
        aspect-ratio: 1/1.3;
        align-items: center;
        border-radius: 10px;
        transition: 100ms ease-in-out;

        img{
            width: 100%;
            height: 100%;
            object-fit: contain;
            display: block;
        }
    }

    .instrument input {
        display: none;
    }

    .instrument label {
        color: #fff;
        font-weight: 700;
        cursor: pointer;
        width: 100%;
        height: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 5px;
        align-items: center;
    }

    .instrument:has(input[type=radio]:checked) {
    
        transform: scale(0.95);
        transition: 100ms ease-in-out;
    }

</style>
