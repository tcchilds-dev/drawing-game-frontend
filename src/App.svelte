<script lang="ts">
  import { onMount } from "svelte";
  import Button from "./lib/Button.svelte";
  import Chat from "./lib/Chat.svelte";
  import ColorPicker from "./lib/ColorPicker.svelte";
  import PlayerList from "./lib/PlayerList.svelte";
  import WordDisplay from "./lib/WordDisplay.svelte";
  import NameEntry from "./lib/NameEntry.svelte";
  import LobbyChoice from "./lib/LobbyChoice.svelte";
  import RoomCodeEntry from "./lib/RoomCodeEntry.svelte";
  import RoomCreate from "./lib/RoomCreate.svelte";
  import WordSelection from "./lib/WordSelection.svelte";
  import DrawingCanvas from "./lib/DrawingCanvas.svelte";
  import { gameState } from "./lib/gameState.svelte";
  import type { RoomConfig } from "./lib/socket";

  type Screen = "name" | "lobby" | "join" | "create" | "game" | "reconnecting";

  const hasSession =
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("gameSession") !== null;
  let screen = $state<Screen>(hasSession ? "reconnecting" : "name");

  let selectedColor = $state("#000000");
  let brushSize = $state(8);
  let canvasRef: DrawingCanvas | null = $state(null);

  // Watch for reconnection completion
  $effect(() => {
    if (screen === "reconnecting" && !gameState.isReconnecting) {
      if (gameState.room) {
        screen = "game";
      } else if (gameState.username) {
        screen = "lobby";
      } else {
        screen = "name";
      }
    }
  });

  onMount(() => {
    gameState.connect();
    return () => gameState.disconnect();
  });

  async function handleNameSubmit(name: string) {
    const success = await gameState.setUsername(name);
    if (success) {
      screen = "lobby";
    }
  }

  function handleCreateClick() {
    screen = "create";
  }

  async function handleCreate(config: Partial<RoomConfig>): Promise<boolean> {
    const success = await gameState.createRoom(config);
    if (success) {
      screen = "game";
    }
    return success;
  }

  function handleJoinClick() {
    screen = "join";
  }

  async function handleJoinRoom(code: string): Promise<string | null> {
    const result = await gameState.joinRoom(code);
    if (result.success) {
      screen = "game";
      return null;
    }
    if (result.error === "room is full") {
      return "Room is full.";
    }
    if (result.error) {
      return result.error;
    }
    return "Room not found. Check the code and try again.";
  }

  function handleLeave() {
    gameState.leaveRoom();
    screen = "lobby";
  }

  async function handleStartGame() {
    await gameState.startGame();
  }

  async function handleWordChoice(word: string) {
    await gameState.chooseWord(word);
  }

  function handleSendMessage(text: string) {
    gameState.sendGuess(text);
  }

  function handleUndo() {
    canvasRef?.undo();
  }

  function handleClear() {
    canvasRef?.clear();
  }

  const timerSeconds = $derived(Math.ceil(gameState.timerRemaining / 1000));
</script>

