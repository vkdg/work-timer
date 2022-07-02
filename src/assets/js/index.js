import UI from './modules/ui'
import Timer from './modules/timer'

const ui = new UI()
const timers = new Map()

let timerID = 0

const removeTimer = id => {
    timers.delete(id)
    ui.removeTimer(id)
}

const startStopTimer = (timer, timerDOM) => {
    timer.playPause()

    if (timer.isPaused) {
        timerDOM.timerPlayPause.innerText = '▶'
    } else {
        timerDOM.timerPlayPause.innerText = '❙❙'
    }
}

const restartTimer = (timer, timerDOM) => {
    timer.restart()
    if (!timer.isPaused) timerDOM.timerPlayPause.innerText = '▶'
    timerDOM.timerResult.innerText = '00:00:00 — 0.00'
}

const createTimer = e => {
    const timerDOM = ui.renderTimerDOM(timerID)
    const timer = new Timer(timerDOM.timerTitleInput.value)

    timers.set(timerID, { timerDOM, controls: timer })

    timerDOM.timerPlayPause.addEventListener('click', startStopTimer.bind(undefined, timer, timerDOM))
    timerDOM.timerRestart.addEventListener('click', restartTimer.bind(undefined, timer, timerDOM))
    timerDOM.timerRemove.addEventListener('click', removeTimer.bind(undefined, timerID))

    timerID++

    console.log(createTimersBackup())
}

const updateTimers = () => {
    setInterval(() => {
        for (const key of timers.keys()) {
            const currentTimer = timers.get(key)
            const currentTime = currentTimer.controls.getTime

            if (currentTime) currentTimer.timerDOM.timerResult.innerText = currentTime
        }
    }, 1000);
}

const createTimersBackup = () => {
    if (timers.size > 0) {
        const timersArray = []
        for (const key of timers.keys()) {
            timersArray.push(timers.get(key).controls)
        }

        return timersArray
    }

    return false
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = ui.renderBaseDOM({
        baseAreaClasses: false, // [string]
        creatorAreaClasses: false, // [string]
        creatorInputClasses: false, // [string]
        customPlaceholder: false, // string
        creatorButtonClasses: false, // [string]
    })

    elements.timerCreatorButton.addEventListener('click', createTimer)
    updateTimers()
})