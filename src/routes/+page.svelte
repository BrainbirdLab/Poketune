<script>

    import Tuner from "$lib/components/Tuner.svelte";
    import {selectedInstrument} from "$lib/store";

</script>

<div class="container">
    <div class="title">
        <div class="t">
            PokeTune <img src="/images/icon(Custom).png" alt="Logo" width="50px" />
        </div>
        <div class="instrument">
            <img src="/images/{$selectedInstrument}(Custom).png" alt="{$selectedInstrument}" width="60px" />
            <div class="name">{$selectedInstrument}</div>
        </div>
    </div>
    <Tuner />
</div>

<style lang="scss">
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
        justify-content: space-between;

        .t{
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .instrument {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 100%;
            width: 60px;
            justify-content: center;
            .name{
                position: absolute;
                font-size: 12px;
                color: #f0c449;
                bottom: -15px;
            }
        }
    }
</style>
