// Include styles
import 'css/styles.scss';

// Include classes
import Timers from './modules/timers';
import Timer from './modules/timer';
import Interface from './modules/interface';

// Start work
document.addEventListener('DOMContentLoaded', () => {
    new Timers(Timer, Interface);
});
