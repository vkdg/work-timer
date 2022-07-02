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
        this.baseArea = baseArea

        timerCreatorArea.classList.add('creator')

        timerCreatorInputTitle.classList.add('creator__title')
        timerCreatorInputTitle.placeholder = props.creator.inputPlaceholder || 'Имя таймера (по умолчанию "Untitled")'
        timerCreatorInputTitle.autocomplete = 'off'
        timerCreatorInputTitle.dataset.area = 'creator-title-input'
        this.timerCreatorInputTitle = timerCreatorInputTitle

        timerCreatorButton.classList.add('creator__button')
        timerCreatorButton.innerText = props.creator.buttonText || 'Создать'

        timersArea.classList.add('timers')
        this.timersArea = timersArea

        if (props.base.areaClasses) baseArea.classList.add(...props.base.areaClasses)
        if (props.creator.areaClasses) timerCreatorArea.classList.add(...props.creator.areaClasses)
        if (props.creator.inputClasses) timerCreatorInputTitle.classList.add(...props.creator.inputClasses)
        if (props.creator.buttonClasses) timerCreatorButton.classList.add(...props.creator.buttonClasses)

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

    renderTimerDOM(timerID, props) {
        const timerArea = document.createElement('div')
        const timerTitle = document.createElement('div')
        const timerTitleInput = document.createElement('input')
        const timerTitleValue = this.timerCreatorInputTitle.value.trim()
        const timerResult = document.createElement('div')
        const timerPlayPause = document.createElement('div')
        const timerRemove = document.createElement('div')
        const timerRestart = document.createElement('div')

        timerArea.classList.add('timer')
        timerArea.dataset.id = timerID

        timerTitleInput.value = timerTitleValue.length ? timerTitleValue : (props.defaultTitle ? props.defaultTitle : 'Untitled')
        timerTitleInput.classList.add('timer__title-input')

        timerTitle.innerText = timerTitleValue.length ? timerTitleValue : (props.defaultTitle ? props.defaultTitle : 'Untitled')
        timerTitle.classList.add('timer__title')

        timerResult.innerText = `00:00:00 — 0.00`
        timerResult.classList.add('timer__result')

        timerPlayPause.classList.add('timer__button', 'timer__button_playpause')
        timerPlayPause.innerText = '▶'

        timerRemove.classList.add('timer__button', 'timer__button_remove')
        timerRemove.innerText = '⤫'

        timerRestart.classList.add('timer__button', 'timer__button_restart')
        timerRestart.innerText = '↻'

        if (props.areaClasses) timerArea.classList.add(...props.areaClasses)
        if (props.titleInputClasses) timerTitleInput.classList.add(...props.titleInputClasses)
        if (props.titleClasses) timerTitle.classList.add(...props.titleClasses)
        if (props.resultClasses) timerResult.classList.add(...props.resultClasses)
        if (props.playPauseClasses) timerPlayPause.classList.add(...props.playPauseClasses)
        if (props.removeClasses) timerRemove.classList.add(...props.removeClasses)
        if (props.restartClasses) timerRestart.classList.add(...props.restartClasses)

        timerArea.appendChild(timerTitleInput)
        timerArea.appendChild(timerTitle)
        timerArea.appendChild(timerPlayPause)
        timerArea.appendChild(timerResult)
        timerArea.appendChild(timerRestart)
        timerArea.appendChild(timerRemove)
        this.timersArea.appendChild(timerArea)

        this.clearCreatorTimerTitle()

        return {
            timerArea,
            timerTitleInput,
            timerTitle,
            timerResult,
            timerPlayPause,
            timerRemove,
            timerRestart
        }
    }
}