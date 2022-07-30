export default class UI {
    constructor() {
        this.baseArea = undefined
        this.timersArea = undefined
        this.timerCreatorInputTitle = undefined
        this.historyArea = undefined
    }

    clearCreatorTimerTitle() {
        this.timerCreatorInputTitle.value = ''

        return true
    }

    removeTimer(id) {
        const element = this.timersArea.querySelector(`[data-id="${id}"]`)
        if (element) element.remove()
    }

    _generateElement(el, cls, props = {}) {
        const element = document.createElement(el)

        if (Array.isArray(cls)) {
            element.classList.add(...cls)
        } else {
            element.classList.add(cls)
        }

        switch (el) {
            case 'input':
                element.type = props.type ?? 'text'
                if (props.name) element.name = props.name
                if (props.disabled) element.disabled = true

                switch (props.type) {
                    case 'file':
                        element.multiple = props.multiple ?? false
                        element.accept = props.accept ?? false
                        break
                    case 'text':
                        element.autocomplete = props.autocomplete ?? false
                        element.placeholder = props.placeholder ?? false
                        break
                    case 'checkbox':
                    case 'radio':
                        element.checked = props.checked ?? null
                }

                break
            case 'div':
            case 'span':
                element.innerText = props.innerText ?? null
                break
            case 'button':
                let textWrapperElement = false
                if (props.innerText) textWrapperElement = document.createElement('span')
                element.type = props.type ?? 'button'

                if (textWrapperElement) {
                    textWrapperElement.innerText = props.innerText
                    element.appendChild(textWrapperElement)
                }

                break
        }

        return element
    }

    _generateSettingsCheckbox(name, textContent, check) {
        const setting = this._generateElement('label', 'settings__item')
        const input = this._generateElement('input', 'settings__item-input', { type: 'checkbox', name: `settings-${name}`, checked: check })
        const text = this._generateElement('span', 'settings__item-text', { innerText: textContent })

        setting.appendChild(input)
        setting.appendChild(text)

        return setting
    }

    renderBaseDOM(props) {
        const baseArea = this._generateElement('div', 'timersArea')
        const timerCreatorArea = this._generateElement('div', 'creator')
        const timerCreatorInputTitle = this._generateElement('input', 'creator__title', { type: 'text', autocomplete: 'off', placeholder: 'Название таймера' })
        const timerCreatorButton = this._generateElement('button', ['creator__btn-create', 'btn', 'btn_text-icon'], { innerText: 'Создать' })
        const timersArea = this._generateElement('div', 'timers')
        const exportButton = this._generateElement('button', ['creator__btn-export', 'btn', 'btn_text-icon'], { innerText: 'Выгрузить' })
        const importButton = this._generateElement('button', ['creator__btn-import', 'btn', 'btn_text-icon'], { innerText: 'Загрузить' })
        const importInput = this._generateElement('input', 'creator__file', { type: 'file', multiple: false, accept: '.json' })
        const settingsButton = this._generateElement('button', ['creator__btn-settings', 'btn', 'btn_icon'])
        const settingsArea = this._generateElement('div', 'settings')
        const settingsAreaGrid = this._generateElement('div', 'settings__grid')
        const historyButton = this._generateElement('button', ['creator__btn-history', 'btn', 'btn_text-icon'], { innerText: 'История' })
        const historyArea = this._generateElement('div', ['history'])

        this.baseArea = baseArea

        timerCreatorInputTitle.dataset.area = 'creator-title-input'
        this.timerCreatorInputTitle = timerCreatorInputTitle


        this.timersArea = timersArea
        this.historyArea = historyArea

        const settings = [
            this._generateSettingsCheckbox('autostop', 'Останавливать при добавлении нового', false),
            this._generateSettingsCheckbox('stopOnReload', 'Останавливать при перезагрузке страницы', true),
            this._generateSettingsCheckbox('oneplay', 'Только один активный', false),
            this._generateSettingsCheckbox('replaceImport', 'Заменять при импорте', false),
        ]

        // Добавляем настройки в коллекцию
        settings.forEach((item) => {
            settingsAreaGrid.appendChild(item)
        })

        const timerCreatorAreaElements = [
            timerCreatorInputTitle,
            timerCreatorButton,
            exportButton,
            importButton,
            importInput,
            historyButton,
            settingsButton
        ]

        timerCreatorAreaElements.forEach((item) => {
            timerCreatorArea.appendChild(item)
        })

        settingsArea.appendChild(settingsAreaGrid)

        const baseAreaElements = [
            timerCreatorArea,
            settingsArea,
            timersArea,
            historyArea
        ]

        baseAreaElements.forEach((item) => {
            baseArea.appendChild(item)
        })

        document.body.appendChild(baseArea)

        return {
            baseArea,
            timerCreatorArea,
            timerCreatorInputTitle,
            timerCreatorButton,
            exportButton,
            importButton,
            importInput,
            settingsArea,
            settingsAutostop: settings[0],
            settingsStopOnReload: settings[1],
            settingsOnePlay: settings[2],
            settingsReplaceImport: settings[3],
            settingsButton,
            historyButton,
            historyArea,
            timersArea
        }
    }

    renderTimerDOM(timerID, props) {
        const timerArea = this._generateElement('div', 'timer')
        const timerTitleInput = this._generateElement('input', 'timer__title-input')
        const timerTitleValue = this.timerCreatorInputTitle.value.trim()
        const timerResult = this._generateElement('div', 'timer__result', { innerText: '00:00:00 — 0.00' })
        const timerPlayPause = this._generateElement('div', ['timer__button', 'timer__button_playpause', 'timer__button_playpause-paused'])
        const timerRemove = this._generateElement('div', ['timer__button', 'timer__button_remove'])
        const timerRestart = this._generateElement('div', ['timer__button', 'timer__button_restart'])

        timerArea.dataset.id = timerID
        timerTitleInput.value = timerTitleValue.length ? timerTitleValue : (props.defaultTitle ? props.defaultTitle : 'Untitled')

        const timerAreaElements = [
            timerTitleInput,
            timerPlayPause,
            timerResult,
            timerRestart,
            timerRemove
        ]

        timerAreaElements.forEach((item) => {
            timerArea.appendChild(item)
        })

        this.timersArea.appendChild(timerArea)

        this.clearCreatorTimerTitle()

        return {
            timerArea,
            timerTitleInput,
            timerPlayPause,
            timerResult,
            timerRestart,
            timerRemove
        }
    }

    addHistoryItem(html) {
        const element = this._generateElement('div', ['history__item'])
        element.insertAdjacentHTML('afterbegin', html)
        this.historyArea.insertAdjacentHTML('afterbegin', element)
    }
}
