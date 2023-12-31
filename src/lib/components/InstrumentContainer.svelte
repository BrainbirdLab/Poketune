<script lang="ts">
    import { selectedInstrument } from "$lib/store";
    import Metronome from "$lib/components/Metronome.svelte";
    import Tuner from "$lib/components/Tuner.svelte";
    import { fly } from "svelte/transition";
    import { onMount } from "svelte";
    import SelectInstrument from "./SelectInstrument.svelte";
    import FreguencyGenerator from "./FreguencyGenerator.svelte";
    import InstrumentPage from "./../../routes/[id]/+page.svelte";

    let ready = false;

    onMount(() => {
        ready = true;
    });
</script>

{#if ready}

<div class="container">
    {#if $selectedInstrument != "none"}
        <InstrumentPage data={{name: $selectedInstrument}}/>
    {:else}
        <SelectInstrument />
    {/if}
</div>
{/if}

<style lang="scss">

    .topbar{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
        width: 100%;
        padding: 0 10px;
        height: 60px;
    }

    .goback {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        top: 2px;
        gap: 5px;
        left: 0;
        width: 45px;
        height: 45px;
        text-decoration: none;
        border: none;
        outline: none;
        font-size: 2rem;
        background: none;
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
        width: min(100vw, 750px);
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
</style>