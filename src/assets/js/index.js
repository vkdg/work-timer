// Include styles
import 'css/styles.scss'

// Include scripts
import UI from 'js/modules/ui'
import Timer from 'js/modules/timer'
import Storage from 'js/modules/storage'
import SettingsStorage from 'js/modules/settings.storage'
import History from 'js/modules/history'

const ui = new UI()
const timers = new Map()
const storage = new Storage()
const settingsStorage = new SettingsStorage()
let history = undefined

let baseDOM = undefined
let timerID = 0

const storageAvailable = storage.available


const createTimer = () => {
    const timerDOM = ui.renderTimerDOM(timerID, {})
    const timer = new Timer(timerDOM.timerTitleInput.value)

    const stopOthers = baseDOM.settingsAutostop.querySelector('input').checked

    timers.set(timerID, { timerDOM, controls: timer })

    timerDOM.timerPlayPause.addEventListener('click', startStopTimer.bind(undefined, timer, timerDOM))
    timerDOM.timerRestart.addEventListener('click', restartTimer.bind(undefined, timer, timerDOM))
    timerDOM.timerRemove.addEventListener('click', removeTimer.bind(undefined, timerID))
    timerDOM.timerTitleInput.addEventListener('keyup', updateTimerTitle.bind(undefined, timer, timerDOM))

    if (stopOthers) {
        for (const key of timers.keys()) {
            const currentTimer = timers.get(key)
            currentTimer.controls.pause()
            currentTimer.timerDOM.timerPlayPause.classList.add('timer__button_playpause-paused')
        }

        history.add(`Таймеры остановлены после добавления нового`)
    }

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
        history.add(`Таймер <strong>&laquo;${timer.getTitle}&raquo;</strong> остановлен`)
    } else {
        timerDOM.timerPlayPause.classList.remove('timer__button_playpause-paused')
        history.add(`Таймер <strong>&laquo;${timer.getTitle}&raquo;</strong> запущен`)
    }
}

const removeTimer = (id, disableConfirm = false) => {
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
        createSettingsBackup()
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

const createSettingsBackup = () => {
    const autoStop = baseDOM.settingsAutostop.querySelector('input').checked
    const stopOnReload = baseDOM.settingsStopOnReload.querySelector('input').checked
    const onePlay = baseDOM.settingsOnePlay.querySelector('input').checked
    const replaceImport = baseDOM.settingsReplaceImport.querySelector('input').checked

    const settings = {
        autoStop,
        stopOnReload,
        onePlay,
        replaceImport
    }

    settingsStorage.save(settings)
}

const restoreSettingsFromBackup = (settingsBackup) => {
    try {
        console.log(settingsBackup)
        if (settingsBackup.autoStop) {
            baseDOM.settingsAutostop.querySelector('input').checked = true
        } else {
            baseDOM.settingsAutostop.querySelector('input').checked = false
        }
        if (settingsBackup.stopOnReload) {
            baseDOM.settingsStopOnReload.querySelector('input').checked = true
        } else {
            baseDOM.settingsStopOnReload.querySelector('input').checked = false
        }
        if (settingsBackup.onePlay) {
            baseDOM.settingsOnePlay.querySelector('input').checked = true
        } else {
            baseDOM.settingsOnePlay.querySelector('input').checked = false
        }
        if (settingsBackup.replaceImport) {
            baseDOM.settingsReplaceImport.querySelector('input').checked = true
        } else {
            baseDOM.settingsReplaceImport.querySelector('input').checked = false
        }
    } catch (e) {
        throw new Error(e)
    }
}

const generateTimersFromBackup = (timersBackup) => {
    const replaceImport = baseDOM.settingsReplaceImport.querySelector('input').checked

    try {
        if (replaceImport) {
            for (const key of timers.keys()) {
                timers.delete(key)
                ui.removeTimer(key)
            }
        }

        timersBackup.forEach((item, index) => {
            const timerDOM = ui.renderTimerDOM(index, { defaultTitle: item.title })

            const timer = new Timer(item.title, item.duration)

            timers.set(timerID, { timerDOM, controls: timer })

            timerDOM.timerPlayPause.addEventListener('click', startStopTimer.bind(undefined, timer, timerDOM))
            timerDOM.timerRestart.addEventListener('click', restartTimer.bind(undefined, timer, timerDOM))
            timerDOM.timerRemove.addEventListener('click', removeTimer.bind(undefined, index))
            timerDOM.timerTitleInput.addEventListener('keyup', updateTimerTitle.bind(undefined, timer, timerDOM))

            const displayTime = timer.timeForReload.length > 18 ? '00:00:00 — 0.00' : timer.timeForReload

            timerDOM.timerResult.innerText = displayTime

            history.add(`Таймер <strong>&laquo;${item.title}&raquo;</strong> восстановлен из резервной копии с значением <nobr>${displayTime}</nobr>`)

            timerID++
        })

        history.add('Таймеры восстановлены из локального хранилища')
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

        input.value = ''
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
    const elements = ui.renderBaseDOM()

    baseDOM = elements

    history = new History(baseDOM.historyArea)

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

    // Загрузка сохраненных таймеров и настроек
    if (storageAvailable) {
        const timersBackup = JSON.parse(storage.data)
        if (timersBackup.length > 0) generateTimersFromBackup(timersBackup)

        const settingsBackup = JSON.parse(settingsStorage.data)
        if (settingsBackup) restoreSettingsFromBackup(settingsBackup)
    }

    elements.importButton.addEventListener('click', () => { elements.importInput.click() })
    elements.timerCreatorButton.addEventListener('click', createTimer)
    elements.exportButton.addEventListener('click', exportTimers)
    elements.importInput.addEventListener('change', importTimersFromFile)
    elements.settingsButton.addEventListener('click', () => {
        elements.settingsArea.classList.toggle('settings-active')
        elements.settingsButton.classList.toggle('creator__btn-settings_active')
    })

    updateTimers()
})