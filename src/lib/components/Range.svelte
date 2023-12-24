<script lang="ts">
    import { afterUpdate, onMount } from "svelte";

    export let min: number;
    export let max: number;
    export let fieldName: string;
    export let value: number;
    export let fastStep: number = 5;
    export let reference: number = 0;
    export let showSign: boolean = false;

    onMount(() => {
    
        const v = localStorage.getItem(fieldName);

        if (v && !isNaN(parseInt(v))) {
            value = parseInt(v);
        } else {
            value = min;
        }
        if (value < min) {
            //console.log('reset min');
            value = min;
        }
        if (value > max) {
            //console.log('reset max');
            value = max;
        }

    });
    
    afterUpdate(() => {
        if (localStorage){
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
  <button class="updateButton" 
            on:mousedown|preventDefault={() => startUpdating(-1)} 
            on:mouseup|preventDefault={stopUpdating} 
            on:touchstart|preventDefault={(e) => startUpdating(-1)}
            on:touchend|preventDefault={stopUpdating}
          >
      <i class="fa-solid fa-minus"></i>
  </button>
  <div class="value">
      <div class="main">
            {#if showSign}
            {value > 0 ? '+' : ''}
            {/if}
            {value}
      </div>
      {#if reference}
      <div class="reference">/{reference}</div>
      {/if}
  </div>
  <button class="updateButton" 
            on:mousedown|preventDefault={() => startUpdating(1)} 
            on:mouseup|preventDefault={stopUpdating} 
            on:touchstart|preventDefault={(e) => startUpdating(1)}
            on:touchend|preventDefault={stopUpdating}
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
  .divContainer{
      height: 60px;
      width: 50px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
  }

  .value{
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      font-weight: 700;
      color: #fff;
      position: relative;
      z-index: 1;
  }


  .updateButton{
        border: none;
        outline: none;
        padding: 10px;
        width: 35px;
        height: 35px;
        border-radius: 10px;
        background: var(--secondary);
        font-weight: bold;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            filter: brightness(0.9);
        }
    }

</style>