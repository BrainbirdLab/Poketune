<script lang="ts">
    import "$lib/global.scss";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import NavigationIndicator from "$lib/components/NavigationIndicator.svelte";
    import Logo from "$lib/components/logo.svelte";
    import { activateWakeLock } from "$lib/store.svelte";

    let { children } = $props();

    let loaded = $state(false);

    async function detectSWUpdate(){
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    console.log("New update available");
                    showToastMessage("App updated");
                }
            });
        });
    }

    let awakeLock: WakeLockSentinel | null = null;

    function keepAwake(val: boolean){
        if (val){
            navigator.wakeLock.request("screen").then((lock) => {
                awakeLock = lock;
                showToastMessage("Screen Wake locked");
            });
        } else {
            if (awakeLock){
                awakeLock.release();
                showToastMessage("Screen Wake released");
            }
        }
    }

    onMount(async () => {
        try{
            detectSWUpdate();
            loaded = true;
        } catch(e){
            console.log(e);
        }
    });

    $effect(() => {
        keepAwake(activateWakeLock.value);
    });

    onDestroy(() => {
        keepAwake(false);
    });
</script>

<svelte:body oncontextmenu={(e) => e.preventDefault()}></svelte:body>

<NavigationIndicator/>

<div class="container">
{#if !loaded}
    <div class="preloader" in:fly|global={{y: 20, duration: 300}} out:fly={{y: 20}}>
        <Logo size={50}/>
    </div>
{:else}
    {@render children()}
{/if}
</div>


<style>

    .preloader {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        position: fixed;
        inset: 0;
        z-index: 1000;
    }

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }
</style>