import { initCountdown } from '../../packages/shared/timer.js';
import { setupMemberDiamondUnlock } from '../../packages/shared/diamondUnlock.js';

const TARGET_DATE = 'June 25, 2026 00:00:00';

initCountdown(TARGET_DATE, 'clock-jeonghan');
setupMemberDiamondUnlock('jeonghan', TARGET_DATE);
