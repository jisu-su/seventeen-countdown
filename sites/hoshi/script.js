import { initCountdown } from '../../packages/shared/timer.js';
import { setupMemberDiamondUnlock } from '../../packages/shared/diamondUnlock.js';

const TARGET_DATE = 'March 15, 2027 00:00:00';

initCountdown(TARGET_DATE, 'clock-hoshi');
setupMemberDiamondUnlock('hoshi', TARGET_DATE);
