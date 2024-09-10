<script>
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { lastPage, selectedInstrument } from "$lib/store";
    
    selectedInstrument.set("none");
    lastPage.set("/");
</script>

<SelectInstrument />