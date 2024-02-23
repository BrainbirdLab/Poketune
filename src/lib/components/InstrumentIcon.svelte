<script lang="ts">
    import type { InstrumentTypes } from "$lib/store";
    import BassImage from "./BassImage.svelte";
    import ChromaticImage from "./ChromaticImage.svelte";
    import FrequencyImage from "./FrequencyImage.svelte";
    import GuitarImage from "./GuitarImage.svelte";
    import MetronomeImage from "./MetronomeImage.svelte";
    import UkuleleImage from "./UkuleleImage.svelte";

    export let name: string;
    export let size: number = 100;
</script>

{#if name === "Guitar"}
<GuitarImage {size}/>
{:else if name === "Bass"}
<BassImage {size}/>
{:else if name === "Ukulele"}
<UkuleleImage {size}/>
<!-- svelte-ignore missing-declaration -->
{:else if name === "Chromatic"}
<ChromaticImage {size}/>
{:else if name === "Metronome"}
<MetronomeImage {size}/>
{:else if name === "Frequency"}
<FrequencyImage {size}/>
{/if}