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

import { getMembersByAge } from './members.js';
import { STATUS } from './memberStatus.js';
import { initMemberTimer } from './memberTimer.js';
import { createDiamondSvg, initDiamondState, isDiamondMemberUnlocked } from './diamondState.js';

/**
 * 카드에 붙는 상태 설명. 카운트다운 숫자가 무엇까지 남은 시간인지
 * 알려주는 역할이다. 없애고 싶으면 이 객체의 값을 빈 문자열로 두면 된다.
 */
const STATUS_CAPTION = {
    [STATUS.UPCOMING]: 'UNTIL ENLISTMENT',
    [STATUS.SERVING]: 'UNTIL DISCHARGE',
    [STATUS.DISCHARGED]: 'DISCHARGED'
};

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

            if (next === STATUS.DISCHARGED) {
                renderUnlockedDiamond(member, card);
            }
        }
    });

    return card;
}

/**
 * 전역했고 해금까지 마친 멤버의 카드에 다이아몬드를 올린다.
 * 전 멤버에게 잠긴 상태로 미리 배치하는 작업은 #11에서 다룬다.
 */
function renderUnlockedDiamond(member, card) {
    if (!isDiamondMemberUnlocked(member.id) || card.querySelector('.member-diamond')) {
        return;
    }

    const diamond = createDiamondSvg();

    diamond.classList.add('member-diamond');
    card.classList.add('has-member-diamond');
    card.append(diamond);
    initDiamondState(diamond);
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
 * 허브를 그린다.
 * @param {Element} [container] 기본은 .hub-container
 */
export function renderHub(container = document.querySelector('.hub-container')) {
    if (!container) {
        console.error('[hub] .hub-container를 찾을 수 없다.');
        return;
    }

    const fragment = document.createDocumentFragment();

    getMembersByAge().forEach(member => fragment.append(createMemberCard(member)));
    fragment.append(createProgressTile());

    container.replaceChildren(fragment);
}
