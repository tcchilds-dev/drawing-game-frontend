<script lang="ts">
    import Button from "./Button.svelte";
    import type { RoomConfig } from "./socket";

    interface Props {
        onCreate: (config: Partial<RoomConfig>) => Promise<boolean>;
        onBack: () => void;
    }

    let { onCreate, onBack }: Props = $props();

    let isPrivate = $state(false);
    let maxPlayers = $state(6);
    let wordSelectionSize = $state<3 | 5>(3);
    let drawTimer = $state(60);
    let numberOfRounds = $state(3);

    let isSubmitting = $state(false);
    let error = $state("");

    async function handleCreate() {
        if (isSubmitting) return;

        isSubmitting = true;
        error = "";

        const config: Partial<RoomConfig> = {
            isPrivate,
            maxPlayers,
            wordSelectionSize,
            drawTimer: drawTimer * 1000, // Convert to ms
            numberOfRounds,
        };

        const success = await onCreate(config);

        if (!success) {
            error = "Failed to create room. Please try again.";
        }

        isSubmitting = false;
    }
</script>

<div class="flex flex-col items-center justify-center h-full gap-4 bg-base-100 p-6">
    <h2 class="text-2xl font-bold">Create a Room</h2>

    <fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-80 border p-4">
        <label class="label">
            <span class="label-text">Private Room</span>
        </label>
        <input type="checkbox" class="toggle toggle-primary" bind:checked={isPrivate} />

        <label class="label mt-2">
            <span class="label-text">Max Players: {maxPlayers}</span>
        </label>
        <input
            type="range"
            min="2"
            max="12"
            bind:value={maxPlayers}
            class="range range-primary range-sm"
            step="1"
        />
        <div class="flex justify-between px-1 text-xs opacity-60">
            <span>2</span>
            <span>12</span>
        </div>

        <label class="label mt-2">
            <span class="label-text">Word Choices</span>
        </label>
        <select class="select select-bordered select-sm w-full" bind:value={wordSelectionSize}>
            <option value={3}>3 words</option>
            <option value={5}>5 words</option>
        </select>

        <label class="label mt-2">
            <span class="label-text">Drawing Time: {drawTimer}s</span>
        </label>
        <input
            type="range"
            min="30"
            max="180"
            bind:value={drawTimer}
            class="range range-primary range-sm"
            step="10"
        />
        <div class="flex justify-between px-1 text-xs opacity-60">
            <span>30s</span>
            <span>180s</span>
        </div>

        <label class="label mt-2">
            <span class="label-text">Rounds: {numberOfRounds}</span>
        </label>
        <input
            type="range"
            min="1"
            max="10"
            bind:value={numberOfRounds}
            class="range range-primary range-sm"
            step="1"
        />
        <div class="flex justify-between px-1 text-xs opacity-60">
            <span>1</span>
            <span>10</span>
        </div>
    </fieldset>

    {#if error}
        <span class="text-error text-sm">{error}</span>
    {/if}

    <div class="flex gap-4">
        <button class="btn btn-ghost" onclick={onBack} disabled={isSubmitting}>Back</button>
        <Button variant="create" onclick={handleCreate} disabled={isSubmitting}>
            {#if isSubmitting}
                <span class="loading loading-spinner loading-sm"></span>
            {:else}
                Create Room
            {/if}
        </Button>
    </div>
</div>
