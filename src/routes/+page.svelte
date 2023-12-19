<script>
    import { dev } from "$app/environment";
    import Tuner from "$lib/components/Tuner.svelte";
    import { onMount } from "svelte";


</script>

<div class="container">
    <div class="title">
        PokeTune <img src="/images/icon(Custom).png" alt="Logo" width="50px" />
    </div>
    <Tuner />
</div>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .title {
        font-size: 1.4rem;
        color: #fff;
        font-weight: 700;
        position: absolute;
        top: 0;
        display: flex;
        left: 0;
        padding: 10px;
        gap: 10px;
        width: min(100vw, 500px);
        align-items: center;
        justify-content: flex-start;
    }
</style>
