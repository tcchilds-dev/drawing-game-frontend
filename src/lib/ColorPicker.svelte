<script lang="ts">
  import BrushWidth from "./BrushWidth.svelte";
  import Button from "./Button.svelte";

  const colors = [
    "#000000",
    "#7a7d82",
    "#ee1a13",
    "#ff7000",
    "#ffe300",
    "#00cb00",
    "#00ff90",
    "#00b1ff",
    "#2824d2",
    "#a200b9",
    "#e8469a",
    "#ffab8d",
    "#9f5331",
    "#ffffff",
    "#c0c0c0",
    "#b51b16",
    "#ff9b4f",
    "#f5e782",
    "#a5fca4",
    "#a6ffd8",
    "#9ee2ff",
    "#3f3bff",
    "#9705ff",
    "#fc8bd9",
    "#cb764e",
    "#633315",
  ];

  interface Props {
    selected?: string;
    brushSize?: number;
    onUndo?: () => void;
    onClear?: () => void;
  }

  let {
    selected = $bindable("#000000"),
    brushSize = $bindable(8),
    onUndo,
    onClear,
  }: Props = $props();
</script>

<div class="flex items-center justify-between w-full px-4">
  <!-- Brush size -->
  <div>
    <BrushWidth bind:size={brushSize} />
  </div>

  <!-- Colors -->
  <div class="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1 justify-center">
    {#each colors as color}
      <button
        class="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
        class:border-primary={selected === color}
        class:border-base-300={selected !== color}
        style:background-color={color}
        onclick={() => (selected = color)}
        aria-label="Select color {color}"
      >
      </button>
    {/each}
  </div>

  <!-- Actions -->
  <div class="flex gap-2">
    <Button variant="undo" onclick={onUndo}>Undo</Button>
    <Button variant="clear" onclick={onClear}>Clear</Button>
  </div>
</div>
