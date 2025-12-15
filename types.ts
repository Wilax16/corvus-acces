export enum AuthMode {
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER'
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  TRIP_REQUEST = 'TRIP_REQUEST',
  SCANNER = 'SCANNER'
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Live API Types
export type LiveConfig = {
  model: string;
  systemInstruction?: string;
};