
<script lang="ts">
    import { onMount } from "svelte";


  export let min: number;
  export let max: number;
  export let fieldName: string;
  export let value: number;
  export let step: number = 1;
  export let showButtons: boolean = true;
  export let reference: number = 0;

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

</script>

<div class="range {fieldName}">
  {#if showButtons}
  <button class="rangeUpdate" on:click={() => {rangeUpdate(-step)}}><i class="fa-solid fa-minus"></i></button>
  {/if}
  <div class="value">
    <div class="main">{value}</div>
    {#if reference}
      <div class="reference">/{reference}</div>
    {/if}
  </div>
  {#if showButtons}
  <button class="rangeUpdate" on:click={() => {rangeUpdate(step)}}><i class="fa-solid fa-plus"></i></button>
  {/if}
</div>

<style lang="scss">

  .range {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: max-content;
      position: relative;

      .rangeUpdate {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #607d8b28;
          border: none;
          color: #fff;
          font-size: 1rem;
          transition: all 0.2s ease-in-out;

          &:hover {
              background: #607d8b;
          }
      }
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