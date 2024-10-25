<script lang="ts">
    import { goto } from "$app/navigation";
    import FreguencyGenerator from "$lib/components/FreguencyGenerator.svelte";
    import Metronome from "$lib/components/Metronome.svelte";
    import Tuner from "$lib/components/Tuner.svelte";
    import { selectedInstrument, type InstrumentTypes, lastPage } from "$lib/store.svelte.ts";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let { data } = $props();
    
    let mounted = $state(false);

    selectedInstrument.value = data.name;

    onMount(() => {
        mounted = true;
    });

</script>

<svelte:head>
    <title>{data.name}</title>
    <link rel="icon" type="image/png" href="/images/{data.name} (Mini).png" />
</svelte:head>

{#if mounted}
<div class="topbar">
    <button aria-label="back" in:fly|global={{x: -10}} class="goback" onclick={()=>{
        selectedInstrument.value = "none";
        if (lastPage.value != "/"){
            lastPage.value = "/";
            goto("/", { replaceState: true });
        } else {
            history.back();
        }
    }}>
        <i class="fa-solid fa-caret-left fa-fw"></i>
    </button>
    {#if selectedInstrument.value != "none"}
    <div class="current" in:fly|global={{x: 10}}>
        <div class="name">{selectedInstrument.value}</div>
    </div>
    {/if}
</div>
{#if selectedInstrument.value == "Metronome"}
    <Metronome/>
{:else if selectedInstrument.value == "Frequency"}
    <FreguencyGenerator/>
{:else if selectedInstrument.value != "none"}
    <Tuner/>
{/if}
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
        left: 50%;
        transform: translateX(-50%);
        right: 0;
        z-index: 1;
        width: min(100vw, 850px);
        padding: 0 10px;
        height: 50px;
        background: #0b1d37;
    }

    .goback {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        gap: 5px;
        width: 40px;
        height: 40px;
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
        height: 100%;

        .name{
            font-size: 1rem;
            position: relative;
            //font-weight: 700;
            color: #ffffff;
            filter: drop-shadow(0px 0px 50px #000000);
        }
    }
</style>