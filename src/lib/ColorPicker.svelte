<script lang="ts">
    import BrushWidth from "./BrushWidth.svelte";
    import Button from "./Button.svelte";

    const colors = [
        "#000000",
        "#656565",
        "#ffffff",
        "#f5e0cd",
        "#ecc19c",
        "#713c1a",
        "#8b0000",
        "#ff0000",
        "#ffc0cb",
        "#ff69b4",
        "#6495ed",
        "#4169e1",
        "#7b68ee",
        "#228b22",
        "#98fb98",
        "#adff2f",
        "#7fffd4",
        "#ffd700",
        "#ffff00",
        "#ffa500",
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
