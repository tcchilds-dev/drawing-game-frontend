<script lang="ts">
    import Button from "./lib/Button.svelte";
    import Chat from "./lib/Chat.svelte";
    import ColorPicker from "./lib/ColorPicker.svelte";
    import PlayerList from "./lib/PlayerList.svelte";
    import WordDisplay from "./lib/WordDisplay.svelte";

    const word = "apple";
    let isArtist = true;
</script>

<div class="flex flex-col h-full">
    <!-- Header -->
    <header class="h-20 flex items-center justify-center">
        <h1 class="text-4xl font-bold text-white drop-shadow-lg">Tom's Drawing Game</h1>
    </header>

    <!-- Game area with padding -->
    <main class="flex-1 px-8 pb-4 min-h-0">
        <div class="grid grid-cols-6 grid-rows-12 h-full gap-1">
            <!-- Top bar -->
            <div class="col-span-6 row-span-1 bg-base-100 rounded-t-lg">
                <WordDisplay {word} {isArtist} revealedIndices={new Set([0, 2])} />
            </div>

            <!-- Player list -->
            <div class="row-span-10 bg-base-200 rounded-bl-lg">
                <PlayerList />
            </div>

            <!-- Canvas -->
            <div class="row-span-10 col-span-4 bg-white">
                <canvas class="w-full h-full"></canvas>
            </div>

            <!-- Chat -->
            <div class="row-span-11 bg-base-200 rounded-r-lg">
                <Chat />
            </div>

            <!-- Leave button -->
            <div class="col-span-1 bg-base-200 rounded-bl-lg flex items-center justify-center">
                <Button variant="leave">Leave</Button>
            </div>

            <!-- Color picker -->
            <div class="col-span-4 bg-base-100 flex items-center justify-center">
                <ColorPicker />
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="h-20 flex items-center justify-center gap-8 text-white/70">
        <a href="#" class="hover:text-white">Contact</a>
        <a href="#" class="hover:text-white">About</a>
        <a href="#" class="hover:text-white">GitHub</a>
    </footer>
</div>
