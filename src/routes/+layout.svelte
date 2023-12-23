<script lang="ts">
    import "$lib/global.scss";
    import { onMount } from "svelte";
    import InstrumentContainer from "$lib/components/InstrumentContainer.svelte";
    import { showPopupMessage } from "$lib/popup";

    async function detectSWUpdate(){
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    console.log("New update available");
                    showPopupMessage("App service updated");
                }
            });
        });
    }

    onMount(() => {
        detectSWUpdate();

        //get update from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data.type === "CACHE_UPDATED") {
                console.log("App updated");
                showPopupMessage("App updated");
            }
        });
    })
</script>

<svelte:body on:contextmenu|preventDefault></svelte:body>
<InstrumentContainer/>
<slot></slot>