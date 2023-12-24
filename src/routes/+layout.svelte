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
<InstrumentContainer/>
<slot></slot>