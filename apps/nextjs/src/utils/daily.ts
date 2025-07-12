import { env } from "@/env";

const DAILY_API_KEY = env.DAILY_API_KEY;
const DAILY_API_URL = "https://api.daily.co/v1";

interface CreateRoomOptions {
  name: string;
  privacy: "private" | "public";
  properties?: {
    enable_chat?: boolean;
    enable_recording?: boolean;
    exp?: number;
  };
}

export interface CreateRoomResponse {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config: {
    enable_chat: boolean;
    enable_recording: boolean;
    exp?: number;
  };
}

interface CreateMeetingTokenOptions {
  roomUrl: string;
  userName: string;
}

export interface MeetingTokenResponse {
  token: string;
  room: string;
  exp: number;
}

export interface DailyRoom {
  id: string;
  name: string;
  url: string;
  created_at: string;
  privacy: "private" | "public";
  properties: Record<string, unknown>;
}
