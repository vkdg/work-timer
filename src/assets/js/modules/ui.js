export default class UI {
    constructor() {
        this.baseArea = undefined
        this.timersArea = undefined
        this.timerCreatorInputTitle = undefined
    }

    clearCreatorTimerTitle() {
        this.timerCreatorInputTitle.value = ''

        return true
    }

    removeTimer(id) {
        const element = this.timersArea.querySelector(`[data-id="${id}"]`)
        if (element) element.remove()
    }

    renderBaseDOM(props) {
        const baseArea = document.createElement('div')
        const timerCreatorArea = document.createElement('div')
        const timerCreatorInputTitle = document.createElement('input')
        const timerCreatorButton = document.createElement('button')
        const timersArea = document.createElement('div')

        baseArea.classList.add('timersArea')
        if (props.baseAreaClasses) baseArea.classList.add(...props.baseAreaClasses)
        this.baseArea = baseArea

        timerCreatorArea.classList.add('creator')
        if (props.creatorAreaClasses) timerCreatorArea.classList.add(...props.creatorAreaClasses)

        timerCreatorInputTitle.classList.add('creator__title')
        timerCreatorInputTitle.placeholder = props.customPlaceholder || 'Имя таймера (по умолчанию "Untitled")'
        timerCreatorInputTitle.autocomplete = 'off'
        if (props.creatorInputClasses) timerCreatorInputTitle.classList.add(...props.creatorInputClasses)
        this.timerCreatorInputTitle = timerCreatorInputTitle

        timerCreatorButton.classList.add('creator__button')
        timerCreatorButton.innerText = 'Создать таймер'
        if (props.creatorButtonClasses) timerCreatorButton.classList.add(...props.creatorButtonClasses)

        timersArea.classList.add('timers')
        this.timersArea = timersArea

        timerCreatorArea.appendChild(timerCreatorInputTitle)
        timerCreatorArea.appendChild(timerCreatorButton)

        baseArea.appendChild(timerCreatorArea)
        baseArea.appendChild(timersArea)

        document.body.appendChild(baseArea)

        return {
            baseArea,
            timerCreatorArea,
            timerCreatorInputTitle,
            timerCreatorButton,
            timersArea
        }
    }

    renderTimerDOM(timerID) {
        const timerArea = document.createElement('div')
        const timerTitle = document.createElement('div')
        const timerTitleValue = this.timerCreatorInputTitle.value.trim()
        const timerResult = document.createElement('div')
        const timerPlayPause = document.createElement('button')
        const timerRemove = document.createElement('button')
        const timerRestart = document.createElement('button')


        timerArea.classList.add('timer')
        timerArea.dataset.id = timerID

        timerTitle.innerText = timerTitleValue.length ? timerTitleValue : 'Untitled'
        this.clearCreatorTimerTitle()
        timerTitle.classList.add('timer__title')

        timerResult.innerText = `00:00:00 — 0.00`
        timerResult.classList.add('timer__result')

        timerPlayPause.classList.add('timer__button', 'timer__button_playpause')
        timerPlayPause.innerText = '▶'

        timerRemove.classList.add('timer__button', 'timer__button_remove')
        timerRemove.innerText = '⤫'

        timerRestart.classList.add('timer__button', 'timer__button_restart')
        timerRestart.innerText = '↻'

        timerArea.appendChild(timerTitle)
        timerArea.appendChild(timerPlayPause)
        timerArea.appendChild(timerResult)
        timerArea.appendChild(timerRestart)
        timerArea.appendChild(timerRemove)

        this.timersArea.appendChild(timerArea)

        return {
            timerArea,
            timerTitle,
            timerResult,
            timerPlayPause,
            timerRemove,
            timerRestart
        }
    }
}