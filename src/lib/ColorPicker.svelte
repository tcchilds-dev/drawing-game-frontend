<script lang="ts">
  import BrushWidth from "./BrushWidth.svelte";
  import Button from "./Button.svelte";

  const colors = [
    "#000000",
    "#8196a4",
    "#ffffff",
    "#ffa873",
    "#b42c18",
    "#7f0606",
    "#9654fb",
    "#fc60b5",
    "#f33293",
    "#f30c0c",
    "#ff9806",
    "#f7b42d",
    "#fde06d",
    "#b6d966",
    "#3bde2e",
    "#30a9fe",
    "#4169e1",
    "#6495ed",
    "#b6dcf7",
    "#87a6c6",
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
  <div class="grid grid-cols-10 gap-1 justify-center">
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
