<script lang="ts">
    import type { Guessage } from "./socket";

    interface Props {
        messages?: Guessage[];
        onSend?: (text: string) => void;
        disabled?: boolean;
    }

    let { messages = [], onSend, disabled = false }: Props = $props();
    let inputValue = $state("");

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
                    <span class="font-semibold">{message.playerId.slice(0, 6)}:</span>
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
