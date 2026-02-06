<script lang="ts">
    import type { User, GamePhase } from "./socket";
    import Button from "./Button.svelte";

    interface Props {
        players?: User[];
        currentArtistId?: string | null;
        isCreator?: boolean;
        phase?: GamePhase;
        onStart?: () => void;
    }

    let {
        players = [],
        currentArtistId = null,
        isCreator = false,
        phase = "lobby",
        onStart,
    }: Props = $props();

    const sortedPlayers = $derived([...players].sort((a, b) => b.score - a.score));

    const canStart = $derived(isCreator && phase === "lobby" && players.length >= 2);
</script>

<div class="flex flex-col h-full p-2">
    <div class="flex-1 overflow-y-auto">
        <table class="table table-sm">
            <tbody>
                {#each sortedPlayers as player (player.id)}
                    <tr>
                        <td class="truncate max-w-24">
                            {player.username}
                            {#if player.playerId === currentArtistId}
                                🎨
                            {/if}
                        </td>
                        <td class="text-right font-mono">{player.score}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>

    {#if canStart}
        <div class="pt-2">
            <Button variant="start" onclick={onStart}>Start Game</Button>
        </div>
    {/if}
</div>
