export default class SettingsStorage {

    get data() {
        return localStorage.getItem('settings') ?? false
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
     * Сохраняет массив настроек в виде JSON строки в localStorage
     * 
     * @param {Array} settings
     */
    save(settings) {
        const data = JSON.stringify(settings)
        localStorage.setItem('settings', data)
    }
}