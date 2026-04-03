import { initCountdown, getDDayString } from '../../packages/shared/timer.js';
import { CommentUI } from '../../packages/shared/commentUI.js';

const TARGET_DATE = "January 2, 2027 00:00:00";

// 1. 카운트다운 초기화
initCountdown(TARGET_DATE, "clock-wonwoo");

// 2. 댓글 시스템 초기화 (멤버 ID: 'wonwoo')
CommentUI.init('wonwoo', () => getDDayString(TARGET_DATE));
