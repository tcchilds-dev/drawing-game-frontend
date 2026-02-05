<script lang="ts">
    import Button from "./Button.svelte";

    interface Props {
        onCreate: () => void;
        onJoin: () => void;
    }

    let { onCreate, onJoin }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center h-full gap-6 bg-base-100">
    <h2 class="text-2xl font-bold">What would you like to do?</h2>
    <div class="flex gap-4">
        <Button variant="create" onclick={onCreate}>Create Room</Button>
        <Button variant="join" onclick={onJoin}>Join Room</Button>
    </div>
</div>
