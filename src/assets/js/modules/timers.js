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
		return setInterval(this.updateActions.bind(this), 1000);
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
			this.timerStartStop.bind(this, timer, timerUI)
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
		// TODO: Добавить сохранение настроек в локальное хранилище
		this.createTimersBackup();
		// createSettingsBackup();
	}

	/**
	 * Запускает/останавливает таймер
	 */
	timerStartStop(timer, timerUI) {
		timer.playPause();

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
			if (!timer.isPaused)
				timerUI.playpause.classList.add(
					'timer__button_playpause-paused'
				);
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
			// createTimersBackup();
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
	 * Генерирует таймеры из резервной копии
	 *
	 * @param {Array} timersBackup Массив с резервной копией таймеров
	 */
	generateTimersFromBackup(timersBackup) {
		try {
			timersBackup.forEach((item, index) => {
				console.log(item);
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
					this.timerStartStop.bind(this, timer, timerUI)
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
}
