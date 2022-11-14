export default class Base {
    constructor() {
        this.qs = this.qs;
        this.qsa = this.qsa;
        this.ge = this.ge;
        this.timers = new Map();
        this.prependZeros = this.prependZeros;
        this.isStorageAvailable = this.isStorageAvailable;
        this.getStorageData = this.getStorageData;
        this.setStorageData = this.setStorageData;

        return this;
    }

    /**
     * Алиас для document.querySelector
     *
     * @param {String} selector Селектор того, что ищем
     * @param {HTMLElement} target Нода, в которой производится поиск, по дефолту - document
     * @returns {Node}
     */
    qs(selector, target = document) {
        return target.querySelector(selector);
    }

    /**
     * Алиас для document.querySelectorAll
     *
     * @param {HTMLElement} target Нода, в которой производится поиск
     * @param {String} selector Слелектор того, что ищем
     * @returns {NodeList}
     */
    qsa(target = document, selector) {
        return target.querySelectorAll(selector);
    }

    /**
     * Добавляет ведущий ноль к числам менее 10
     *
     * @param {Number} num Число
     * @returns {String}
     */
    prependZeros(num) {
        return ('0' + num).slice(-2);
    }

    /**
     * Генерирует и возвращает новый элемент
     *
     * @param {String} el Тег нового элемента
     * @param {Array|String} cls Массив или класс нового элемента
     * @param {Object} props Свойства элемента
     *
     * @returns {HTMLElement} Элемент, который был сгенерирован
     */
    ge(el, cls, props = {}) {
        const $element = document.createElement(el);

        Array.isArray(cls)
            ? $element.classList.add(...cls)
            : $element.classList.add(cls);

        switch (el) {
            case 'input':
                $element.type = props.type ?? 'text';
                if (props.name) $element.name = props.name;
                if (props.disabled) $element.disabled = true;

                switch (props.type) {
                    case 'file':
                        $element.multiple = props.multiple ?? false;
                        $element.accept = props.accept ?? false;
                        break;
                    case 'text':
                        $element.autocomplete = props.autocomplete ?? false;
                        $element.placeholder = props.placeholder ?? false;
                        break;
                    case 'checkbox':
                    case 'radio':
                        $element.checked = props.checked ?? null;
                        break;
                }
                break;
            case 'div':
            case 'span':
                $element.innerText = props.innerText ?? null;
                break;
            case 'button':
                let textWrapperElement = false;
                if (props.innerText)
                    textWrapperElement = document.createElement('span');

                $element.type = props.type ?? 'button';

                if (textWrapperElement) {
                    textWrapperElement.innerText = props.innerText;
                    $element.appendChild(textWrapperElement);
                }
                break;
        }

        return $element;
    }

    /**
     * Проверяет доступность локального хранилища
     *
     * @returns {Boolean}
     */
    isStorageAvailable() {
        let storage;

        try {
            storage = window['localStorage'];
            let x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return (
                e instanceof DOMException &&
                (e.code === 22 ||
                    e.code === 1014 ||
                    e.code === 'QuotaExceededError' ||
                    e.code === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                storage &&
                storage.length !== 0
            );
        }
    }

    /**
     * Получает данные из локального хранилища
     */
    getStorageData() {
        return localStorage.getItem('timers') ?? false;
    }

    /**
     * Сохраняет массив в виде JSON строки в localStorage
     *
     * @param {Array} data Массив с таймерами
     */
    setStorageData(timers) {
        const data = JSON.stringify(timers);
        localStorage.setItem('timers', data);
    }
}
