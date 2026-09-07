/**
 * 허브 화면 조립
 * 파일 경로: packages/shared/hub.js
 *
 * index.html은 빈 그리드 컨테이너만 갖고 있고, 카드는 여기서 members.js를
 * 읽어 만든다. 멤버를 추가할 때 HTML을 손댈 일이 없다.
 *
 * 배치는 나이순(연장자 우선)이며, 데스크톱에서 5열 2행으로 10칸이 된다.
 * 멤버 9명이 앞을 채우고 마지막 한 칸은 그룹 전체 다이아몬드 진행도 타일이다.
 */

import { getMembersByAge, getMemberById } from './members.js';
import { STATUS } from './memberStatus.js';
import { initMemberTimer } from './memberTimer.js';
import { playDiamondUnlockAnimation } from './diamondUnlock.js';
import {
    createDiamondSvg,
    initDiamondState,
    isDiamondMemberUnlocked,
    unlockDiamondMember
} from './diamondState.js';

/**
 * 카드에 붙는 상태 설명. 카운트다운 숫자가 무엇까지 남은 시간인지
 * 알려주는 역할이다. 없애고 싶으면 이 객체의 값을 빈 문자열로 두면 된다.
 */
const STATUS_CAPTION = {
    [STATUS.UPCOMING]: 'UNTIL ENLISTMENT',
    [STATUS.SERVING]: 'UNTIL DISCHARGE',
    [STATUS.DISCHARGED]: 'DISCHARGED'
};

/**
 * 아직 전역하지 않은 멤버의 카드에도 다이아몬드를 잠긴 상태로 깔아둘지.
 *
 * true  — 9칸 모두에 흐린 다이아몬드가 보인다. 무엇이 기다리고 있는지
 *         미리 알 수 있지만 화면이 다소 빽빽해진다.
 * false — 전역한 멤버의 카드에만 나타난다. 10번째 칸의 진행도 타일이
 *         전체 상황을 대신 보여준다.
 */
const SHOW_LOCKED_DIAMOND_ON_ALL_CARDS = true;

function createMemberCard(member) {
    const card = document.createElement('a');

    card.className = 'member-card';
    card.href = member.href;
    card.dataset.memberId = member.id;

    if (member.external) {
        card.rel = 'noopener';
    }

    const label = document.createElement('span');
    label.className = 'timer-label';
    label.textContent = member.name;

    const display = document.createElement('span');
    display.className = 'countdown-display';
    display.id = `clock-${member.id}`;

    const caption = document.createElement('span');
    caption.className = 'card-caption';

    card.append(label, display, caption);

    initMemberTimer(member, {
        display,
        container: card,
        onStatusChange(next) {
            caption.textContent = STATUS_CAPTION[next] ?? '';
            syncMemberDiamond(member, card, next);
        }
    });

    return card;
}

/**
 * 카드의 다이아몬드를 현재 상태에 맞춘다.
 *
 * 잠김   — 아직 해금하지 않음. 흐린 윤곽선만 보인다.
 * 해금됨 — 셀이 채워지고 빛난다.
 * 전역했는데 아직 해금하지 않았으면 카드에 눌러보라는 신호를 준다.
 */
function syncMemberDiamond(member, card, status) {
    const unlocked = isDiamondMemberUnlocked(member.id);
    const shouldShow = unlocked
        || status === STATUS.DISCHARGED
        || SHOW_LOCKED_DIAMOND_ON_ALL_CARDS;

    card.classList.toggle('is-awaiting-unlock', status === STATUS.DISCHARGED && !unlocked);

    if (!shouldShow) {
        card.querySelector('.member-diamond')?.remove();
        card.classList.remove('has-member-diamond');
        return;
    }

    let diamond = card.querySelector('.member-diamond');

    if (!diamond) {
        diamond = createDiamondSvg();
        diamond.classList.add('member-diamond');
        card.classList.add('has-member-diamond');
        card.append(diamond);
    }

    diamond.classList.toggle('is-locked', !unlocked);

    if (unlocked) {
        initDiamondState(diamond);
    }
}

/**
 * 10번째 칸. 지금까지 전역한 멤버 수만큼 셀이 채워진 전체 다이아몬드를 보여준다.
 * 멤버 카드가 아니므로 클릭해도 이동하지 않는다.
 */
function createProgressTile() {
    const tile = document.createElement('div');
    const diamond = createDiamondSvg();

    tile.className = 'hub-tile hub-tile--progress';
    diamond.classList.add('progress-diamond');
    tile.append(diamond);
    initDiamondState(diamond);

    return tile;
}

/**
 * 주소에 ?unlock=<id> 가 붙어 오면 그 멤버를 해금한다.
 *
 * 우지는 별도 도메인이라 그쪽에서 해금해도 허브의 localStorage에는 남지
 * 않는다. 우지 사이트가 해금 후 이 파라미터를 달고 돌려보내면 허브가
 * 받아서 자기 쪽에 기록한다.
 *
 * 처리한 뒤 주소창을 정리해, 새로고침할 때마다 연출이 반복되지 않게 한다.
 *
 * @returns {boolean} 이번에 새로 해금됐으면 true
 */
function consumeUnlockParam() {
    const params = new URLSearchParams(window.location.search);
    const memberId = params.get('unlock');

    if (!memberId) {
        return false;
    }

    const unlockedNow = Boolean(getMemberById(memberId)) && unlockDiamondMember(memberId);

    window.history.replaceState(null, '', window.location.pathname);

    return unlockedNow;
}

/**
 * 허브를 그린다.
 * @param {Element} [container] 기본은 .hub-container
 */
export function renderHub(container = document.querySelector('.hub-container')) {
    if (!container) {
        console.error('[hub] .hub-container를 찾을 수 없다.');
        return;
    }

    // 카드를 만들기 전에 처리해야 방금 해금한 멤버가 곧바로 반영된다.
    const unlockedNow = consumeUnlockParam();

    const fragment = document.createDocumentFragment();

    getMembersByAge().forEach(member => fragment.append(createMemberCard(member)));
    fragment.append(createProgressTile());

    container.replaceChildren(fragment);

    if (unlockedNow) {
        playDiamondUnlockAnimation();
    }
}
