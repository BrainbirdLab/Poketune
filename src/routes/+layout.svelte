<script lang="ts">
    import "$lib/global.scss";
    import { onDestroy, onMount } from "svelte";
    import { showToastMessage } from "domtoastmessage";

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

    let wakeLock: WakeLockSentinel | null = null;

    onMount(async () => {
        detectSWUpdate();
        //showToastMessage("App loaded");
        if (navigator.wakeLock){
            wakeLock = await navigator.wakeLock.request("screen");
        } else {
            showToastMessage("Wake lock not supported");
        }
    })

    onDestroy(() => {
        wakeLock?.release();
    })
</script>

<svelte:body on:contextmenu|preventDefault></svelte:body>

<div class="container">
    <slot/>
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        overflow: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
</style>