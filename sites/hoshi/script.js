import { initCountdown, getDDayString } from '../../packages/shared/timer.js';

const TARGET_DATE = "March 15, 2027 00:00:00";

// 1. 카운트다운 초기화
initCountdown(TARGET_DATE, "clock-hoshi");
