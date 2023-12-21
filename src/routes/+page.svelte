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

{#if $selectedInstrument != "None"}
<button in:fly={{x: -10}} class="changeInstrument" on:click={()=>{selectedInstrument.set("None")}}>
    <div class="lab">Change Instrument</div>
    <div class="current">
        <img src="/images/{$selectedInstrument}(Custom).png" alt="{$selectedInstrument}" width="60px" />
        <div class="name">{$selectedInstrument}</div>
    </div>
</button>
{/if}

<div class="container">
    {#if $selectedInstrument == "None"}
        <SelectInstrument />
    {:else if $selectedInstrument != "Metronome"}
    <Tuner/>
    {:else}
        Under Construction 🚧
    {/if}
</div>
{/if}

<style lang="scss">

    .changeInstrument {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        top: 2px;
        gap: 5px;
        right: 0;
        padding: 0 10px;
        background: transparent;
        border: none;
        outline: none;

        .lab{
            font-size: 0.8rem;
            font-weight: 700;
            color: #ffffff;
            filter: drop-shadow(0px 0px 50px #000000);
        }

        .current{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            img{
                width: 35px;
                position: relative;
            }
            .name{
                font-size: 0.8rem;
                position: relative;
                font-weight: 700;
                color: #ffffff;
                filter: drop-shadow(0px 0px 50px #000000);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
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
