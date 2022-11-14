import Base from '../_base';

export default class Timer extends Base {
	#activated = false;
	#started = false;
	#paused = 0;
	#pauseStarted = undefined;
	#title = undefined;

	constructor(title, duration) {
		super();
		if (duration) {
			const now = Date.now();

			this.#activated = true;
			this.#pauseStarted = now;
			this.#started = now - duration;
		}

		this.#title = title.length ? title : 'Задача без названия';
	}

	/**
	 * Возвращает строку, сформатированную для таймера
	 *
	 * @param {number} seconds
	 * @returns {String}
	 */
	getTimeString(seconds) {
		seconds = Math.floor(seconds / 1000);
		let h = Math.floor(seconds / 3600);
		seconds = seconds % 3600;
		let m = Math.floor(seconds / 60);
		let mPart = m / 60;
		let hours = (h + mPart).toFixed(2);
		let s = seconds % 60;

		h = this.prependZeros(h);
		m = this.prependZeros(m);
		s = this.prependZeros(s);

		return `${h}:${m}:${s} — ${hours}`;
	}

	/**
	 * Возвращает время, прошедшее в секундах с момента
	 * запуска таймера
	 *
	 * @return {Number}
	 */
	get durationSeconds() {
		const now = Date.now();
		if (this.#activated && !this.#pauseStarted) {
			// Работает и активирован
			return now - this.#started - this.#paused;
		} else if (!this.#activated) {
			// Не активирован
			return 0;
		} else {
			// На паузе
			return (
				now - this.#started - (now - this.#pauseStarted + this.#paused)
			);
		}
	}

	/**
	 * Возвращает отформатированное время для таймера
	 *
	 * @return {String}
	 */
	get getTime() {
		if (this.#activated && !this.#pauseStarted) {
			return this.getTimeString(
				Date.now() - this.#started - this.#paused
			);
		}

		return false;
	}

	/**
	 * Возвращает заголовок таймера
	 *
	 * @return {String}
	 */
	get getTitle() {
		return this.#title;
	}

	/**
	 * Возвращает время, для вывода в случае перезагрузки
	 *
	 * @return {String}
	 */
	get timeForReload() {
		return this.getTimeString(Date.now() - this.#started - this.#paused);
	}

	/**
	 * Возвращает состояние таймера, на паузе или нет?
	 *
	 * @return {Boolean}
	 */
	get isPaused() {
		return this.#pauseStarted ? true : false;
	}

	/**
	 * Возвращает полную информацию о таймере
	 *
	 * @return {Object}
	 */
	get timerData() {
		return {
			activated: this.#activated,
			started: this.#started,
			paused: this.#paused,
			pauseStarted: this.#pauseStarted,
			title: this.#title,
		};
	}

	/**
	 * Меняет заголовок таймера
	 *
	 * @param {String} title Новый заголовок таймера
	 */
	set title(title) {
		this.#title = title;
		return;
	}

	/**
	 * Ставит таймер на паузу
	 */
	pause() {
		const now = Date.now();

		if (this.#activated && !this.#pauseStarted) {
			this.#pauseStarted = now;
		}
	}

	/**
	 * Переключает плей/паузу
	 */
	playPause() {
		const now = Date.now();

		if (!this.#activated) {
			this.#activated = true;
			this.#started = now;
		} else if (this.#pauseStarted) {
			this.#paused += now - this.#pauseStarted;
			this.#pauseStarted = undefined;
		} else {
			this.#pauseStarted = now;
		}
	}

	/**
	 * Обнуляет данные таймера
	 */
	restart() {
		this.#activated = false;
		this.#started = false;
		this.#paused = 0;
		this.#pauseStarted = undefined;
	}
}
