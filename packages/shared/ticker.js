/**
 * 공용 1초 틱
 * 파일 경로: packages/shared/ticker.js
 *
 * 예전에는 타이머와 다이아몬드 해금이 각자 setInterval을 돌렸다. 멤버가
 * 9명이 되면 허브 한 페이지에서만 인터벌이 18개 도는 셈이라, 전부 하나로
 * 모은다. 구독자가 없으면 인터벌 자체를 멈춘다.
 *
 * 브라우저는 백그라운드 탭의 타이머를 늦추거나 멈춘다. 그래서 탭이 다시
 * 보이는 순간 곧바로 한 번 돌려, 그동안 지나간 입대일·전역일을 놓치지 않게 한다.
 */

const subscribers = new Set();
let intervalId = null;

function tick() {
    const now = Date.now();

    // 구독 목록이 콜백 안에서 바뀔 수 있으므로 복사본을 순회한다.
    [...subscribers].forEach(callback => {
        try {
            callback(now);
        } catch (error) {
            console.error('[ticker] 구독자에서 오류가 발생했다.', error);
        }
    });
}

function handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
        tick();
    }
}

function start() {
    if (intervalId !== null) {
        return;
    }

    intervalId = setInterval(tick, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
}

function stop() {
    if (intervalId === null) {
        return;
    }

    clearInterval(intervalId);
    intervalId = null;
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * 매초 호출받을 콜백을 등록한다. 등록 즉시 한 번 호출된다.
 *
 * @param {(now: number) => void} callback
 * @returns {() => void} 구독을 해제하는 함수
 */
export function subscribe(callback) {
    subscribers.add(callback);
    start();
    callback(Date.now());

    return () => {
        subscribers.delete(callback);

        if (subscribers.size === 0) {
            stop();
        }
    };
}

/** 다음 틱을 기다리지 않고 지금 한 번 돌린다. */
export function tickNow() {
    tick();
}

/** 현재 구독자 수. 검증용. */
export function getSubscriberCount() {
    return subscribers.size;
}
