const MUTE_KEY = 'career-catcher:muted';

// Short synthesized cues only. Creating this controller never starts audio.
const CUES = {
  catch: { priority: 1, cooldown: .13, notes: [[620, 0, .065], [830, .055, .08]] },
  coffee: { priority: 2, cooldown: .18, wave: 'sine', notes: [[440, 0, .07], [590, .055, .07], [740, .11, .07]] },
  hit: { priority: 4, cooldown: .22, notes: [[180, 0, .15, 85], [110, .025, .08]] },
  promotion: { priority: 6, cooldown: .32, notes: [[520, 0, .09], [660, .075, .09], [880, .15, .15]] },
  demotion: { priority: 6, cooldown: .32, notes: [[660, 0, .08], [440, .07, .09], [280, .14, .14]] },
  denied: { priority: 6, cooldown: .32, notes: [[330, 0, .08], [220, .09, .12]] },
  'ending:victory': { priority: 10, cooldown: .45, notes: [[523, 0, .09], [659, .075, .09], [784, .15, .1], [1047, .23, .15]] },
  'ending:dismissed': { priority: 10, cooldown: .45, notes: [[300, 0, .12, 220], [155, .13, .19]] },
  'ending:contractReview': { priority: 10, cooldown: .45, wave: 'sine', notes: [[392, 0, .085], [349, .09, .08], [294, .18, .13]] },
};

function defaultContextFactory() {
  const Constructor = globalThis.AudioContext || globalThis.webkitAudioContext;
  return Constructor ? new Constructor() : null;
}

export function createAudio({ contextFactory = defaultContextFactory, storage } = {}) {
  let context = null;
  let unlocked = false;
  let unavailable = false;
  let pendingUnlock = null;
  let preferenceStore = null;
  let muted = false;
  let busyUntil = 0;
  let currentPriority = 0;
  const voices = new Set();
  const lastPlayed = new Map();

  try {
    preferenceStore = storage === undefined ? globalThis.localStorage : storage;
    muted = preferenceStore?.getItem(MUTE_KEY) === 'true';
  } catch {
    preferenceStore = null;
  }

  function contextState() {
    try { return context?.state; } catch { return 'closed'; }
  }

  function contextTime() {
    try { return context?.currentTime; } catch { return NaN; }
  }

  function cleanup(voice) {
    voices.delete(voice);
    try { voice.oscillator.disconnect(); } catch {}
    try { voice.gain.disconnect(); } catch {}
  }

  function stop() {
    const time = contextTime();
    const now = Number.isFinite(time) ? time : 0;
    for (const voice of [...voices]) {
      try {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(0, now);
      } catch {}
      try { voice.oscillator.stop(now); } catch {}
      cleanup(voice);
    }
    busyUntil = 0;
    currentPriority = 0;
    lastPlayed.clear();
  }

  function unlock() {
    if (muted || unavailable) return Promise.resolve(false);
    if (pendingUnlock) return pendingUnlock;
    if (!context) {
      try {
        context = contextFactory();
        if (!context || typeof context.createOscillator !== 'function' || typeof context.createGain !== 'function') {
          unavailable = true;
          return Promise.resolve(false);
        }
      } catch {
        unavailable = true;
        return Promise.resolve(false);
      }
    }
    if (contextState() === 'closed') {
      unavailable = true;
      return Promise.resolve(false);
    }
    if (contextState() === 'running') {
      unlocked = true;
      return Promise.resolve(true);
    }
    try {
      // Call resume synchronously in the gesture before waiting on its result.
      const resumed = context.resume();
      pendingUnlock = Promise.resolve(resumed)
        .then(() => {
          unlocked = !muted && contextState() === 'running';
          return unlocked;
        }, () => false)
        .finally(() => { pendingUnlock = null; });
      return pendingUnlock;
    } catch {
      return Promise.resolve(false);
    }
  }

  function play(type, outcome) {
    if (typeof type !== 'string' || (outcome !== undefined && typeof outcome !== 'string')) return false;
    const key = type === 'ending' ? `ending:${outcome || 'contractReview'}` : type;
    const cue = Object.hasOwn(CUES, key) ? CUES[key] : null;
    if (!cue || muted || unavailable || !unlocked || contextState() !== 'running') return false;
    const now = contextTime();
    if (!Number.isFinite(now)) return false;
    if (now - (lastPlayed.get(key) ?? -Infinity) < cue.cooldown) return false;
    if (now < busyUntil && cue.priority <= currentPriority) return false;

    // A more important event replaces a routine cue instead of stacking it.
    const previousPlays = new Map(lastPlayed);
    stop();
    for (const [name, time] of previousPlays) lastPlayed.set(name, time);
    let duration = 0;
    try {
      for (const [frequency, delay, length, slideTo] of cue.notes) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const voice = { oscillator, gain };
        voices.add(voice);
        oscillator.onended = () => cleanup(voice);
        oscillator.type = cue.wave || 'triangle';
        oscillator.frequency.setValueAtTime(frequency, now + delay);
        if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + delay + length);
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(cue.priority >= 4 ? .045 : .055, now + delay + .006);
        gain.gain.linearRampToValueAtTime(0, now + delay + length);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + delay);
        oscillator.stop(now + delay + length + .008);
        duration = Math.max(duration, delay + length + .008);
      }
    } catch {
      stop();
      return false;
    }
    lastPlayed.set(key, now);
    currentPriority = cue.priority;
    busyUntil = now + duration;
    return true;
  }

  function setMuted(value) {
    muted = Boolean(value);
    try { preferenceStore?.setItem(MUTE_KEY, String(muted)); } catch {}
    if (muted) {
      stop();
      return Promise.resolve(false);
    }
    return unlock();
  }

  return {
    unlock, play, stop, setMuted,
    get muted() { return muted; },
    get state() {
      if (muted) return 'muted';
      if (unavailable || contextState() === 'closed') return 'unavailable';
      if (!context) return 'locked';
      return contextState() === 'running' ? 'running' : 'suspended';
    },
  };
}
