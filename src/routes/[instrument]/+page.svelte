
<script lang="ts">
    import { selectedInstrument, type InstrumentTypes } from "$lib/store";
    import Metronome from "$lib/components/Metronome.svelte";
    import Tuner from "$lib/components/Tuner.svelte";
    import { fly } from "svelte/transition";
    import { onMount } from "svelte";

    export let data;

    selectedInstrument.set(data.instrument as InstrumentTypes);

    let ready = false;

    onMount(() => {
        ready = true;
    });
</script>


{#if ready}

<div class="container" transition:fly={{y: 10}}>
    {#if $selectedInstrument != "None"}
    <a href="/" in:fly|global={{x: -10}} class="goback" on:click={()=>{selectedInstrument.set("None")}}>
        <i class="fa-solid fa-caret-left fa-fw"></i>
    </a>
    <div class="current">
        <img src="/images/{$selectedInstrument}(Custom).png" alt="{$selectedInstrument}" width="60px" />
        <div class="name">{$selectedInstrument}</div>
    </div>
    {/if}
    {#if $selectedInstrument != "Metronome"}
        <Tuner/>
    {:else}
        <Metronome/>
    {/if}
</div>
{/if}

<style lang="scss">
    .goback {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        position: absolute;
        top: 2px;
        gap: 5px;
        left: 0;
        width: 45px;
        height: 45px;
        margin: 2px;
        text-decoration: none;
        font-size: 2rem;
        //background: #607d8b28;
        border-radius: 50%;

        &:hover{
            background: #607d8b28;
        }

        i{
            color: #607d8b;
        }
    }

    .current{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        position: absolute;
        top: 5px;
        right: 5px;

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
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: min(100vw, 850px);
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
</style>