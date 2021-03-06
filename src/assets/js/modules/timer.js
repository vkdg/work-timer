export default class Timer {
    #activated = false
    #started = false
    #paused = 0
    #pauseStarted = undefined
    #title = undefined

    constructor(timerTitle, timerDuration) {
        if (timerDuration) {
            const now = Date.now()

            this.#activated = true
            this.#pauseStarted = now
            this.#started = now - timerDuration
        }

        this.#title = timerTitle ? timerTitle : 'Undefined'
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

    get durationSeconds() {
        const now = Date.now()
        if (this.#activated && !this.#pauseStarted) { // Работает и активирован
            return now - this.#started - this.#paused
        } else if (!this.#activated) { // Не активирован
            return 0
        } else { // На паузе
            return now - this.#started - (now - this.#pauseStarted + this.#paused)
        }
    }

    get getTime() {
        if (this.#activated && !this.#pauseStarted) {
            return this.#getTimeString(Date.now() - this.#started - this.#paused)
        }

        return false
    }

    get getTitle() {
        return this.#title
    }

    get timeForReload() {
        return this.#getTimeString(Date.now() - this.#started - this.#paused)
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

    set title(newTitle) {
        this.#title = newTitle
    }

    pause() {
        const now = Date.now()

        if (this.#activated && !this.#pauseStarted) {
            this.#pauseStarted = now
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
