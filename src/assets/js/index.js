// Include styles
import 'css/styles.scss'

import UI from 'js/modules/ui'
import Timer from 'js/modules/timer'
import Storage from 'js/modules/storage'
import History from './modules/history'

const ui = new UI()
const timers = new Map()
const storage = new Storage()
// const history = new History()

let timerID = 0
// let historyDOM = undefined

const storageAvailable = storage.available


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
    timerDOM.timerTitleInput.addEventListener('keyup', updateTimerTitle.bind(undefined, timer, timerDOM))

    timerID++
}

const updateTimerTitle = (timer, timerDOM, e) => {
    const currentTimerElement = e.target
    const newTitle = currentTimerElement.value.trim()

    if (newTitle.length > 0) {
        timer.title = newTitle
        createTimersBackup()
    }
}

const restartTimer = (timer, timerDOM) => {
    if (confirm('Вы уверены, что хотите перезапустить таймер?')) {
        timer.restart()
        if (!timer.isPaused) timerDOM.timerPlayPause.classList.add('timer__button_playpause-paused')
        timerDOM.timerResult.innerText = '00:00:00 — 0.00'
    }
}

const startStopTimer = (timer, timerDOM) => {
    timer.playPause()

    if (timer.isPaused) {
        timerDOM.timerPlayPause.classList.add('timer__button_playpause-paused')
    } else {
        timerDOM.timerPlayPause.classList.remove('timer__button_playpause-paused')
    }
}

const removeTimer = id => {
    if (confirm('Вы уверены, что хотите удалить таймер?')) {
        timers.delete(id)
        ui.removeTimer(id)
    }
}

const updateTimers = () => {
    setInterval(() => {
        for (const key of timers.keys()) {
            const currentTimer = timers.get(key)
            const currentTime = currentTimer.controls.getTime

            if (currentTime) currentTimer.timerDOM.timerResult.innerText = currentTime
        }

        createTimersBackup()
    }, 1000);
}

const createTimersBackup = (toExport = false) => {
    if (storageAvailable) {
        const timersArray = []
        for (const key of timers.keys()) {
            const currentTimer = timers.get(key)
            const timerData = {
                duration: currentTimer.controls.durationSeconds,
                title: currentTimer.controls.timerData.title
            }
            timersArray.push(timerData)
        }

        if (toExport) return timersArray

        storage.save(timersArray)
    }

    return false
}

const generateTimersFromBackup = (timersBackup) => {
    try {
        timersBackup.forEach((item, index) => {
            const timerDOM = ui.renderTimerDOM(index, {
                areaClasses: false,
                titleInputClasses: false,
                titleClasses: false,
                defaultTitle: item.title,
                resultClasses: false,
                playPauseClasses: false,
                removeClasses: false,
                restartClasses: false,
            })

            const timer = new Timer(item.title, item.duration)

            timers.set(index, { timerDOM, controls: timer })

            timerDOM.timerPlayPause.addEventListener('click', startStopTimer.bind(undefined, timer, timerDOM))
            timerDOM.timerRestart.addEventListener('click', restartTimer.bind(undefined, timer, timerDOM))
            timerDOM.timerRemove.addEventListener('click', removeTimer.bind(undefined, index))
            timerDOM.timerTitleInput.addEventListener('keyup', updateTimerTitle.bind(undefined, timer, timerDOM))

            timerDOM.timerResult.innerText = timer.timeForReload.length > 18 ? '00:00:00 — 0.00' : timer.timeForReload

            timerID++
        })
    } catch (e) {
        throw new Error(e)
    }
}

const importTimersFromFile = (e) => {
    const input = e.target

    if (input.files.length === 1) {
        const file = input.files[0]
        const reader = new FileReader()

        reader.readAsText(file)

        reader.onload = function () {
            const timersBackup = JSON.parse(reader.result)
            if (timersBackup.length > 0) generateTimersFromBackup(timersBackup)
        }
    }
}

const exportTimers = () => {
    const timersData = createTimersBackup(true)

    if (timersData.length > 0) {
        const timersString = JSON.stringify(timersData)
        const timersUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(timersString)
        const currentDate = new Date()

        let defaultFilename = 'data_timers.json'
        let year = currentDate.getFullYear()
        let month = currentDate.getMonth() + 1
        let day = currentDate.getDate()

        if (month < 10) month = `0${month}`
        if (day < 10) day = `0${day}`

        defaultFilename = `${day}.${month}.${year}-${defaultFilename}`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', timersUri)
        linkElement.setAttribute('download', defaultFilename)
        linkElement.click()
    }
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
            importButtonClasses: false, // array of strings || false
            exportButtonClasses: false, // array of strings || false
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

    // historyDOM = ui.renderTimersHistoryDOM(elements.baseArea)

    // Загрузка сохраненных таймеров
    if (storageAvailable) {
        const timersBackup = JSON.parse(storage.data)
        if (timersBackup.length > 0) generateTimersFromBackup(timersBackup)
    }

    elements.importButton.addEventListener('click', () => { elements.importInput.click() })
    elements.timerCreatorButton.addEventListener('click', createTimer)
    elements.exportButton.addEventListener('click', exportTimers)
    elements.importInput.addEventListener('change', importTimersFromFile)
    elements.settingsButton.addEventListener('click', () => {
        elements.settingsArea.classList.toggle('settings-active')
        elements.settingsButton.classList.toggle('creator__button-settings_active')
    })
    updateTimers()
})