<script>
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { selectedInstrument } from "$lib/store";
    
    selectedInstrument.set("none");
</script>

<svelte:head>
    <title>PokeTune</title>
    <link rel="icon" type="image/png" href="/images/icon (Mini).png" />
</svelte:head>

<SelectInstrument />