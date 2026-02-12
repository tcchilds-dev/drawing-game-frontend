<script lang="ts">
    interface Props {
        word: string;
        isArtist?: boolean;
        revealWord?: boolean;
        revealedIndices?: Set<number>;
        roundTime?: number;
        currentRound?: number;
        totalRounds?: number;
        roomCode?: string;
    }

    let {
        word,
        isArtist = false,
        revealWord = false,
        revealedIndices = new Set(),
        roundTime = 60,
        currentRound = 1,
        totalRounds = 3,
        roomCode = "",
    }: Props = $props();

    const characters = $derived(word.split(""));

    let copied = $state(false);

    async function copyRoomCode() {
        await navigator.clipboard.writeText(roomCode);
        copied = true;
        setTimeout(() => (copied = false), 2000);
    }
</script>

<div class="relative flex justify-between items-center px-4 py-2">
    <!-- Left: Timer and Round -->
    <div class="flex items-center gap-4">
        <span class="text-xl font-mono">{roundTime}s</span>
        <span class="text-sm opacity-70">Round {currentRound}/{totalRounds}</span>
    </div>

    <!-- Center: Word -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div class="flex items-center gap-1">
            {#each characters as char, i}
                {#if char === " "}
                    <span class="w-4"></span>
                {:else}
                    <span
                        class="w-4 h-6 flex items-center justify-center font-bold border-b-2 border-base-content"
                    >
                        {#if isArtist || revealedIndices.has(i)}
                            {char}
                        {:else if revealWord}
                            {char}
                        {:else}
                            &nbsp;
                        {/if}
                    </span>
                {/if}
            {/each}
        </div>
    </div>

    <!-- Right: Room Code -->
    <div class="flex items-center gap-2">
        <span class="text-sm opacity-70">Room:</span>
        <button class="btn btn-sm btn-ghost font-mono" onclick={copyRoomCode} title="Click to copy">
            {roomCode}
            {#if copied}
                <span class="text-success">✓</span>
            {/if}
        </button>
    </div>
</div>
