// Include styles
import 'css/styles.scss'

import UI from 'js/modules/ui'
import Timer from 'js/modules/timer'

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
        timerDOM.timerPlayPause.classList.add('timer__button_playpause-paused')
    } else {
        timerDOM.timerPlayPause.classList.remove('timer__button_playpause-paused')
    }
}

const restartTimer = (timer, timerDOM) => {
    timer.restart()
    if (!timer.isPaused) timerDOM.timerPlayPause.classList.add('timer__button_playpause-paused')
    timerDOM.timerResult.innerText = '00:00:00 — 0.00'
}

const createTimer = () => {
    const timerDOM = ui.renderTimerDOM(timerID, {
        areaClasses: false, // array of strings || false
        titleInputClasses: false, // array of strings || false
        titleClasses: false, // array of strings || false
        defaultTitle: false, // string || false
        resultClasses: false, // array of strings || false
        playPauseClasses: false, // array of strings || false
        removeClasses: false, // array of strings || false
        restartClasses: false, // array of strings || false
    })
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
            timersArray.push(timers.get(key).controls.timerData)
        }

        return JSON.stringify(timersArray)
    }

    return false
}

document.addEventListener('DOMContentLoaded', () => {
    const elements = ui.renderBaseDOM({
        base: {
            areaClasses: false, // array of strings || false
        },
        creator: {
            areaClasses: false, // array of strings || false
            inputClasses: false, // array of strings || false
            inputPlaceholder: "Название таймера", // string || false,
            buttonClasses: false, // array of strings || false
            buttonText: false, // string || false
        }
    })

    document.addEventListener('keypress', e => {
        const target = e.target
        if (e.key === "Enter") {
            if (
                target.dataset.area === 'creator-title-input'
                && target.value.length > 0
            ) {
                createTimer()
            }
        }
    })

    elements.timerCreatorButton.addEventListener('click', createTimer)
    updateTimers()
})