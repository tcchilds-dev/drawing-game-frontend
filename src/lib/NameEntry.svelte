<script lang="ts">
    import { gameState } from "./gameState.svelte";

    interface Props {
        onSubmit: (name: string) => void;
    }

    let { onSubmit }: Props = $props();
    let name = $state("");
    let isSubmitting = $state(false);
    let error = $state("");

    const isValid = $derived(name.trim().length >= 3);

    async function handleSubmit() {
        if (!isValid || isSubmitting) return;

        isSubmitting = true;
        error = "";

        try {
            onSubmit(name.trim());
        } finally {
            isSubmitting = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && isValid) {
            handleSubmit();
        }
    }
</script>

<div class="flex flex-col items-center justify-center h-full gap-4 bg-base-100">
    <h2 class="text-2xl font-bold">Enter your name</h2>

    {#if !gameState.connected}
        <span class="text-warning text-sm">Connecting to server...</span>
    {/if}

    <input
        type="text"
        class="input input-bordered w-64"
        placeholder="Your name (3+ chars)..."
        bind:value={name}
        onkeydown={handleKeydown}
        disabled={isSubmitting}
    />

    {#if error}
        <span class="text-error text-sm">{error}</span>
    {/if}

    <button
        class="btn btn-primary"
        onclick={handleSubmit}
        disabled={!isValid || isSubmitting || !gameState.connected}
    >
        {#if isSubmitting}
            <span class="loading loading-spinner loading-sm"></span>
        {:else}
            Continue
        {/if}
    </button>
</div>
