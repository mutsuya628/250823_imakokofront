// Google Maps JavaScript API の型定義をインポート
/// <reference types="google.maps" />

// グローバルな Window インターフェースの拡張
declare global {
  interface Window {
    resultMarkers: google.maps.Marker[];
    google: typeof google;
  }
}

export {};
