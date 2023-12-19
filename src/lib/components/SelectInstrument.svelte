<script lang="ts">
    //import animation libs to fly in the instrument buttons
    import { fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import Tuner from './Tuner.svelte';

    let instruments = ['Guitar', 'Ukulele', 'Bass', 'Chromatic'];
    let selectedInstrument: string;
    
    onMount(() => {
        //set the selected instrument to the first instrument in the list
        selectedInstrument = 'Chromatic';
    });
</script>

{#if selectedInstrument == 'Not Selected'}
    <div class="instruments">
        {#each instruments as instrument, i}
            <div class="instrument" in:fly={{y: 100*i + 100}}>
                <input type="radio" id="{instrument}" name="instrument" bind:group={selectedInstrument} value={instrument} />
                <!-- svelte-ignore a11y-label-has-associated-control -->
                <label for="{instrument}">
                    <img src="/images/{instrument}(Custom).png" alt="{instrument}">
                    <span>{instrument}</span>
                </label>
            </div>
        {/each}
    </div>
{:else if selectedInstrument && selectedInstrument != 'Not Selected'}
    <div in:fly={{x: 100}}>
        <Tuner bind:instrument="{selectedInstrument}"/>
    </div>
{/if}

<style>
    .instruments {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5%;
    }

    .instrument {
        display: flex;
        width: max(15vw, 120px);
        height: max(20vw, 200px);
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        background: #ffffff20;
        border: 3px solid #fff;
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
