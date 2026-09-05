let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function unlockAudio(): void {
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === "suspended") {
    void audio.resume();
  }
}

function tone(
  audio: AudioContext,
  freq: number,
  time: number,
  duration: number,
  gain: number,
) {
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0, time);
  amp.gain.linearRampToValueAtTime(gain, time + 0.018);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(time);
  osc.stop(time + duration + 0.04);
}

/** Soft C-major arpeggio — calm, not an alarm. */
export function playChime(): void {
  try {
    unlockAudio();
    const audio = getCtx();
    if (!audio) return;
    const t0 = audio.currentTime + 0.02;
    tone(audio, 523.25, t0, 0.55, 0.07);
    tone(audio, 659.25, t0 + 0.2, 0.7, 0.06);
    tone(audio, 783.99, t0 + 0.44, 0.9, 0.05);
  } catch {
    // Autoplay / closed context — ignore.
  }
}

export function notifyPhaseComplete(title: string, body: string): void {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    if (typeof document !== "undefined" && !document.hidden) return;
    new Notification(title, { body, silent: true });
  } catch {
    // Notifications may be blocked in embedded previews.
  }
}

export function requestNotifyPermission(): void {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }
  } catch {
    // ignore
  }
}
