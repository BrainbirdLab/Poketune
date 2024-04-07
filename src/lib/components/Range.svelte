<script lang="ts">
    import { afterUpdate, onMount } from "svelte";

    export let min: number;
    export let max: number;
    export let defaultVal: number;
    export let fieldName: string;
    export let value: number;
    export let fastStep: number = 5;
    export let reference: number = 0;
    export let unit: string = "";
    export let showSign: boolean = false;
    export let save: boolean = true;

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

    afterUpdate(() => {
        if (!save){
            return;
        }
        if (localStorage) {
            localStorage.setItem(fieldName, value.toString());
        }
    });

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

<div class="range {fieldName}">
    <button
        class="updateButton"
        on:mousedown|preventDefault={() => startUpdating(-1)}
        on:mouseup|preventDefault={stopUpdating}
        on:mouseleave|preventDefault={stopUpdating}
        on:touchstart|preventDefault={(e) => startUpdating(-1)}
        on:touchend|preventDefault={stopUpdating}
        on:touchcancel|preventDefault={stopUpdating}
    >
        <i class="fa-solid fa-minus"></i>
    </button>
    <div class="value">
        {#key value}
            <div class="main" style="width: {max.toString().length + 2}ch;">
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
        class="updateButton"
        on:mousedown|preventDefault={() => startUpdating(1)}
        on:mouseup|preventDefault={stopUpdating}
        on:mouseleave|preventDefault={stopUpdating}
        on:touchstart|preventDefault={(e) => startUpdating(1)}
        on:touchend|preventDefault={stopUpdating}
        on:touchcancel|preventDefault={stopUpdating}
    >
        <i class="fa-solid fa-plus"></i>
    </button>
</div>

<style lang="scss">
    .reference {
        margin-left: -15px;
    }

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
