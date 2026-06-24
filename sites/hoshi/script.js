import { initCountdown } from '../../packages/shared/timer.js';
import { setupMemberDiamondUnlock } from '../../packages/shared/diamondUnlock.js';

// 테스트 전용 동적 날짜 계산 (test/diamond-unlock-flow 브랜치)
let testStartTime = localStorage.getItem('svt_test_start_time');
if (!testStartTime) {
    testStartTime = Date.now().toString();
    localStorage.setItem('svt_test_start_time', testStartTime);
}
const startMs = parseInt(testStartTime, 10);
const TARGET_DATE = new Date(startMs + 240 * 1000).toISOString();

initCountdown(TARGET_DATE, 'clock-hoshi');
setupMemberDiamondUnlock('hoshi', TARGET_DATE);
