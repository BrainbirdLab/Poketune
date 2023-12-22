<script>
    import Range from "$lib/components/Range.svelte";
import SelectInstrument from "$lib/components/SelectInstrument.svelte";
    import { onMount } from 'svelte';

    let ready = false;

    onMount(() => {
        ready = true;
    });

</script>

{#if ready}
<div class="container">
    <SelectInstrument />
</div>
{/if}

<style lang="scss">

    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: min(100vw, 850px);
        height: 100%;
        overflow: hidden;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: -1;
    }
</style>
