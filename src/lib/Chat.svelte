<script lang="ts">
    interface Message {
        id: string;
        author: string;
        text: string;
        isOwn: boolean;
    }

    let { messages = [] }: { messages: Message[] } = $props();
    let inputValue = $state("");

    function sendMessage() {
        if (!inputValue.trim()) return;
        console.log("send:", inputValue);
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
    <!-- Messages area -->
    <div class="flex-1 overflow-y-auto p-4 space-y-2">
        {#each messages as message (message.id)}
            <div class="chat" class:chat-end={message.isOwn} class:chat-start={!message.isOwn}>
                <div class="chat-header">{message.author}</div>
                <div class="chat-bubble" class:chat-bubble-primary={message.isOwn}>
                    {message.text}
                </div>
            </div>
        {/each}
    </div>

    <!-- Input area -->
    <div class="p-4">
        <div class="flex gap-2">
            <input
                type="text"
                class="input input-bordered flex-1"
                placeholder="Type a message..."
                bind:value={inputValue}
                onkeydown={handleKeydown}
            />
        </div>
    </div>
</div>
