<script lang="ts">
    import { goto } from "$app/navigation";
    import FreguencyGenerator from "$lib/components/FreguencyGenerator.svelte";
    import Metronome from "$lib/components/Metronome.svelte";
    import Tuner from "$lib/components/Tuner.svelte";
    import { selectedInstrument, type InstrumentTypes, lastPage } from "$lib/store";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    export let data;
    selectedInstrument.set(data.name as InstrumentTypes);

    let mounted = false;
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
    <button in:fly|global={{x: -10}} class="goback" on:click={()=>{
        selectedInstrument.set("none");
        if ($lastPage != "/"){
            lastPage.set("/");
            goto("/", { replaceState: true });
        } else {
            history.back();
        }
    }}>
        <i class="fa-solid fa-caret-left fa-fw"></i>
    </button>
    {#if $selectedInstrument != "none"}
    <div class="current" in:fly|global={{x: 10}}>
        <img src="/images/{$selectedInstrument} (Mini).png" alt="{$selectedInstrument}" width="60px" />
        <div class="name">{$selectedInstrument}</div>
    </div>
    {/if}
</div>
{#if $selectedInstrument == "Metronome"}
    <Metronome/>
{:else if $selectedInstrument == "Frequency"}
    <FreguencyGenerator/>
{:else}
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
</style>