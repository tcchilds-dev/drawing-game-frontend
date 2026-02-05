<script lang="ts">
    import Button from "./Button.svelte";

    interface Props {
        onSubmit: (code: string) => Promise<boolean>;
        onBack: () => void;
    }

    let { onSubmit, onBack }: Props = $props();
    let code = $state("");
    let isSubmitting = $state(false);
    let error = $state("");

    async function handleSubmit() {
        if (!code.trim() || isSubmitting) return;

        isSubmitting = true;
        error = "";

        const success = await onSubmit(code.trim());

        if (!success) {
            error = "Room not found. Check the code and try again.";
        }

        isSubmitting = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleSubmit();
        }
    }
</script>

<div class="flex flex-col items-center justify-center h-full gap-4 bg-base-100">
    <h2 class="text-2xl font-bold">Enter room code</h2>
    <input
        type="text"
        class="input input-bordered w-80 text-center font-mono"
        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        bind:value={code}
        onkeydown={handleKeydown}
        disabled={isSubmitting}
    />

    {#if error}
        <span class="text-error text-sm">{error}</span>
    {/if}

    <div class="flex gap-4">
        <button class="btn btn-ghost" onclick={onBack} disabled={isSubmitting}>Back</button>
        <Button variant="join" onclick={handleSubmit} disabled={!code.trim() || isSubmitting}>
            {#if isSubmitting}
                <span class="loading loading-spinner loading-sm"></span>
            {:else}
                Join
            {/if}
        </Button>
    </div>
</div>
