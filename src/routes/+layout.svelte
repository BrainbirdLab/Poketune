<script lang="ts">
    import "$lib/global.scss";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import NavigationIndicator from "$lib/components/NavigationIndicator.svelte";
    import Logo from "$lib/components/logo.svelte";

    let loaded = false;

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

    let timeout: number;

    onMount(async () => {
        try{
            detectSWUpdate();
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                loaded = true;
            }, 600);
        } catch(e){
            console.log(e);
        }
    });
</script>

<svelte:body on:contextmenu|preventDefault></svelte:body>

<NavigationIndicator/>

<div class="container">
{#if !loaded}
    <div class="preloader" in:fly|global={{y: 20, duration: 300}} out:fly={{y: 20}}>
        <Logo size={50}/>
    </div>
{:else}
    <slot/>
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