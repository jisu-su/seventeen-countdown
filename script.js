import { initCountdown } from './packages/shared/timer.js';

const members = [
    { id: 'jeonghan', date: "June 25, 2026 00:00:00" },
    { id: 'wonwoo', date: "January 2, 2027 00:00:00" },
    { id: 'woozi', date: "March 14, 2027 00:00:00" },
    { id: 'hoshi', date: "March 15, 2027 00:00:00" }
];

// 각 멤버별로 공통 타이머 실행
members.forEach(member => {
    initCountdown(member.date, `clock-${member.id}`);
});
