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
    <div class="title" in:fly={{x: 10}}>
        <div class="t">
            PokeTune <img src="/images/icon(Custom).png" alt="Logo" width="50px" />
        </div>
        {#if $selectedInstrument != "None"}
            <button class="instrument" on:click={()=>{selectedInstrument.set("None")}}>
                <img src="/images/{$selectedInstrument}(Custom).png" alt="{$selectedInstrument}" width="60px" />
                <div class="name">{$selectedInstrument}</div>
            </button>
        {/if}
    </div>
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
        height: 100vh;
    }

    button{
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .tunerWrapper{
        width: min(100vw, 450px);
    }

    .title {
        font-size: 1.4rem;
        color: #fff;
        font-weight: 700;
        position: absolute;
        background: var(--primary);
        top: 0;

        display: flex;
        padding: 10px;
        gap: 10px;
        width: min(100vw, 500px);
        align-items: center;
        justify-content: space-between;

        .t{
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .instrument {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            width: 100px;
            img{
                width: 60px;
            }
            .name{
                position: absolute;
                font-size: 1.1rem;
                font-weight: 700;
                color: #ffffff;
                filter: drop-shadow(0px 0px 50px #000000);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
</style>