<div class="flex flex-col h-full">
  <header class="h-20 flex items-center justify-center">
    <h1 class="text-4xl font-bold text-white drop-shadow-lg">
      Tom's Drawing Game
    </h1>
  </header>

  <main class="flex-1 px-8 pb-4 min-h-0">
    <div class="grid grid-cols-6 grid-rows-12 h-full gap-1">
      <!-- Top bar -->
      <div class="col-span-6 row-span-1 bg-base-100 rounded-t-lg">
        {#if screen === "game" && gameState.room}
          <WordDisplay
            word={gameState.displayWord}
            isArtist={gameState.isArtist}
            revealWord={gameState.phase === "round-end"}
            revealedIndices={new Set()}
            roundTime={timerSeconds}
            currentRound={gameState.currentRound}
            totalRounds={gameState.room.config.numberOfRounds}
            roomCode={gameState.roomId ?? ""}
          />
        {:else}
          <div class="h-full"></div>
        {/if}
      </div>

      <!-- Player list -->
      <div class="row-span-10 bg-base-200 rounded-bl-lg">
        {#if screen === "game"}
          <PlayerList
            players={gameState.players}
            currentArtistId={gameState.room?.drawingState.currentArtist ?? null}
            isCreator={gameState.isCreator}
            phase={gameState.phase}
            onStart={handleStartGame}
          />
        {/if}
      </div>

      <!-- Canvas / Overlay screens -->
      <div class="row-span-10 col-span-4 overflow-hidden">
        {#if screen === "reconnecting"}
          <div
            class="flex flex-col items-center justify-center h-full gap-4 bg-base-100"
          >
            <span class="loading loading-spinner loading-lg"></span>
            <p class="text-lg">Reconnecting to your game...</p>
          </div>
        {:else if screen === "name"}
          <NameEntry onSubmit={handleNameSubmit} />
        {:else if screen === "lobby"}
          <LobbyChoice onCreate={handleCreateClick} onJoin={handleJoinClick} />
        {:else if screen === "create"}
          <RoomCreate
            onCreate={handleCreate}
            onBack={() => (screen = "lobby")}
          />
        {:else if screen === "join"}
          <RoomCodeEntry
            onSubmit={handleJoinRoom}
            onBack={() => (screen = "lobby")}
          />
        {:else if gameState.phase === "word-selection" && gameState.isArtist}
          <WordSelection
            words={gameState.wordChoices}
            onSelect={handleWordChoice}
          />
        {:else if gameState.finalStandings.length > 0}
          <div class="flex h-full items-center justify-center bg-base-100 p-6">
            <div
              class="w-full max-w-lg rounded-lg border border-base-300 bg-base-200 p-6"
            >
              <h2 class="mb-4 text-center text-2xl font-bold">Game Over</h2>
              <p class="mb-4 text-center text-sm opacity-70">Final Scores</p>
              <div class="space-y-2">
                {#each gameState.finalStandings as standing, index}
                  <div
                    class="flex items-center justify-between rounded bg-base-100 px-3 py-2"
                  >
                    <span class="font-semibold"
                      >#{index + 1} {standing.username}</span
                    >
                    <span class="font-mono">{standing.score}</span>
                  </div>
                {/each}
              </div>
              <div class="mt-6 flex justify-center">
                {#if gameState.isCreator}
                  <Button variant="start" onclick={handleStartGame}
                    >Start Next Game</Button
                  >
                {:else}
                  <span class="text-sm opacity-70"
                    >Waiting for host to start next game...</span
                  >
                {/if}
              </div>
            </div>
          </div>
        {:else}
          <DrawingCanvas
            bind:this={canvasRef}
            color={selectedColor}
            {brushSize}
            disabled={!gameState.isArtist || gameState.phase !== "drawing"}
          />
        {/if}
      </div>

      <!-- Chat -->
      <div class="row-span-11 bg-base-200 rounded-r-lg">
        {#if screen === "game"}
          <Chat
            messages={gameState.messages}
            players={gameState.players}
            onSend={handleSendMessage}
            disabled={gameState.isArtist && gameState.phase === "drawing"}
          />
        {/if}
      </div>

      <!-- Leave button -->
      <div
        class="col-span-1 bg-base-200 rounded-bl-lg flex items-center justify-center"
      >
        {#if screen === "game"}
          <Button variant="leave" onclick={handleLeave}>Leave</Button>
        {/if}
      </div>

      <!-- Color picker -->
      <div class="col-span-4 bg-base-100 flex items-center justify-center">
        {#if screen === "game" && gameState.isArtist}
          <ColorPicker
            bind:selected={selectedColor}
            bind:brushSize
            onUndo={handleUndo}
            onClear={handleClear}
          />
        {/if}
      </div>
    </div>
  </main>

  <footer class="h-20 flex items-center justify-center gap-8 text-white/70">
    <a href="https://github.com/tcchilds-dev" class="hover:text-white">GitHub</a
    >
  </footer>
</div>
