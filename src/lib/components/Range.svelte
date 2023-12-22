
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
    import { writable, type Unsubscriber } from "svelte/store";

  export let min: number;
  export let max: number;
  export let fieldName: string;
  export let value: number;
  export let step: number = 1;
  export let showButtons: boolean = true;
  export let gap: number = 15;
  export let reference: number = 0;

  const refValue = writable(value);

  $: $refValue = value;

  let scroller: HTMLDivElement;

  function scrollListener(e: Event){
    const divisions = scroller.querySelectorAll(".division") as NodeListOf<HTMLDivElement>;
    let closest = divisions[0];
    divisions.forEach((division) => {
      //if element is exactly in the middle of the parent element
      if (Math.abs(division.offsetTop - scroller.scrollTop - scroller.offsetHeight / 2) < Math.abs(closest.offsetTop - scroller.scrollTop - scroller.offsetHeight / 2)) {
        closest = division;
      }
    });

    $refValue = (Number(closest.dataset.value));
  };

  let unsub: Unsubscriber;

  onMount(() => {

    
    unsub = refValue.subscribe((val) => {
      $refValue = val;
      value = val;
      updateDiv(false);
    });
  });
  

  function updateDiv(smooth: boolean = true){
    const target = scroller.querySelector(`.division[data-value="${$refValue}"]`) as HTMLDivElement;
    if (!target) return;
    target.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center",
      inline: "center"
    });
    //on scroll end, add the scroll listener again
    scroller.onscrollend = () => {
      scroller.onscroll = scrollListener;
    };
  }

  function rangeUpdate(num: number) {

    scroller.onscroll = null;

    $refValue += num;
    if ($refValue < min) {
      $refValue = min;
    }
    if ($refValue > max) {
      $refValue = max;
    }
    //scroll to the division
    updateDiv();
  }


  onDestroy(() => {
    scroller.onscroll = null;
    unsub();
  });

</script>

<div class="range {fieldName}">
  {#if showButtons}
  <button class="rangeUpdate" on:click={() => {rangeUpdate(-step)}}><i class="fa-solid fa-minus"></i></button>
  {/if}
  <div class="scrollable">
    <div class="divContainer">
      <div bind:this={scroller} class="divisions" style="gap: {gap}px;">
        {#each Array.from({ length: (max - min) / step + 1 }, (_, i) => min + i * step) as i}
          <div class:selected={i === $refValue} class="division" data-value={i}>{i}</div>
        {/each}
      </div>
      {#if reference}
      <div class="reference">/{reference}</div>
      {/if}
    </div>
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
      height: 50px;
      margin: 10px 0;
      padding: 10px 0;
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
      //background: #607d8b;
      //mask the top and bottom of the divisions
    

      .divisions{
          position: relative;
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 30px 10px;
          //snap to the nearest division on scroll
          scroll-snap-type: y mandatory;
          overflow-y: scroll;

          .division{
              width: 100%;
              height: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff2f;
              font-size: 1.2rem;
              scroll-snap-align: center;

              &.selected{
                  color: #ffffff;
              }
          }
          cursor: grab;
      }

      &:has(.reference) .divisions{
        padding-right: 30px;
        //background: pink;
      }
      .reference{
        position: absolute;
        right: 2px;
        font-size: 1.2rem;
        pointer-events: none;
        //margin-right: 5px;
      }
  }


</style>