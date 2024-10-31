<script lang="ts">
    import { onMount } from "svelte";

    interface Props {
        min: number;
        max: number;
        defaultVal: number;
        fieldName: string;
        value: number;
        fastStep: number;
        reference?: number;
        unit?: string;
        showSign?: boolean;
        save?: boolean;
        highKey: "ArrowRight" | "ArrowUp" | "W" | "D";
        lowKey: "ArrowLeft" | "ArrowDown" | "S" | "A";
        onChange?: (value: number) => void ;
    }

   let { min, max, defaultVal, fieldName, value = $bindable(), fastStep = 5, reference = 0, unit = "", showSign = false, save = true, highKey, lowKey, onChange }: Props = $props();

    onMount(() => {
        if (!save){
            return;
        }
        const v = localStorage.getItem(fieldName);
        if (v && !isNaN(parseInt(v))) {
            value = parseInt(v);
        } else {
            value = defaultVal;
        }

        if (value < min) {
            value = min;
        }
        if (value > max) {
            value = max;
        }
    });

    $effect(() => {
        if (onChange){
            onChange(value);
        }
        if (save && localStorage){
            localStorage.setItem(fieldName, value.toString());
        }
    });

    function KeyListener(e: KeyboardEvent) {
        if (e.key === lowKey) {
            rangeUpdate(-1);
        } else if (e.key === highKey) {
            rangeUpdate(1);
        }
    }

    function rangeUpdate(val: number) {
        if (value + val >= min && value + val <= max) {
            value += val;
        }
    }

    let timeoutId: number;
    let intervalId: number;

    function startUpdating(step: number) {
        // Update the value once immediately
        rangeUpdate(step);
        clearTimeout(timeoutId);
        // Wait for 1 second before starting to update the value continuously
        timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                rangeUpdate(fastStep * step);
                //if value is not multiple of fastStep, round it to the nearest multiple
                if (value > min && value < max && value % fastStep !== 0) {
                    value = Math.round(value / fastStep) * fastStep;
                }
            }, 100);
        }, 500);
    }

    function stopUpdating() {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
    }
</script>

<svelte:window onkeydown={KeyListener} />

<div class="range {fieldName}">
    <button
        aria-label="decrement" 
        class="updateButton"
        onmousedown={(e) => { e.preventDefault(); startUpdating(-1)}}
        onmouseup={(e) => { e.preventDefault(); stopUpdating()}}
        onmouseleave={(e) => { e.preventDefault(); stopUpdating()}}
        ontouchstart={(e) => { e.preventDefault(); startUpdating(-1)}}
        ontouchend={(e) => { e.preventDefault(); stopUpdating()}}
        ontouchcancel={(e) => { e.preventDefault(); stopUpdating()}}
    >
        <i class="fa-solid fa-minus"></i>
    </button>
    <div class="value">
        {#key value}
            <div class="main">
                {#if showSign}
                    {value > 0 ? "+" : ""}
                {/if}
                {value}{unit}
            </div>
        {/key}
        {#if reference}
            <div class="reference">/{reference}</div>
        {/if}
    </div>
    <button
        aria-label="increment" 
        class="updateButton"
        onmousedown={(e) => { e.preventDefault(); startUpdating(1)}}
        onmouseup={(e) => { e.preventDefault(); stopUpdating()}}
        onmouseleave={(e) => { e.preventDefault(); stopUpdating()}}
        ontouchstart={(e) => { e.preventDefault(); startUpdating(1)}}
        ontouchend={(e) => { e.preventDefault(); stopUpdating()}}
        ontouchcancel={(e) => { e.preventDefault(); stopUpdating()}}
    >
        <i class="fa-solid fa-plus"></i>
    </button>
</div>

<style lang="scss">

    .range {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 130px;
        position: relative;
    }

    //snap to the nearest division on scroll
    .divContainer {
        height: 60px;
        width: 50px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .value {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 700;
        width: 5ch;
        color: #fff;
        position: relative;
        z-index: 1;
    }

    .main {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 700;
        color: #fff;
        position: relative;
        z-index: 1;
    }
</style>
