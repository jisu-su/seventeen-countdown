export const DIAMOND_STORAGE_KEY = 'svt_diamond_unlocked';

export const MEMBER_CELL_MAP = {
    jeonghan: 5,
    wonwoo: 6,
    woozi: 7,
    hoshi: 8
};

export const DEFAULT_ACTIVE_CELLS = [1, 2, 3, 4];

const DIAMOND_CELLS = [
    [1, '110,50 40,150 180,150'],
    [2, '110,50 250,50 180,150'],
    [3, '250,50 180,150 320,150'],
    [4, '250,50 390,50 320,150'],
    [5, '390,50 320,150 460,150'],
    [6, '40,150 110,250 180,150'],
    [7, '180,150 110,250 250,250'],
    [8, '180,150 250,250 320,150'],
    [9, '320,150 250,250 390,250'],
    [10, '320,150 390,250 460,150'],
    [11, '110,250 180,350 250,250'],
    [12, '250,250 180,350 320,350'],
    [13, '250,250 320,350 390,250'],
    [14, '180,350 250,450 320,350']
];

let diamondInstanceId = 0;

function readUnlockedMembers() {
    try {
        const stored = localStorage.getItem(DIAMOND_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(memberId => Object.prototype.hasOwnProperty.call(MEMBER_CELL_MAP, memberId));
    } catch {
        return [];
    }
}

export function getUnlockedMembers() {
    return [...new Set(readUnlockedMembers())];
}

export function getActiveDiamondCells() {
    const unlockedCells = getUnlockedMembers().map(memberId => MEMBER_CELL_MAP[memberId]);

    return [...new Set([...DEFAULT_ACTIVE_CELLS, ...unlockedCells])];
}

export function unlockDiamondMember(memberId) {
    if (!Object.prototype.hasOwnProperty.call(MEMBER_CELL_MAP, memberId)) {
        return false;
    }

    const unlockedMembers = getUnlockedMembers();

    if (unlockedMembers.includes(memberId)) {
        return false;
    }

    localStorage.setItem(DIAMOND_STORAGE_KEY, JSON.stringify([...unlockedMembers, memberId]));
    return true;
}

export function isDiamondMemberUnlocked(memberId) {
    return getUnlockedMembers().includes(memberId);
}

export function initDiamondState(root = document) {
    getActiveDiamondCells().forEach(cellNumber => {
        const cell = root.querySelector
            ? root.querySelector(`[data-cell="${cellNumber}"]`)
            : root.getElementById(`cell-${cellNumber}`);

        if (cell) {
            cell.classList.add('active');
        }
    });
}

export function createDiamondSvg() {
    const namespace = 'http://www.w3.org/2000/svg';
    const uniqueId = `diamond-${diamondInstanceId += 1}`;
    const clearLineId = `${uniqueId}-clear-line`;
    const activeFillId = `${uniqueId}-active-fill`;
    const svg = document.createElementNS(namespace, 'svg');
    const defs = document.createElementNS(namespace, 'defs');
    const clearLine = document.createElementNS(namespace, 'linearGradient');
    const activeFill = document.createElementNS(namespace, 'linearGradient');
    const group = document.createElementNS(namespace, 'g');

    svg.setAttribute('viewBox', '0 0 500 500');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'SEVENTEEN diamond unlock progress');
    svg.style.setProperty('--diamond-clear-line', `url(#${clearLineId})`);
    svg.style.setProperty('--diamond-active-fill', `url(#${activeFillId})`);

    clearLine.setAttribute('id', clearLineId);
    clearLine.setAttribute('x1', '0%');
    clearLine.setAttribute('y1', '0%');
    clearLine.setAttribute('x2', '100%');
    clearLine.setAttribute('y2', '100%');
    appendStop(clearLine, '0%', '#FFFFFF', '1');
    appendStop(clearLine, '100%', '#D9F1FF', '1');

    activeFill.setAttribute('id', activeFillId);
    activeFill.setAttribute('x1', '0%');
    activeFill.setAttribute('y1', '100%');
    activeFill.setAttribute('x2', '100%');
    activeFill.setAttribute('y2', '0%');
    appendStop(activeFill, '0%', '#B9E7FF', '0.9');
    appendStop(activeFill, '55%', '#6FB8FF', '0.9');
    appendStop(activeFill, '100%', '#2F6FE4', '0.92');

    defs.append(clearLine, activeFill);
    group.classList.add('diamond-cells');

    DIAMOND_CELLS.forEach(([cellNumber, points]) => {
        const polygon = document.createElementNS(namespace, 'polygon');
        polygon.setAttribute('id', `${uniqueId}-cell-${cellNumber}`);
        polygon.setAttribute('data-cell', String(cellNumber));
        polygon.setAttribute('points', points);
        polygon.classList.add('diamond-cell');
        group.append(polygon);
    });

    svg.append(defs, group);
    return svg;
}

function appendStop(gradient, offset, color, opacity) {
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop.setAttribute('offset', offset);
    stop.setAttribute('stop-color', color);
    stop.setAttribute('stop-opacity', opacity);
    gradient.append(stop);
}
