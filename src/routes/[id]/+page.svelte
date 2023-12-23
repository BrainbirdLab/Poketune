<script lang="ts">
    import { selectedInstrument, type InstrumentTypes } from "$lib/store";
    import InstrumentContainer from "$lib/components/InstrumentContainer.svelte";

    export let data;
    selectedInstrument.set(data.name.toLowerCase() as InstrumentTypes);
</script>

<InstrumentContainer/>