<script lang="ts">
  import { onMount } from "svelte";

  export let min: number;
  export let max: number;
  export let fieldName: string;
  export let value: number;
  export let step: number = 1;
  export let showButtons: boolean = true;
  export let reference: number = 0;
  let intervalId: number;

  onMount(() => {
      if (value % step !== 0) {
          value = Math.round(value / step) * step;
      }
  });

  function rangeUpdate(val: number) {
      if (value + val >= min && value + val <= max) {
          value += val;
      }
  }

  function startUpdating(step: number) {
      rangeUpdate(step);
      intervalId = setInterval(() => rangeUpdate(step), 100);
  }

  function stopUpdating() {
      clearInterval(intervalId);
  }
</script>

<div class="range {fieldName}">
  {#if showButtons}
  <button class="updateButton" 
          on:mousedown={() => startUpdating(-step)} 
          on:mouseup={stopUpdating} 
          on:mouseleave={stopUpdating}>
      <i class="fa-solid fa-minus"></i>
  </button>
  {/if}
  <div class="value">
      <div class="main">{value}</div>
      {#if reference}
      <div class="reference">/{reference}</div>
      {/if}
  </div>
  {#if showButtons}
  <button class="updateButton" 
          on:mousedown={() => startUpdating(step)} 
          on:mouseup={stopUpdating} 
          on:mouseleave={stopUpdating}>
      <i class="fa-solid fa-plus"></i>
  </button>
  {/if}
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
      font-weight: 700;
      color: #fff;
      position: relative;
      z-index: 1;
  }

</style>