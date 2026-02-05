import {
  socket,
  type ConvertedRoom,
  type GamePhase,
  type Guessage,
  type RoomConfig,
} from "./socket";

const STORAGE_KEY = "gameSession";
const PLAYER_ID_KEY = "playerId";

interface StoredSession {
  username: string;
  roomId: string;
}

function getOrCreatePlayerId(): string {
  let playerId = sessionStorage.getItem(PLAYER_ID_KEY);
  if (!playerId) {
    playerId = crypto.randomUUID();
    sessionStorage.setItem(PLAYER_ID_KEY, playerId);
  }
  return playerId;
}

function saveSession(username: string, roomId: string) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username, roomId }));
}

function loadSession(): StoredSession | null {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasStoredSession(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) !== null;
}

export const gameState = createGameState();

function createGameState() {
  // Load stored session
  const storedSession = loadSession();
  const playerId = getOrCreatePlayerId();

  // Connection state
  let connected = $state(false);
  let socketId = $state<string | null>(null);
  let isReconnecting = $state(storedSession !== null);

  // User state
  let username = $state<string | null>(storedSession?.username ?? null);

  // Room state
  let room = $state<ConvertedRoom | null>(null);
  let roomId = $state<string | null>(storedSession?.roomId ?? null);

  // Game state
  let phase = $state<GamePhase>("lobby");
  let currentRound = $state(0);
  let timerRemaining = $state(0);
  let wordChoices = $state<string[]>([]);
  let currentWord = $state<string | null>(null);

  let timerInterval: ReturnType<typeof setInterval> | null = null;

  // Derived state
  const isArtist = $derived(room?.drawingState.currentArtist === socketId);
  const isCreator = $derived(room?.creator === socketId);
  const players = $derived(room ? Object.values(room.players) : []);
  const messages = $derived(room?.guessages ?? []);

  function startLocalTimer(initialMs: number) {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    timerRemaining = initialMs;

    timerInterval = setInterval(() => {
      timerRemaining = Math.max(0, timerRemaining - 1000);
      if (timerRemaining <= 0 && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }, 1000);
  }

  function stopLocalTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  async function attemptRejoin() {
    if (!username || !roomId) {
      isReconnecting = false;
      return;
    }

    // First set username
    const usernameSet = await setUsernameInternal(username);
    if (!usernameSet) {
      console.error("Failed to restore username");
      clearSession();
      isReconnecting = false;
      return;
    }

    // Then try to rejoin room
    const rejoined = await joinRoomInternal(roomId);
    if (!rejoined) {
      console.error("Failed to rejoin room, it may no longer exist");
      clearSession();
      roomId = null;
      room = null;
    }

    isReconnecting = false;
  }

  // Socket event handlers
  function setupSocketListeners() {
    socket.on("connect", async () => {
      connected = true;
      socketId = socket.id ?? null;
      console.log("Socket connected:", socketId);

      // Try to rejoin room if we have a stored session
      if (isReconnecting && username && roomId) {
        console.log("Attempting to rejoin room:", roomId);
        await attemptRejoin();
      }
    });

    socket.on("disconnect", () => {
      connected = false;
      socketId = null;
      stopLocalTimer();
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("room:update", (updatedRoom) => {
      console.log("Room update received:", updatedRoom);
      room = updatedRoom;
      phase = updatedRoom.phase;
      currentRound = updatedRoom.currentRound;
    });

    socket.on("user:left", (userId) => {
      console.log("User left:", userId);
      if (room && room.players[userId]) {
        const { [userId]: _, ...remainingPlayers } = room.players;
        room = { ...room, players: remainingPlayers };
      }
    });

    socket.on("word:choice", (data) => {
      wordChoices = data.words;
    });

    socket.on("timer:sync", (data) => {
      timerRemaining = data.remaining;
      phase = data.phase;
      startLocalTimer(data.remaining);
    });

    socket.on("round:start", (data) => {
      currentRound = data.round;
      currentWord = null;
    });

    socket.on("round:end", (data) => {
      currentWord = data.word;
    });

    socket.on("game:end", () => {
      phase = "lobby";
      currentRound = 0;
      currentWord = null;
    });

    socket.on("guess:correct", (data) => {
      console.log(`${data.username} guessed correctly!`);
    });
  }

  // Actions
  function connect() {
    if (!socket.connected) {
      setupSocketListeners();
      socket.connect();
    }
  }

  function disconnect() {
    stopLocalTimer();
    socket.disconnect();
    room = null;
    roomId = null;
    phase = "lobby";
  }

  async function setUsernameInternal(name: string): Promise<boolean> {
    if (!socket.connected) {
      try {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Connection timeout")), 5000);
          socket.once("connect", () => {
            clearTimeout(timeout);
            resolve();
          });
        });
      } catch {
        return false;
      }
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Username request timed out");
        resolve(false);
      }, 5000);

      socket.emit("user:username", { username: name, playerId }, (res) => {
        clearTimeout(timeout);
        if (res.success) {
          username = name;
          resolve(true);
        } else {
          console.error("Failed to set username:", res.error);
          resolve(false);
        }
      });
    });
  }

  async function setUsername(name: string): Promise<boolean> {
    return setUsernameInternal(name);
  }

  async function joinRoomInternal(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Join room request timed out");
        resolve(false);
      }, 5000);

      socket.emit("room:join", id, (res) => {
        clearTimeout(timeout);
        if (res.success) {
          room = res.room;
          roomId = res.room.id;
          phase = res.room.phase;
          resolve(true);
        } else {
          console.error("Failed to join room:", res.error);
          resolve(false);
        }
      });
    });
  }

  async function createRoom(config: Partial<RoomConfig> = {}): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Create room request timed out");
        resolve(false);
      }, 5000);

      socket.emit("room:create", config, (res) => {
        clearTimeout(timeout);
        if (res.success) {
          room = res.room;
          roomId = res.room.id;
          phase = res.room.phase;
          if (username && roomId) {
            saveSession(username, roomId);
          }
          resolve(true);
        } else {
          console.error("Failed to create room:", res.error);
          resolve(false);
        }
      });
    });
  }

  async function joinRoom(id: string): Promise<boolean> {
    const success = await joinRoomInternal(id);
    if (success && username && roomId) {
      saveSession(username, roomId);
    }
    return success;
  }

  function leaveRoom() {
    socket.emit("room:leave");
    room = null;
    roomId = null;
    phase = "lobby";
    wordChoices = [];
    stopLocalTimer();
    clearSession();
  }

  async function startGame(): Promise<boolean> {
    if (!roomId) return false;
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Start game request timed out");
        resolve(false);
      }, 5000);

      socket.emit("game:start", roomId!, (res) => {
        clearTimeout(timeout);
        resolve(res.success);
        if (!res.success) {
          console.error("Failed to start game:", res.error);
        }
      });
    });
  }

  function sendGuess(text: string) {
    if (!socketId) return;
    const guessage: Guessage = {
      playerId: socketId,
      guessage: text,
      timestamp: new Date().toISOString(),
    };
    socket.emit("chat:guessage", guessage);
  }

  async function chooseWord(word: string): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error("Choose word request timed out");
        resolve(false);
      }, 5000);

      socket.emit("word:choice", word, (res) => {
        clearTimeout(timeout);
        if (res.success) {
          currentWord = res.word;
          wordChoices = [];
          resolve(true);
        } else {
          console.error("Failed to choose word:", res.error);
          resolve(false);
        }
      });
    });
  }

  return {
    get connected() {
      return connected;
    },
    get socketId() {
      return socketId;
    },
    get username() {
      return username;
    },
    get room() {
      return room;
    },
    get roomId() {
      return roomId;
    },
    get phase() {
      return phase;
    },
    get currentRound() {
      return currentRound;
    },
    get timerRemaining() {
      return timerRemaining;
    },
    get wordChoices() {
      return wordChoices;
    },
    get currentWord() {
      return currentWord;
    },
    get isArtist() {
      return isArtist;
    },
    get isCreator() {
      return isCreator;
    },
    get players() {
      return players;
    },
    get messages() {
      return messages;
    },
    get isReconnecting() {
      return isReconnecting;
    },
    get playerId() {
      return playerId;
    },

    connect,
    disconnect,
    setUsername,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame,
    sendGuess,
    chooseWord,
  };
}
