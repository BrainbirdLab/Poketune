<script lang="ts">
    //import animation libs to fly in the instrument buttons
    import { fade, fly } from 'svelte/transition';;
    import {instrumentNames} from '$lib/tuner';
    import {selectedInstrument} from '$lib/store';

</script>


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
        height: 77vh;
        overflow: hidden;
    }

    .instruments {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: flex-start;
        gap: 5%;
        padding: 30px;
        overflow: scroll;
        align-content: flex-start;
    }

    .instrument {
        display: flex;
        max-width: 90vw;
        max-height: 90vh;
        flex-direction: row;
        justify-content: center;
        min-width: 150px;
        align-items: center;
        border-radius: 10px;
        transition: 100ms ease-in-out;
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
