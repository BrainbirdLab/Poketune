<script lang="ts">
    import { selectedInstrument, type InstrumentTypes, sentenceCase } from "$lib/store";
    import InstrumentContainer from "$lib/components/InstrumentContainer.svelte";

    export let data;
    selectedInstrument.set(data.name.toLowerCase() as InstrumentTypes);
</script>

<svelte:head>
    <title>{sentenceCase(data.name)}</title>
    <!-- Update icon -->
    <link rel="icon" type="image/png" href="/images/{data.name.toLowerCase()}(custom).png" />
</svelte:head>

<InstrumentContainer/>