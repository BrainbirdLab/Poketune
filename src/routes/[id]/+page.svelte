<script lang="ts">
    import { selectedInstrument, type InstrumentTypes, sentenceCase } from "$lib/store";
    export let data;
    selectedInstrument.set(data.name as InstrumentTypes);
</script>

<svelte:head>
    <title>{data.name}</title>
    <link rel="icon" type="image/png" href="/images/{data.name} (Mini).png" />
</svelte:head>