import { initCountdown } from '../../packages/shared/timer.js';
import { setupMemberDiamondUnlock } from '../../packages/shared/diamondUnlock.js';

const TARGET_DATE = 'January 2, 2027 00:00:00';

initCountdown(TARGET_DATE, 'clock-wonwoo');
setupMemberDiamondUnlock('wonwoo', TARGET_DATE);
