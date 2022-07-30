export default class TimerStorage {

    get data() {
        return localStorage.getItem('timers') ?? false
    }

    get available() {
        let storage

        try {
            storage = window['localStorage']
            let x = '__storage_test__'
            storage.setItem(x, x)
            storage.removeItem(x)
            return true
        } catch (e) {
            return e instanceof DOMException && (
                e.code === 22 ||
                e.code === 1014 ||
                e.name === 'QuotaExceededError' ||
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
            ) && (storage && storage.length !== 0)
        }
    }

    /**
     * Сохраняет массив в виде JSON строки в localStorage
     *
     * @param {Array} data
     */
    save(timers) {
        const data = JSON.stringify(timers)
        localStorage.setItem('timers', data)
    }

}
