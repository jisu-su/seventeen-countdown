/**
 * 멤버 상세 페이지 부트스트랩
 * 파일 경로: packages/shared/memberPage.js
 *
 * sites/<member>/index.html 은 빈 껍데기이고, 화면에 들어갈 내용은 전부
 * 여기서 members.js의 데이터를 읽어 채운다. 멤버가 늘어나도 이 파일 하나만
 * 유지하면 되고, 멤버 폴더는 "이 멤버의 주소" 역할만 한다.
 */

import { getMemberById, getDischargeTime, formatDateDots } from './members.js';
import { initCountdown } from './timer.js';
import { setupMemberDiamondUnlock } from './diamondUnlock.js';

/**
 * 멤버 상세 페이지를 초기화한다.
 * @param {string} memberId members.js에 정의된 멤버 id
 */
export function initMemberPage(memberId) {
    const member = getMemberById(memberId);

    if (!member) {
        console.error(`[memberPage] members.js에 '${memberId}' 멤버가 없다.`);
        return;
    }

    const dischargeTime = getDischargeTime(member);

    document.title = `${member.name} Countdown : ${formatDateDots(member.dischargeDate)}`;

    const label = document.querySelector('[data-member-label]');
    if (label) {
        label.textContent = `${member.name} DISCHARGE COUNTDOWN`;
    }

    const page = document.getElementById('timer-page');
    if (page) {
        page.dataset.memberId = member.id;
    }

    initCountdown(dischargeTime, 'clock');
    setupMemberDiamondUnlock(member.id, dischargeTime);
}
