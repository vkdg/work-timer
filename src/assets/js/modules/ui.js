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
        if (props.base.areaClasses) baseArea.classList.add(...props.base.areaClasses)
        this.baseArea = baseArea

        timerCreatorArea.classList.add('creator')
        if (props.creator.areaClasses) timerCreatorArea.classList.add(...props.creator.areaClasses)

        timerCreatorInputTitle.classList.add('creator__title')
        timerCreatorInputTitle.placeholder = props.creator.inputPlaceholder || 'Имя таймера (по умолчанию "Untitled")'
        timerCreatorInputTitle.autocomplete = 'off'
        timerCreatorInputTitle.dataset.area = 'creator-title-input'
        if (props.creator.inputClasses) timerCreatorInputTitle.classList.add(...props.creator.inputClasses)
        this.timerCreatorInputTitle = timerCreatorInputTitle

        timerCreatorButton.classList.add('creator__button')
        timerCreatorButton.innerText = props.creator.buttonText || 'Создать'
        if (props.creator.buttonClasses) timerCreatorButton.classList.add(...props.creator.buttonClasses)

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
        const timerTitleInput = document.createElement('input')
        const timerTitleValue = this.timerCreatorInputTitle.value.trim()
        const timerResult = document.createElement('div')
        const timerPlayPause = document.createElement('button')
        const timerRemove = document.createElement('button')
        const timerRestart = document.createElement('button')


        timerArea.classList.add('timer')
        timerArea.dataset.id = timerID

        timerTitleInput.value = timerTitleValue.length ? timerTitleValue : 'Untitled'
        timerTitleInput.classList.add('timer__title-input')

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

        timerArea.appendChild(timerTitleInput)
        timerArea.appendChild(timerTitle)
        timerArea.appendChild(timerPlayPause)
        timerArea.appendChild(timerResult)
        timerArea.appendChild(timerRestart)
        timerArea.appendChild(timerRemove)

        this.timersArea.appendChild(timerArea)

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