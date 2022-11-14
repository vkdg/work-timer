import Base from '../_base';

export default class Interface extends Base {
    constructor() {
        super();
    }

    generateTimer(timerID, props) {
        const area = this.ge('div', 'timer');
        const title = this.ge('input', 'timer__title-input');
        const result = this.ge('div', 'timer__result', {
            innerText: '00:00:00 — 0.00',
        });
        const playpause = this.ge('div', [
            'timer__button',
            'timer__button_playpause',
            'timer__button_playpause-paused',
        ]);
        const remove = this.ge('div', [
            'timer__button',
            'timer__button_remove',
        ]);
        const restart = this.ge('div', [
            'timer__button',
            'timer__button_restart',
        ]);

        const box = [title, playpause, result, restart, remove];
        box.forEach((el) => area.appendChild(el));

        title.value = props.timerTitle.trim().length
            ? props.timerTitle
            : 'Задача без названия';

        area.dataset.jsTimerId = timerID;

        return { area, title, result, playpause, remove, restart };
    }
}
