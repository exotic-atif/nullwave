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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.signals))
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
  getSmartSeeds(historyTrackIds: string[], favTrackIds: string[], limit: number = 5): string[] {
    const scored = new Map<string, number>()

    const addWithScore = (trackIds: string[], baseWeight: number) => {
      for (const id of trackIds) {
        if (!id) continue
        
        const signal = this.getTrackSignal(id)
        let bonus = 0

        if (signal) {
          if (signal.avgCompletionRatio > 0.8) bonus = 2
          else if (signal.avgCompletionRatio > 0.5) bonus = 1
          else if (signal.avgCompletionRatio < 0.2 && signal.playCount >= 2) bonus = -3 // Frequent skip penalty
        }

        const score = baseWeight + (signal ? signal.playCount * 0.1 : 0) + bonus
        
        const existing = scored.get(id) || 0
        scored.set(id, existing + score)
      }
    }

    // Weight Favorites higher than just History
    addWithScore(favTrackIds, 3)
    addWithScore(historyTrackIds, 1)

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
      .slice(0, limit)

    return sorted
  }
}

export const listeningTracker = new ListeningTracker()
