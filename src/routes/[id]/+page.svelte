<script lang="ts">
    import { selectedInstrument, type InstrumentTypes, sentenceCase } from "$lib/store";
    export let data;
    selectedInstrument.set(data.name.toLowerCase() as InstrumentTypes);
</script>

<svelte:head>
    <title>{sentenceCase(data.name)}</title>
    <link rel="icon" type="image/png" href="/images/{data.name.toLowerCase()}(custom).png" />
</svelte:head>