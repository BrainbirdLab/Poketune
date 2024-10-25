<script>
    import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { lastPage, selectedInstrument } from "$lib/store.svelte";
    
    selectedInstrument.value = "none";
    lastPage.value = "/";
</script>

<SelectInstrument />