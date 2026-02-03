<script lang="ts">
    import BrushWidth from "./lib/BrushWidth.svelte";
    import Button from "./lib/Button.svelte";
    import Chat from "./lib/Chat.svelte";
    import ColorPicker from "./lib/ColorPicker.svelte";
    import PlayerList from "./lib/PlayerList.svelte";
    import WordDisplay from "./lib/WordDisplay.svelte";

    const word = "apple";

    let isArtist = true;
</script>

<div id="game" class="flex w-full h-full">
    <div id="game-wrapper" class="grid grid-cols-6 grid-rows-12 h-full w-full">
        <div id="top-bar" class="col-span-6 row-span-1">
            <WordDisplay {word} {isArtist} revealedIndices={new Set([0, 2])} />
        </div>
        <div id="player-list" class="row-span-10">
            <PlayerList />
        </div>
        <div id="canvas" class="row-span-10 col-span-4">
            <main class="flex-1 bg-neutral-200 col-span-4">
                <canvas class="w-full h-full"></canvas>
            </main>
        </div>
        <div id="chat" class="row-span-11">
            <Chat />
        </div>
        <div id="leave" class="col-span-1">
            <Button variant="leave">Leave</Button>
        </div>
        <div id="color-picker" class="col-span-4 justify-around align-middle">
            <ColorPicker />
        </div>
    </div>
</div>
