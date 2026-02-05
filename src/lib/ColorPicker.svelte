<script lang="ts">
    import BrushWidth from "./BrushWidth.svelte";
    import Button from "./Button.svelte";

    const colors = [
        "#000000",
        "#ffffff",
        "#9ca3af",
        "#78716c",
        "#ef4444",
        "#f97316",
        "#eab308",
        "#84cc16",
        "#22c55e",
        "#14b8a6",
        "#06b6d4",
        "#3b82f6",
        "#6366f1",
        "#8b5cf6",
        "#a855f7",
        "#d946ef",
        "#ec4899",
        "#f43f5e",
        "#854d0e",
        "#1e3a5f",
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
