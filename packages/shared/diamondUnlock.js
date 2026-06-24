import {
    createDiamondSvg,
    initDiamondState,
    isDiamondMemberUnlocked,
    unlockDiamondMember
} from './diamondState.js';

export function setupMemberDiamondUnlock(memberId, targetDateString) {
    const timerPage = document.getElementById('timer-page');
    const targetTime = new Date(targetDateString).getTime();

    if (!timerPage || Number.isNaN(targetTime)) {
        return;
    }

    function markUnlockableWhenReady() {
        if (Date.now() < targetTime) {
            return false;
        }

        timerPage.classList.add('is-unlockable');

        if (isDiamondMemberUnlocked(memberId)) {
            timerPage.classList.add('is-unlocked');
        }

        return true;
    }

    function handleUnlockClick() {
        if (Date.now() < targetTime) {
            return;
        }

        const unlockedNow = unlockDiamondMember(memberId);

        if (!unlockedNow) {
            timerPage.classList.add('is-unlocked');
            return;
        }

        timerPage.classList.add('is-unlocked');
        playDiamondUnlockAnimation();
    }

    if (!markUnlockableWhenReady()) {
        const intervalId = setInterval(() => {
            if (markUnlockableWhenReady()) {
                clearInterval(intervalId);
            }
        }, 1000);
    }

    timerPage.addEventListener('click', handleUnlockClick);
}

function playDiamondUnlockAnimation() {
    const overlay = document.createElement('div');
    const diamond = createDiamondSvg();

    overlay.className = 'diamond-unlock-overlay';
    diamond.classList.add('diamond-unlock-svg');
    overlay.append(diamond);
    document.body.append(overlay);

    initDiamondState(diamond);

    window.setTimeout(() => {
        overlay.classList.add('is-leaving');
    }, 1800);

    window.setTimeout(() => {
        overlay.remove();
    }, 2600);
}
