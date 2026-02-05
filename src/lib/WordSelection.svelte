<script lang="ts">
    import Button from "./Button.svelte";

    interface Props {
        words: string[];
        onSelect: (word: string) => void;
    }

    let { words, onSelect }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center h-full gap-6 bg-base-100">
    <h2 class="text-2xl font-bold">Choose a word to draw</h2>
    <div class="flex gap-4">
        {#each words as word}
            <Button variant="word" onclick={() => onSelect(word)}>
                {word}
            </Button>
        {/each}
    </div>
</div>
