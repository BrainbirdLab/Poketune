<script lang="ts">
    import "$lib/global.scss";
    import { onMount } from "svelte";
    import { showPopupMessage } from "$lib/popup";

    async function detectSWUpdate(){
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    console.log("New update available");
                    showPopupMessage("App updated");
                }
            });
        });
    }

    onMount(() => {
        detectSWUpdate();
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