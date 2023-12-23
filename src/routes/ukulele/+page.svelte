
<script lang="ts">
    import { selectedInstrument } from "$lib/store";
    import InstrumentContainer from "$lib/components/InstrumentContainer.svelte";

    selectedInstrument.set("ukulele");

</script>

<InstrumentContainer/>
