/**
 * 남은 시간 계산과 표기
 * 파일 경로: packages/shared/timer.js
 *
 * 순수 함수만 둔다. 반복 실행은 ticker.js가, 상태 판정은 memberStatus.js가,
 * 화면에 그리는 일은 memberTimer.js가 맡는다.
 */

const MS = { SECOND: 1000, MINUTE: 60 * 1000, HOUR: 60 * 60 * 1000, DAY: 24 * 60 * 60 * 1000 };

/**
 * 남은 밀리초를 일/시/분/초로 쪼갠다. 음수는 0으로 눌러 담는다.
 *
 * @param {number} remainingMs
 * @returns {{days:number, hours:number, minutes:number, seconds:number}}
 */
export function splitRemaining(remainingMs) {
    const distance = Math.max(remainingMs, 0);

    return {
        days: Math.floor(distance / MS.DAY),
        hours: Math.floor((distance % MS.DAY) / MS.HOUR),
        minutes: Math.floor((distance % MS.HOUR) / MS.MINUTE),
        seconds: Math.floor((distance % MS.MINUTE) / MS.SECOND)
    };
}

/** '120d 04:14:03' 형태로 만든다. */
export function formatRemaining(remainingMs) {
    const { days, hours, minutes, seconds } = splitRemaining(remainingMs);
    const pad = (n) => String(n).padStart(2, '0');

    return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * 자정 기준 D-day 문자열. 카운트다운의 시분초에 영향받지 않는다.
 * 댓글을 날짜별로 묶을 때 쓰는 식별자이기도 하다.
 *
 * @param {number} targetTime 목표 시각 타임스탬프
 * @param {number} [now]
 * @returns {string} 'D-340' | 'D-Day' | 'D+12'
 */
export function getDDayString(targetTime, now = Date.now()) {
    const startOfDay = (t) => {
        const d = new Date(t);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    };

    const diffDays = Math.ceil((startOfDay(targetTime) - startOfDay(now)) / MS.DAY);

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return 'D-Day';
    return `D+${Math.abs(diffDays)}`;
}
