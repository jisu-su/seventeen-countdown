/**
 * 멤버 하나를 화면 요소에 묶는 타이머
 * 파일 경로: packages/shared/memberTimer.js
 *
 * 상태에 따라 목표를 스스로 바꾼다. 입대 전이면 입대일을, 복무 중이면
 * 전역일을 센다. 입대일 자정을 넘기는 순간 새로고침 없이 목표가 전역일로
 * 넘어가고, 전역일을 넘기면 카운트다운을 멈춘다.
 */

import { getCountdownTarget, STATUS, getStatusClass, ALL_STATUS_CLASSES } from './memberStatus.js';
import { formatRemaining } from './timer.js';
import { subscribe } from './ticker.js';

/**
 * 전역 이후 카운트다운 자리에 넣을 문구.
 * 시계가 0에서 멈춘 모습을 그대로 두기로 했다. 바꾸고 싶으면
 * initMemberTimer의 dischargedText 옵션으로 넘기면 된다.
 */
export const DEFAULT_DISCHARGED_TEXT = formatRemaining(0);

/**
 * @param {Object}   member                 members.js의 멤버 객체
 * @param {Object}   options
 * @param {Element}  options.display        남은 시간을 그릴 요소
 * @param {Element}  [options.container]    상태 클래스를 붙일 요소. 없으면 display에 붙인다.
 * @param {string}   [options.dischargedText]
 * @param {(next: string, prev: string|null, member: Object) => void} [options.onStatusChange]
 *        상태가 바뀔 때 호출된다. 최초 1회는 prev가 null로 들어온다.
 * @returns {() => void} 구독 해제 함수
 */
export function initMemberTimer(member, options = {}) {
    const {
        display,
        container = display,
        dischargedText = DEFAULT_DISCHARGED_TEXT,
        onStatusChange
    } = options;

    if (!display) {
        console.error(`[memberTimer] '${member.id}'를 그릴 요소가 없다.`);
        return () => {};
    }

    let previousStatus = null;
    let lastText = null;

    return subscribe((now) => {
        const { status, targetTime } = getCountdownTarget(member, now);

        if (status !== previousStatus) {
            if (container) {
                container.classList.remove(...ALL_STATUS_CLASSES);
                container.classList.add(getStatusClass(status));
                container.dataset.memberStatus = status;
            }

            onStatusChange?.(status, previousStatus, member);
            previousStatus = status;
        }

        const text = status === STATUS.DISCHARGED
            ? dischargedText
            : formatRemaining(targetTime - now);

        // 같은 문자열을 다시 넣으면 불필요한 리페인트가 생긴다.
        if (text !== lastText) {
            display.textContent = text;
            lastText = text;
        }
    });
}
