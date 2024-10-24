<script lang="ts">

    import BassImage from "./Icons/BassImage.svelte";
    import ChromaticImage from "./Icons/ChromaticImage.svelte";
    import FrequencyImage from "./Icons/FrequencyImage.svelte";
    import GuitarImage from "./Icons/GuitarImage.svelte";
    import MetronomeImage from "./Icons/MetronomeImage.svelte";
    import UkuleleImage from "./Icons/UkuleleImage.svelte";

    interface Props {
        name: string;
        size?: number;
    }

    let { name, size }: Props = $props();

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