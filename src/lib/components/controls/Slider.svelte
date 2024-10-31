<script lang="ts">
    // Props
    interface Props {
        min: number;
        max: number;
        value: number;
    }
    
    let { min = 0, max = 100, value = $bindable() }: Props = $props();

</script>

<div class="range">
    <input type="range" min={min} max={max} bind:value={value} />
</div>

<style lang="scss">

    .range {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        width: 100%;
    }

    input {
        background: none;
    }

    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        padding: 10px 0;
        width: 100%;
    }

    input[type="range"]:focus {
        outline: none;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background:  hsla(0, 0%, 100%, 0.07);
        border-radius: 3px;
        border: 0px solid #000000;
        z-index: 0;
    }

    input[type="range"]::-moz-range-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background:  hsla(0, 0%, 100%, 0.07);
        border-radius: 3px;
        border: 0px solid #000000;
        z-index: 0;
    }

    input[type="range"]::-ms-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
        z-index: 0;
    }

    input[type="range"]::-ms-fill-lower {
        background:  hsla(0, 0%, 100%, 0.07);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }

    input[type="range"]::-ms-fill-upper {
        background:  hsla(0, 0%, 100%, 0.07);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }

    input[type="range"]::-webkit-slider-thumb {
        box-shadow: 0px 0px 0px #000000;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--accent, #4598ff);
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
        margin-top: -6.5px;
        z-index: 2;
    }

    input[type="range"]::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--accent, #4598ff);
        cursor: pointer;
        z-index: 2;
    }

    input[type="range"]::-ms-thumb {
        margin-top: 1px;
        box-shadow: 0px 0px 0px #000000;
        border: 0px solid #2497e3;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--accent, #4598ff);
        cursor: pointer;
        z-index: 2;
    }
</style>
