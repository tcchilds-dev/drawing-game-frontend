import { io, Socket } from "socket.io-client";

export interface RoomConfig {
  isPrivate: boolean;
  maxPlayers: number;
  wordSelectionSize: 3 | 5;
  wordChoiceTimer: number;
  drawTimer: number;
  numberOfRounds: number;
}

export interface User {
  id: string;
  playerId: string;
  username: string;
  score: number;
}

export interface Guessage {
  playerId: string;
  guessage: string;
  timestamp: string;
}

export interface FinalStanding {
  playerId: string;
  username: string;
  score: number;
}

export type Point = [number, number];

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export interface DrawingState {
  currentArtist: string | null;
  correctlyGuessed: User[];
  startedAt: number | null;
  completedStrokes: Stroke[];
  activeStroke: Stroke | null;
}

export type GamePhase = "lobby" | "word-selection" | "drawing" | "round-end";

export interface ConvertedRoom {
  id: string;
  creator: string;
  config: RoomConfig;
  players: Record<string, User>;
  guessages: Guessage[];
  drawingState: DrawingState;
  phase: GamePhase;
  currentRound: number;
}

export type SimpleResponse = { success: true } | { success: false; error: string };
export type RoomResponse =
  | { success: true; room: ConvertedRoom }
  | { success: false; error: string };
export type WordResponse = { success: true; word: string } | { success: false; error: string };

// Server -> Client events
interface ServerToClientEvents {
  "room:update": (room: ConvertedRoom) => void;
  "user:joined": (userId: string) => void;
  "user:left": (userId: string) => void;
  "word:choice": (data: { words: string[] }) => void;
  "word:mask": (data: { maskedWord: string }) => void;
  "word:selected": (data: { word: string }) => void;
  "timer:sync": (data: { remaining: number; phase: GamePhase }) => void;
  "round:start": (data: { round: number; artistId: string }) => void;
  "round:end": (data: { word: string; scores: Record<string, number> }) => void;
  "game:end": (data: { finalStandings: FinalStanding[] }) => void;
  "guess:correct": (data: { playerId: string; username: string }) => void;
  "canvas:sync": (data: { completedStrokes: Stroke[]; activeStroke: Stroke | null }) => void;
  "stroke:start": (data: { playerId: string; color: string; width: number }) => void;
  "stroke:points": (data: { playerId: string; points: Point[] }) => void;
  "stroke:end": () => void;
  "canvas:clear": () => void;
}

// Client -> Server events
interface ClientToServerEvents {
  "user:username": (
    data: { username: string; playerId: string },
    callback: (res: SimpleResponse) => void,
  ) => void;
  "room:create": (config: Partial<RoomConfig>, callback: (res: RoomResponse) => void) => void;
  "room:join": (roomId: string, callback: (res: RoomResponse) => void) => void;
  "room:leave": () => void;
  "game:start": (roomId: string, callback: (res: SimpleResponse) => void) => void;
  "chat:guessage": (guessage: Guessage) => void;
  "word:choice": (word: string, callback: (res: WordResponse) => void) => void;
  "stroke:start": (data: { color: string; width: number }) => void;
  "stroke:points": (data: { points: Point[] }) => void;
  "stroke:end": () => void;
  "canvas:undo": () => void;
  "canvas:clear": () => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export const socket: TypedSocket = io(SOCKET_URL, {
  autoConnect: false,
});
