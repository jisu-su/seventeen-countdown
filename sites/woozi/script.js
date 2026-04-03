import { initCountdown, getDDayString } from '../../packages/shared/timer.js';
import { CommentUI } from '../../packages/shared/commentUI.js';

const TARGET_DATE = "March 14, 2027 00:00:00";

// 1. 카운트다운 초기화
initCountdown(TARGET_DATE, "clock-woozi");

// 2. 댓글 시스템 초기화 (멤버 ID: 'woozi')
CommentUI.init('woozi', () => getDDayString(TARGET_DATE));
