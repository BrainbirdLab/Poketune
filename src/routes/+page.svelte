<script>
    import InstrumentContainer from "$lib/components/InstrumentContainer.svelte";
    import { selectedInstrument } from "$lib/store";
    
    selectedInstrument.set("none");
</script>

<svelte:head>
    <title>PokeTune</title>
    <link rel="icon" type="image/png" href="/images/icon(custom).png" />
</svelte:head>

<InstrumentContainer/>
