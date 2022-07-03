export default class Timer {
    #activated = false
    #started = false
    #paused = 0
    #pauseStarted = undefined
    #title = undefined

    constructor(timerTitle) {
        this.#title = timerTitle
    }

    #getTimeString(seconds) {
        seconds = Math.floor(seconds / 1000)
        let h = Math.floor(seconds / 3600)
        seconds = seconds % 3600
        let m = Math.floor(seconds / 60)
        let mPart = m / 60
        let hours = (h + mPart).toFixed(2)
        let s = seconds % 60

        if (h < 10) h = `0${h}`
        if (m < 10) m = `0${m}`
        if (s < 10) s = `0${s}`

        return `${h}:${m}:${s} — ${hours}`
    }

    get getTime() {
        if (this.#activated && !this.#pauseStarted) {
            return this.#getTimeString(Date.now() - this.#started - this.#paused)
        }

        return false
    }

    get isPaused() {
        return this.#pauseStarted ? true : false
    }

    get timerData() {
        return {
            activated: this.#activated,
            started: this.#started,
            paused: this.#paused,
            pauseStarted: this.#pauseStarted,
            title: this.#title
        }
    }

    playPause() {
        const now = Date.now()

        if (!this.#activated) {

            this.#activated = true
            this.#started = now

        } else if (this.#pauseStarted) {

            this.#paused += now - this.#pauseStarted
            this.#pauseStarted = undefined

        } else {

            this.#pauseStarted = now

        }
    }

    restart() {
        this.#activated = false
        this.#started = false
        this.#paused = 0
        this.#pauseStarted = undefined
    }
}