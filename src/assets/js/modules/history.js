import UI from 'js/modules/ui.js'

export default class History {
    constructor(historyArea) {
        this.historyArea = historyArea
        this.ui = new UI()
    }

    add(text) {
        const historyElement = this.ui._generateElement('div', ['history__item'])
        const dateContainer = this.ui._generateElement('span', ['history__item-date'])
        const textContainer = this.ui._generateElement('span', ['history__item-text'])
        const dot = this.ui._generateElement('span', 'history__item-dot')
        const now = new Date(Date.now())
        let day = now.getDate()
        let month = now.getMonth() + 1
        let year = now.getFullYear()
        let hours = now.getHours()
        let minutes = now.getMinutes()
        let seconds = now.getSeconds()

        if (month < 10) month = `0${month}`
        if (hours < 10) hours = `0${hours}`
        if (minutes < 10) minutes = `0${minutes}`
        if (seconds < 10) seconds = `0${seconds}`

        dateContainer.innerHTML = `${day}.${month}.${year} &bull; ${hours}:${minutes}:${seconds}`
        textContainer.innerHTML = text

        historyElement.appendChild(dot)
        historyElement.appendChild(dateContainer)
        historyElement.appendChild(textContainer)

        this.historyArea.insertAdjacentElement('afterbegin', historyElement)
    }
}
