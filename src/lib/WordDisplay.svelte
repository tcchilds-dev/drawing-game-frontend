<script lang="ts">
    interface Props {
        word: string;
        isArtist?: boolean;
        revealedIndices?: Set<number>;
    }

    let { word, isArtist = false, revealedIndices = new Set() }: Props = $props();

    const characters = $derived(word.split(""));
</script>

<div class="flex justify-around items-center gap-1 p-4">
    <p>Round Time</p>
    <span class="flex justify-center items-center gap-1">
        {#each characters as char, i}
            {#if char === " "}
                <span class="w-4"></span>
            {:else}
                <span
                    class="w-4 h-6 flex items-center justify-center font-bold border-b-2 border-base-content"
                >
                    {#if isArtist || revealedIndices.has(i)}
                        {char}
                    {:else}
                        &nbsp;
                    {/if}
                </span>
            {/if}
        {/each}
    </span>
    <p>Round Number</p>
</div>
