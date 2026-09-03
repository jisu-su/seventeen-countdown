/**
 * 멤버 복무 상태 판정
 * 파일 경로: packages/shared/memberStatus.js
 *
 * 멤버는 시간에 따라 세 상태를 지난다.
 *
 *          입대일                     전역일
 *            │                          │
 *   UPCOMING │        SERVING           │  DISCHARGED
 *   (입대 전) │      (복무 중)            │  (전역 완료)
 *
 * 이 파일은 순수 계산만 한다. DOM도 타이머도 건드리지 않으므로
 * 테스트할 때 시각을 넣어 원하는 상태를 그대로 만들어볼 수 있다.
 */

import { getEnlistTime, getDischargeTime } from './members.js';

export const STATUS = {
    /** 아직 입대하지 않음. 입대일까지 센다. */
    UPCOMING: 'upcoming',
    /** 복무 중. 전역일까지 센다. */
    SERVING: 'serving',
    /** 전역 완료. 더 이상 셀 것이 없다. */
    DISCHARGED: 'discharged'
};

/**
 * 지금 이 멤버가 어느 상태인지 판정한다.
 *
 * @param {Object} member members.js의 멤버 객체
 * @param {number} [now] 기준 시각. 테스트에서 임의 시각을 넣기 위한 것.
 * @returns {string} STATUS 중 하나
 */
export function getMemberStatus(member, now = Date.now()) {
    const dischargeTime = getDischargeTime(member);

    if (dischargeTime !== null && now >= dischargeTime) {
        return STATUS.DISCHARGED;
    }

    const enlistTime = getEnlistTime(member);

    // 입대일을 모르는 멤버(enlistDate: null)는 이미 복무 중인 것으로 본다.
    // 확인되지 않았다고 해서 "입대 전"으로 표시하면 사실과 어긋난다.
    if (enlistTime !== null && now < enlistTime) {
        return STATUS.UPCOMING;
    }

    return STATUS.SERVING;
}

/**
 * 현재 상태에서 카운트다운이 향할 목표 시각.
 *
 * @returns {{status: string, targetTime: number|null}}
 *          DISCHARGED면 targetTime은 null (셀 것이 없다).
 */
export function getCountdownTarget(member, now = Date.now()) {
    const status = getMemberStatus(member, now);

    if (status === STATUS.UPCOMING) {
        return { status, targetTime: getEnlistTime(member) };
    }

    if (status === STATUS.SERVING) {
        return { status, targetTime: getDischargeTime(member) };
    }

    return { status, targetTime: null };
}

/**
 * 상태에 대응하는 CSS 클래스 이름.
 * 화면 표현은 #9에서 정하고, 여기서는 이름만 제공한다.
 */
export function getStatusClass(status) {
    return `is-${status}`;
}

/** 모든 상태 클래스 목록. 요소에서 이전 상태를 걷어낼 때 쓴다. */
export const ALL_STATUS_CLASSES = Object.values(STATUS).map(getStatusClass);
