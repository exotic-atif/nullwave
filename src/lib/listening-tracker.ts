export interface TrackSignal {
  playCount: number
  avgCompletionRatio: number
}

const STORAGE_KEY = 'nullwave_listening_tracker_v1'

class ListeningTracker {
  private signals: Record<string, TrackSignal> = {}

  constructor() {
    this.load()
  }

  private load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        this.signals = JSON.parse(data)
      }
    } catch {
      this.signals = {}
    }
  }

  private save() {
    try {
      // Bound size: Keep maximum 200 tracks to prevent unbounded localStorage growth
      const entries = Object.entries(this.signals)
      if (entries.length > 200) {
        entries.sort((a, b) => b[1].playCount - a[1].playCount)
        this.signals = Object.fromEntries(entries.slice(0, 200))
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.signals))
    } catch {
      // ignore
    }
  }

  /** Reset all local tracking signals (privacy/shared device cleanup) */
  clear() {
    this.signals = {}
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  /** Report a play session for a track */
  reportPlaySession(trackId: string, playDuration: number, totalDuration: number) {
    if (!trackId || !totalDuration || totalDuration <= 0) return

    const completionRatio = Math.max(0, Math.min(1, playDuration / totalDuration))
    
    // Ignore accidental ultra-short plays (< 2 seconds) unless it was explicitly skipped
    if (playDuration < 2 && completionRatio < 0.05) return

    if (!this.signals[trackId]) {
      this.signals[trackId] = { playCount: 0, avgCompletionRatio: 0 }
    }

    const sig = this.signals[trackId]
    // Moving average of completion ratio
    sig.avgCompletionRatio = ((sig.avgCompletionRatio * sig.playCount) + completionRatio) / (sig.playCount + 1)
    sig.playCount++

    this.save()
  }

  getTrackSignal(trackId: string): TrackSignal | null {
    return this.signals[trackId] || null
  }

  /**
   * Generates a ranked list of "Smart Seeds" (track IDs) based on affinity score.
   */
  getSmartSeeds(
    historyTrackIds: string[],
    favTrackIds: string[],
    limit: number = 5,
    excludedTrackIds: string[] = []
  ): string[] {
    const scored = new Map<string, number>()
    const excluded = new Set(excludedTrackIds.map(String))

    const addWithScore = (trackIds: string[], baseWeight: number) => {
      const ordered = trackIds
      ordered.forEach((rawId, index) => {
        const id = String(rawId || '')
        if (!id) return
        if (excluded.has(id)) return

        const signal = this.getTrackSignal(id)
        let bonus = 0

        if (signal) {
          if (signal.avgCompletionRatio > 0.8) bonus = 2
          else if (signal.avgCompletionRatio > 0.5) bonus = 1
          else if (signal.avgCompletionRatio < 0.2 && signal.playCount >= 2) bonus = -3 // Frequent skip penalty
        }

        // Favor recent listening while reducing repeats and giving favorites a clear boost.
        const recency = Math.exp(-index / 8)
        const repeatPenalty = signal ? Math.min(1.5, Math.log1p(signal.playCount) * 0.45) : 0
        const score = baseWeight + recency * 2 + repeatPenalty + bonus
        const existing = scored.get(id) || 0
        scored.set(id, existing + score)
      })
    }

    addWithScore(favTrackIds, 4.5)
    // Callers provide newest-first history (from the database or reversed queue history).
    addWithScore(historyTrackIds, 1.5)

    // Sort by score descending
    const sorted = Array.from(scored.entries())
      .filter(([id]) => {
        // Exclude completely trashed tracks (frequent skips)
        const signal = this.getTrackSignal(id)
        if (signal && signal.playCount >= 3 && signal.avgCompletionRatio < 0.2) return false
        return true
      })
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, Math.max(0, Math.min(20, limit)))

    return sorted
  }
}

export const listeningTracker = new ListeningTracker()
