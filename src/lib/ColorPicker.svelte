<script lang="ts">
    import BrushWidth from "./BrushWidth.svelte";
    import Button from "./Button.svelte";

    const colors = [
        "#000000",
        "#ffffff",
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#6b7280",
        "#9f5301",
        "#424242",
    ];

    let { selected = $bindable("#000000") }: { selected?: string } = $props();
</script>

<div class="flex items-center justify-between w-full px-4">
    <!-- Brush size -->
    <div>
        <BrushWidth />
    </div>

    <!-- Colors -->
    <div class="flex flex-wrap gap-1 justify-center">
        {#each colors as color}
            <button
                class="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
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
        <Button variant="undo">Undo</Button>
        <Button variant="clear">Clear</Button>
    </div>
</div>
