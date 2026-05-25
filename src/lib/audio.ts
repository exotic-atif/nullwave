// ===== NULLWAVE AUDIO MANAGER =====
// Singleton HTML5 <audio> wrapper for real music streaming

type AudioEventHandler = () => void
type TimeUpdateHandler = (currentTime: number, duration: number) => void

class AudioManager {
  private audio: HTMLAudioElement
  private onTimeUpdateCallback: TimeUpdateHandler | null = null
  private onEndedCallback: AudioEventHandler | null = null
  private onPlayCallback: AudioEventHandler | null = null
  private onPauseCallback: AudioEventHandler | null = null
  private onLoadedCallback: AudioEventHandler | null = null
  private onErrorCallback: ((message: string) => void) | null = null

  constructor() {
    this.audio = new Audio()
    this.audio.preload = 'auto'
    // Removed crossOrigin='anonymous' to allow direct playback of Google Video streams without CORS errors

    this.audio.addEventListener('timeupdate', () => {
      this.onTimeUpdateCallback?.(this.audio.currentTime, this.audio.duration || 0)
    })

    this.audio.addEventListener('ended', () => {
      this.onEndedCallback?.()
    })

    this.audio.addEventListener('play', () => {
      this.onPlayCallback?.()
    })

    this.audio.addEventListener('pause', () => {
      this.onPauseCallback?.()
    })

    this.audio.addEventListener('loadedmetadata', () => {
      this.onLoadedCallback?.()
    })

    this.audio.addEventListener('error', () => {
      const msg = this.audio.error?.message || 'Audio playback error'
      this.onErrorCallback?.(msg)
    })
  }

  /** Load and play a URL */
  load(url: string) {
    if (!url) return
    this.audio.src = url
    this.audio.load()
  }

  async play() {
    try {
      await this.audio.play()
    } catch (e) {
      const msg = (e as Error).message
      // Ignore harmless interruption errors caused by fast skipping
      if (!msg.includes('interrupted by a new load request')) {
        this.onErrorCallback?.(msg)
      }
    }
  }

  pause() {
    this.audio.pause()
  }

  stop() {
    this.audio.pause()
    this.audio.removeAttribute('src')
    this.audio.load()
  }

  async playUrl(url: string) {
    if (!url) {
      this.onErrorCallback?.('No audio URL available for this track')
      return
    }
    this.audio.src = url
    this.audio.load()
    try {
      await this.audio.play()
    } catch (e) {
      const msg = (e as Error).message
      // Ignore harmless interruption errors caused by fast skipping
      if (!msg.includes('interrupted by a new load request')) {
        this.onErrorCallback?.(msg)
      }
    }
  }

  seek(time: number) {
    if (isFinite(time) && this.audio.duration) {
      this.audio.currentTime = Math.min(time, this.audio.duration)
    }
  }

  setVolume(vol: number) {
    this.audio.volume = Math.max(0, Math.min(1, vol))
  }

  setMuted(muted: boolean) {
    this.audio.muted = muted
  }

  get currentTime(): number {
    return this.audio.currentTime
  }

  get duration(): number {
    return this.audio.duration || 0
  }

  get paused(): boolean {
    return this.audio.paused
  }

  get hasSource(): boolean {
    return !!this.audio.src && this.audio.src !== '' && this.audio.src !== window.location.href
  }

  // ===== Event bindings =====

  onTimeUpdate(cb: TimeUpdateHandler) {
    this.onTimeUpdateCallback = cb
  }

  onEnded(cb: AudioEventHandler) {
    this.onEndedCallback = cb
  }

  onPlay(cb: AudioEventHandler) {
    this.onPlayCallback = cb
  }

  onPause(cb: AudioEventHandler) {
    this.onPauseCallback = cb
  }

  onLoaded(cb: AudioEventHandler) {
    this.onLoadedCallback = cb
  }

  onError(cb: (message: string) => void) {
    this.onErrorCallback = cb
  }

  destroy() {
    this.audio.pause()
    this.audio.src = ''
    this.audio.load()
  }
}

/** Global singleton audio manager */
export const audioManager = new AudioManager()
