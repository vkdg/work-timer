import Base from '../_base';

export default class Timers extends Base {
    #timerID = 0;

    constructor(Timer, Interface) {
        super();

        // -- Необходимый функционал
        this.interface = new Interface();
        this.timer = Timer;

        // -- Рабочие области
        this.$workArea = this.qs('[data-js="work-area"]');
        this.$creatorArea = this.qs('[data-js="creator-area"]', this.$workArea);
        this.$settingsArea = this.qs(
            '[data-js="settings-area"]',
            this.$workArea
        );
        this.$timersArea = this.qs('[data-js="timers-area"]', this.$workArea);

        // -- Кнопки управления
        // Создание таймера
        this.$buttonCreate = this.qs(
            '[data-js="create-button"]',
            this.$creatorArea
        );
        // Экспорт таймеров
        this.$buttonExport = this.qs(
            '[data-js="export-button"]',
            this.$creatorArea
        );
        // Импорт таймеров
        this.$buttonImport = this.qs(
            '[data-js="import-button"]',
            this.$creatorArea
        );
        // История изменения таймеров
        this.$buttonHistory = this.qs(
            '[data-js="history-button"]',
            this.$creatorArea
        );
        // Настройки
        this.$buttonSettings = this.qs(
            '[data-js="settings-button"]',
            this.$creatorArea
        );
        // Настройка "Останавливать при добавлении нового"
        this.$settingAutostop = this.qs(
            '[name="settings-autostop"]',
            this.$settingsArea
        );
        // Настройка "Останавливать при перезагрузке страницы"
        this.$settingStopOnReload = this.qs(
            '[name="settings-stopOnReload"]',
            this.$settingsArea
        );
        // Настройка "Только один активный"
        this.$settingOnePlay = this.qs(
            '[name="settings-oneplay"]',
            this.$settingsArea
        );
        // Настройка "Заменять при импорте"
        this.$settingReplaceImport = this.qs(
            '[name="settings-replaceImport"]',
            this.$settingsArea
        );
        // Настройка "Включить API"
        this.$settingEnableApi = this.qs(
            '[name="settings-enableApi"]',
            this.$settingsArea
        );
        // Поле настройки "Planfix API"
        this.$settingApiUrl = this.qs(
            '[name="settings-apiUrl"]',
            this.$settingsArea
        );
        // Поле настройки "API Key"
        this.$settingApiKey = this.qs(
            '[name="settings-apiKey"]',
            this.$settingsArea
        );

        // -- Инпуты
        // Инпут для заголовка нового таймера
        this.$titleInput = this.qs(
            '[data-js="title-input"]',
            this.$creatorArea
        );
        // Инпут для загрузки таймеров
        this.$uploadInput = this.qs(
            '[data-js="upload-input"]',
            this.$creatorArea
        );

        // Запускаем бинды и интервалы, если все ок, восстанавливаем таймеры
        if (this._bind()) {
            this.intervalWorks = this._intervals();

            if (this.intervalWorks && this.isStorageAvailable()) {
                const timersBackup = JSON.parse(this.getStorageData());
                if (timersBackup.length > 0)
                    this.generateTimersFromBackup(timersBackup);

                const settingsBackup = JSON.parse(
                    this.getStorageData('settings')
                );

                this.restoreSettingsFromBackup(settingsBackup);
            }
        }
    }

