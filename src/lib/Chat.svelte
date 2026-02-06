<script lang="ts">
    import type { Guessage, User } from "./socket";

    interface Props {
        messages?: Guessage[];
        players?: User[];
        onSend?: (text: string) => void;
        disabled?: boolean;
    }

    let { messages = [], players = [], onSend, disabled = false }: Props = $props();
    let inputValue = $state("");

    const playersById = $derived(new Map(players.map((player) => [player.playerId, player.username])));

    function getDisplayName(playerId: string): string {
        return playersById.get(playerId) ?? playerId.slice(0, 6);
    }

    function sendMessage() {
        if (!inputValue.trim() || disabled) return;
        onSend?.(inputValue.trim());
        inputValue = "";
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
</script>

<div class="flex flex-col h-full">
    <div class="flex-1 overflow-y-auto p-4 space-y-2">
        {#each messages as message (message.timestamp)}
            <div class="chat chat-start">
                <div class="chat-bubble chat-bubble-neutral">
                    <span class="font-semibold">{getDisplayName(message.playerId)}:</span>
                    {message.guessage}
                </div>
            </div>
        {/each}
    </div>

    <div class="p-4">
        <div class="flex gap-2">
            <input
                type="text"
                class="input input-bordered flex-1"
                placeholder={disabled ? "You're drawing!" : "Type a guess..."}
                bind:value={inputValue}
                onkeydown={handleKeydown}
                {disabled}
            />
        </div>
    </div>
</div>
