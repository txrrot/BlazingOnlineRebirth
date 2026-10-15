// Clipurile video ale ghidurilor.
//
// Cum adaugi un ghid nou cu video:
//   1. Pui clipurile în  public/videos/  (ex: sideinstaller-1.webm)
//   2. Adaugi aici o intrare:  sideinstaller: [ { id, file, steps, duration }, ... ]
//   3. Adaugi textele clipurilor în  videoGuideText.ts  (id-ul clipului = cheia)
//   4. În App.tsx, în tab-ul ghidului, pui <GuideModeToggle/> + <VideoGuide guideId="..."/>
//
// Toggle-ul TEXT/VIDEO apare doar pentru ghidurile care au clipuri aici.

export interface VideoPart {
  /** Identificator unic, folosit și în videoGuideText.ts */
  id: string
  /** Numele fișierului din public/videos/, fără extensie */
  file: string
  /** Pașii din ghidul text pe care îi acoperă clipul: '01', '02–04' */
  steps: string
  /** Durata afișată pe card: '0:47' */
  duration: string
  /** true = există și <file>.mp4 (H.264) ca fallback pentru Safari/iOS mai vechi */
  withMp4?: boolean
}

export const GUIDE_VIDEOS: Record<string, VideoPart[]> = {
  // Method 2 — ESign
  esign: [
    { id: 'esign-1', file: 'esign-1-dns', steps: '01', duration: '0:47' },
    { id: 'esign-2', file: 'esign-2-esign-cert', steps: '02–04', duration: '0:49' },
    { id: 'esign-3', file: 'esign-3-game', steps: '05–06', duration: '1:26' },
  ],
}

const BASE = import.meta.env.BASE_URL // '/BlazingOnlineRebirth/'

export function hasVideoGuide(guideId: string): boolean {
  return (GUIDE_VIDEOS[guideId]?.length ?? 0) > 0
}

export function findVideoPart(id: string): VideoPart | undefined {
  for (const parts of Object.values(GUIDE_VIDEOS)) {
    const found = parts.find((p) => p.id === id)
    if (found) return found
  }
  return undefined
}

export function videoSources(part: VideoPart): { webm: string; mp4?: string } {
  return {
    webm: `${BASE}videos/${part.file}.webm`,
    mp4: part.withMp4 ? `${BASE}videos/${part.file}.mp4` : undefined,
  }
}
