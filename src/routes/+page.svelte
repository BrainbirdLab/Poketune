<script>

    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import Tuner from "$lib/components/Tuner.svelte";
    import {selectedInstrument} from "$lib/store";
    import {fly} from "svelte/transition";
    import { onMount } from 'svelte';

    let ready = false;

    onMount(() => {
        ready = true;
    })
</script>

{#if ready}
<div class="container">
    {#if $selectedInstrument == "None"}
        <SelectInstrument />
    {:else}
    <div class="tunerWrapper" in:fly={{x: 100}}>
        <Tuner/>
    </div>
    {/if}
</div>
{/if}

<style lang="scss">
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .tunerWrapper{
        width: min(100vw, 450px);
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
</style>