    /**
     * Привязывает события к кнопкам
     */
    _bind() {
        const self = this;
        let result = true;

        if (this.$buttonCreate) {
            this.$buttonCreate.addEventListener(
                'click',
                this.createTimer.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$buttonExport) {
            this.$buttonExport.addEventListener(
                'click',
                this.exportTimers.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$buttonImport) {
            this.$buttonImport.addEventListener(
                'click',
                this.buttonImportHandler.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$uploadInput) {
            this.$uploadInput.addEventListener(
                'change',
                this.importTimers.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$buttonHistory) {
            this.$buttonHistory.addEventListener(
                'click',
                this.showHistory.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$buttonSettings) {
            this.$buttonSettings.addEventListener(
                'click',
                this.showSettings.bind(this)
            );
        } else {
            result = false;
        }

        if (this.$titleInput) {
            this.$titleInput.addEventListener('keypress', (e) => {
                if (e.target.value.length && e.key === 'Enter') {
                    self.createTimer();
                }
            });
        } else {
            result = false;
        }

        return result;
    }

    /**
     * Запускает интервалы
     */
    _intervals() {
        return setInterval(this.updateActions.bind(this), 500);
    }

    /**
     * Создает таймер
     */
    createTimer() {
        // Генерируем экземпляр таймера
        const timer = new this.timer(this.$titleInput.value);

        // Генерируем интерфейс таймера
        const timerUI = this.interface.generateTimer(this.#timerID, {
            timerTitle: this.$titleInput.value,
        });

        // Добавляем таймер в коллекцию, вместе с интерфейсом и функциями управления
        this.timers.set(this.#timerID, { ui: timerUI, controls: timer });

        // Добавляем таймер на страницу
        this.$timersArea.appendChild(timerUI.area);

        // Добавляем отслеживания событий таймера
        timerUI.playpause.addEventListener(
            'click',
            this.timerStartStop.bind(this, timer, timerUI, this.#timerID)
        );
        timerUI.remove.addEventListener(
            'click',
            this.timerRemove.bind(this, this.#timerID, timerUI)
        );
        timerUI.restart.addEventListener(
            'click',
            this.timerRestart.bind(this, timer, timerUI)
        );
        timerUI.title.addEventListener(
            'keyup',
            this.timerChangeTitle.bind(this, timer, timerUI)
        );
        timerUI.getTask.addEventListener(
            'click',
            this.timerGetTaskName.bind(this, timer, timerUI)
        );

        // Если установлена настройка "Останавливать при добавлении нового, останавливаем таймеры"
        if (this.$settingAutostop.checked) {
            for (const key of this.timers.keys()) {
                const currentTimer = this.timers.get(key);
                if (!currentTimer.controls.isPaused) {
                    currentTimer.controls.pause();
                    currentTimer.ui.playpause.classList.add(
                        'timer__button_playpause-paused'
                    );
                }
            }
        }

        // Сбрасываем заголовок и увеличиваем счетчик
        this.$titleInput.value = '';
        this.#timerID++;
    }

    /**
     * Экспортирует таймеры
     */
    exportTimers() {
        const timersData = this.createTimersBackup(true);

        if (timersData.length > 0) {
            const timersString = JSON.stringify(timersData);
            const timersUri =
                'data:application/json;charset=utf-8,' +
                encodeURIComponent(timersString);
            const currentDate = new Date();

            let defaultFilename = 'data_timers.json';
            let year = currentDate.getFullYear();
            let month = currentDate.getMonth() + 1;
            let day = currentDate.getDate();

            month = this.prependZeros(month);
            day = this.prependZeros(day);

            defaultFilename = `${day}.${month}.${year}-${defaultFilename}`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', timersUri);
            linkElement.setAttribute('download', defaultFilename);
            linkElement.click();
            linkElement.remove();
        }
    }

    /**
     * Ручка для вызова диалога загрузки файла
     */
    buttonImportHandler() {
        if (this.$uploadInput) {
            this.$uploadInput.click();
        }
    }

    /**
     * Импортирует таймеры
     *
     * @param {Event} event Событие выбора файла
     */
    importTimers(event) {
        const input = event.target;
        const self = this;

        if (input.files.length === 1) {
            const file = input.files[0];
            const reader = new FileReader();

            reader.readAsText(file);

            reader.onload = function () {
                const timersBackup = JSON.parse(reader.result);
                if (timersBackup.length > 0)
                    self.generateTimersFromBackup(timersBackup);
            };

            input.value = '';
        }
    }

    /**
     * Показывает/скрывает историю изменений
     */
    showHistory() {
        // TODO: История изменений
    }

    /**
     * Показывает/скрывает настройки
     */
    showSettings() {
        this.$settingsArea.classList.toggle('settings-active');
    }

    /**
     * Запускает периодические события
     */
    updateActions() {
        // Обновляем таймеры
        this.updateTimers();
        // Обновляем хранилища
        this.updateStorage();
        // Обновляем заголовки страницы
        this.updatePageTitles();
    }

    /**
     * Обновляет таймеры
     */
    updateTimers() {
        for (const key of this.timers.keys()) {
            const currentTimer = this.timers.get(key);
            const currentTime = currentTimer.controls.getTime;

            if (currentTime) currentTimer.ui.result.innerText = currentTime;
        }
    }

    /**
     * Обновляет хранилища
     */
    updateStorage() {
        this.createTimersBackup();
        this.createSettingsBackup();
    }

    /**
     * Запускает/останавливает таймер
     */
    timerStartStop(timer, timerUI, timerID) {
        timer.playPause();

        // Если включена настройка "Один активный", пробегаемся по таймерам и стопаем их
        if (this.$settingOnePlay.checked && !timer.isPaused) {
            for (const key of this.timers.keys()) {
                const currentTimer = this.timers.get(key);
                if (!currentTimer.controls.isPaused && key != timerID) {
                    currentTimer.controls.pause();
                    currentTimer.ui.playpause.classList.add(
                        'timer__button_playpause-paused'
                    );
                }
            }
        }

        if (timer.isPaused) {
            timerUI.playpause.classList.add('timer__button_playpause-paused');
        } else {
            timerUI.playpause.classList.remove(
                'timer__button_playpause-paused'
            );
        }
    }

    /**
     * Удаляет таймер
     */
    timerRemove(timerID, timerUI) {
        if (confirm('Вы уверены, что хотите удалить таймер?')) {
            timerUI.area.remove();
            this.timers.delete(timerID);
        }
    }

    /**
     * Перезапускает таймер
     */
    timerRestart(timer, timerUI) {
        if (
            confirm(
                'Вы уверены, что хотите перезапустить таймер? Все данные будут потеряны.'
            )
        ) {
            timer.restart();

            if (
                !timerUI.playpause.classList.contains(
                    '.timer__button_playpause-paused'
                )
            ) {
                timerUI.playpause.classList.add(
                    'timer__button_playpause-paused'
                );
            }

            timerUI.result.innerText = '00:00:00 — 0.00';
        }
    }

    /**
     * Изменяет заголовок таймера
     */
    timerChangeTitle(timer, timerUI, event) {
        const currentTimerElement = event.target;
        const title = currentTimerElement.value.trim();

        if (title.length > 0) {
            timer.title = title;
        }
    }

    /**
     * Получает имя задачи из Planfix
     */
    timerGetTaskName(timer, timerUI, event) {
        const oldTitle = timer.getTitle;
        const TaskRegex = new RegExp('https\\:\\/\\/[a-z]+\\.[a-z]+\\.ru\\/task\\/([0-9]+)', 'gm')
        let match;

        while ((match = TaskRegex.exec(oldTitle)) !== null) {
            if (this.$settingEnableApi.checked && match[1]) {
                fetch(`${this.$settingApiUrl.value}rest/task/${match[1]}/?fields=id,name&access_token=${this.$settingApiKey.value}`, {
                    method: 'get'
                })
                .then(response => {
                    if (!response.ok) return false;
                    return response.json();
                })
                .then(response => {
                    if (response && response.result === "success") {
                        console.log(response.task);

                        timer.title = `${response.task.name} (${this.$settingApiUrl.value}task/${response.task.id})`;
                        timerUI.title.value = `${response.task.name} (${this.$settingApiUrl.value}task/${response.task.id})`;
                    }
                });
            }
        }
    }

    /**
     * Создает резервную копию таймеров
     *
     * @param {Boolean} toExport Данные необходимы для экспорта?
     * @returns {Boolean|Array} Данные с таймерами или результат сохранения в хранилище
     */
    createTimersBackup(toExport = false) {
        if (this.isStorageAvailable()) {
            const timersArray = [];
            for (const key of this.timers.keys()) {
                const currentTimer = this.timers.get(key);
                const timerData = {
                    duration: currentTimer.controls.durationSeconds,
                    title: currentTimer.controls.timerData.title,
                };
                timersArray.push(timerData);
            }

            if (toExport) return timersArray;

            this.setStorageData(timersArray);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Создает резервную копию настроек
     *
     * @param {Boolean} toExport Данные необходимы для экспорта?
     * @returns {Boolean|Array} Данные с настройками или результат сохранения в хранилище
     */
    createSettingsBackup(toExport = false) {
        const settings = {
            autostop: this.$settingAutostop.checked,
            // stopOnReload: this.$settingStopOnReload.checked,
            onePlay: this.$settingOnePlay.checked,
            // replaceImport: this.$settingReplaceImport.checked,
            enableApi: this.$settingEnableApi.checked,
            apiUrl: this.$settingApiUrl.value,
            apiKey: this.$settingApiKey.value,
        };

        this.setStorageData(settings, 'settings');
    }

    /**
     * Генерирует таймеры из резервной копии
     *
     * @param {Array} timersBackup Массив с резервной копией таймеров
     */
    generateTimersFromBackup(timersBackup) {
        try {
            timersBackup.forEach((item) => {
                // Генерируем экземпляр таймера
                const timer = new this.timer(item.title, item.duration);

                // Генерируем интерфейс таймера
                const timerUI = this.interface.generateTimer(this.#timerID, {
                    timerTitle: item.title,
                });

                // Добавляем таймер в коллекцию, вместе с интерфейсом и функциями управления
                this.timers.set(this.#timerID, {
                    ui: timerUI,
                    controls: timer,
                });

                // Добавляем таймер на страницу
                this.$timersArea.appendChild(timerUI.area);

                // Добавляем отслеживание событий таймера
                timerUI.playpause.addEventListener(
                    'click',
                    this.timerStartStop.bind(
                        this,
                        timer,
                        timerUI,
                        this.#timerID
                    )
                );
                timerUI.remove.addEventListener(
                    'click',
                    this.timerRemove.bind(this, this.#timerID, timerUI)
                );
                timerUI.restart.addEventListener(
                    'click',
                    this.timerRestart.bind(this, timer, timerUI)
                );
                timerUI.title.addEventListener(
                    'keyup',
                    this.timerChangeTitle.bind(this, timer, timerUI)
                );
                timerUI.getTask.addEventListener(
                    'click',
                    this.timerGetTaskName.bind(this, timer, timerUI)
                );

                // Добавляем уже прошедшее время в таймер
                const displayTime =
                    timer.timeForReload.length > 18
                        ? '00:00:00 — 0.00'
                        : timer.timeForReload;

                timerUI.result.innerText = displayTime;

                this.#timerID++;
            });
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     * Восстанавливает настройки из резервной копии
     *
     * @param {Object} settingsBackup
     */
    restoreSettingsFromBackup(settingsBackup) {
        if (settingsBackup.autostop) this.$settingAutostop.checked = true;
        if (settingsBackup.stopOnReload) this.$settingStopOnReload.checked = true;
        if (settingsBackup.onePlay) this.$settingOnePlay.checked = true;
        if (settingsBackup.replaceImport) this.$settingReplaceImport.checked = true;
        if (settingsBackup.enableApi) this.$settingEnableApi.checked = true;
        if (settingsBackup.apiUrl) this.$settingApiUrl.value = settingsBackup.apiUrl;
        if (settingsBackup.apiKey) this.$settingApiKey.value = settingsBackup.apiKey;
    }

    /**
     * Обновляет заголовки страницы
     */
    updatePageTitles() {
        const activeTimersTitles = [];

        for (const key of this.timers.keys()) {
            const currentTimer = this.timers.get(key);
            if (!currentTimer.controls.isPaused) {
                activeTimersTitles.push(currentTimer.controls.getTitle);
            }
        }

        if (activeTimersTitles.length > 1) {
            this.setPageTitle(
                `[▶] Запущенные задачи: ${activeTimersTitles.length}`
            );
        } else if (activeTimersTitles.length === 1) {
            this.setPageTitle(`[▶] ${activeTimersTitles[0]}`);
        } else {
            this.setPageTitle('Work Timers');
        }
    }
}
