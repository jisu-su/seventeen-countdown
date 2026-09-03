/**
 * 멤버 데이터 단일 소스 (Single Source of Truth)
 * 파일 경로: packages/shared/members.js
 *
 * 멤버에 관한 모든 사실은 이 파일에만 적는다.
 * 허브 카드, 멤버 상세 페이지, 다이아몬드 셀 배정이 전부 여기를 참조한다.
 * 날짜 하나를 고칠 일이 생기면 이 파일만 고치면 된다.
 *
 * 배열 순서는 나이순(연장자 우선)이며, 이 순서가 곧 허브 카드 배치 순서다.
 * 다만 순서에 의존하지 말고 getMembersByAge()를 쓸 것 — birthDate로 다시 정렬한다.
 */

/** 한국 표준시 오프셋. 모든 날짜 계산의 기준. */
const KST_OFFSET = '+09:00';

/**
 * 'YYYY-MM-DD' 문자열을 한국시간 자정의 타임스탬프로 변환한다.
 *
 * new Date('2027-01-02')처럼 타임존 없는 문자열은 브라우저가 로컬 시간대로
 * 해석하기 때문에, 해외에서 접속하면 카운트다운이 한국 기준과 최대 하루까지
 * 어긋난다. 오프셋을 명시해 어디서 보든 같은 값이 나오게 한다.
 *
 * @param {string|null} dateString 'YYYY-MM-DD'
 * @returns {number|null} 밀리초 타임스탬프. 값이 없거나 형식이 틀리면 null.
 */
export function toKstMidnight(dateString) {
    if (!dateString) {
        return null;
    }

    const time = new Date(`${dateString}T00:00:00${KST_OFFSET}`).getTime();

    return Number.isNaN(time) ? null : time;
}

/**
 * @typedef {Object} Member
 * @property {string}      id             내부 식별자. localStorage와 DB의 member_id로도 쓰인다.
 * @property {string}      name           화면에 표시할 영문 이름
 * @property {string}      nameKo         한글 이름
 * @property {string}      birthDate      'YYYY-MM-DD'. 나이순 정렬 기준.
 * @property {string|null} enlistDate     'YYYY-MM-DD'. 확인 전이면 null.
 * @property {string}      dischargeDate  'YYYY-MM-DD'
 * @property {number}      diamondCell    다이아몬드 SVG에서 배정받은 셀 번호
 * @property {string}      href           허브 카드를 눌렀을 때 이동할 주소
 * @property {boolean}     external       외부 도메인이면 true (우지)
 * @property {Object}      features       멤버별로 켜고 끄는 기능
 * @property {boolean}     features.comments  캐럿 소통창 노출 여부
 * @property {Object|null} features.meals     급식표 설정. null이면 섹션 자체를 만들지 않는다.
 * @property {Array|null}  features.music     솔로곡 목록. null이면 섹션을 만들지 않는다.
 */

/** @type {Member[]} */
export const MEMBERS = [
    {
        id: 'jeonghan',
        name: 'JEONGHAN',
        nameKo: '정한',
        birthDate: '1995-10-04',
        enlistDate: '2024-09-26',
        dischargeDate: '2026-06-25',
        diamondCell: 5,
        href: './sites/jeonghan/index.html',
        external: false,
        features: { comments: false, meals: null, music: null }
    },
    {
        id: 'hoshi',
        name: 'HOSHI',
        nameKo: '호시',
        birthDate: '1996-06-15',
        enlistDate: '2025-09-16',
        dischargeDate: '2027-03-15',
        diamondCell: 8,
        href: './sites/hoshi/index.html',
        external: false,
        features: { comments: false, meals: null, music: null }
    },
    {
        id: 'wonwoo',
        name: 'WONWOO',
        nameKo: '원우',
        birthDate: '1996-07-17',
        enlistDate: '2025-04-03',
        dischargeDate: '2027-01-02',
        diamondCell: 6,
        href: './sites/wonwoo/index.html',
        external: false,
        features: { comments: false, meals: null, music: null }
    },
    {
        id: 'woozi',
        name: 'WOOZI',
        nameKo: '우지',
        birthDate: '1996-11-22',
        enlistDate: '2025-09-15',
        dischargeDate: '2027-03-14',
        diamondCell: 7,
        // 우지는 별도 저장소·별도 도메인으로 운영된다 (jisu-su/woozi-countdown)
        href: 'https://woozi-countdown.pages.dev',
        external: true,
        features: { comments: true, meals: null, music: null }
    }
];

/** id로 멤버를 찾는다. 없으면 undefined. */
export function getMemberById(id) {
    return MEMBERS.find(member => member.id === id);
}

/** 나이순(연장자 우선)으로 정렬한 새 배열을 돌려준다. */
export function getMembersByAge() {
    return [...MEMBERS].sort((a, b) => a.birthDate.localeCompare(b.birthDate));
}

/** 입대일의 한국시간 자정 타임스탬프. 미확인이면 null. */
export function getEnlistTime(member) {
    return toKstMidnight(member.enlistDate);
}

/** 전역일의 한국시간 자정 타임스탬프. */
export function getDischargeTime(member) {
    return toKstMidnight(member.dischargeDate);
}

/** 'YYYY-MM-DD' -> 'YYYY.MM.DD' (페이지 제목 표기용) */
export function formatDateDots(dateString) {
    return dateString ? dateString.replace(/-/g, '.') : '';
}

/**
 * 데이터 정합성 검사. 멤버를 추가한 뒤 실수를 잡기 위한 것으로,
 * 런타임에 자동 실행하지 않는다. 검증 스크립트에서 호출해 쓴다.
 *
 * @returns {string[]} 발견된 문제 목록. 비어 있으면 이상 없음.
 */
export function validateMembers(members = MEMBERS) {
    const problems = [];
    const seenIds = new Set();
    const seenCells = new Set();

    members.forEach(member => {
        const at = `[${member.id ?? '(id 없음)'}]`;

        if (!member.id) problems.push(`${at} id가 없다`);
        if (seenIds.has(member.id)) problems.push(`${at} id가 중복된다`);
        seenIds.add(member.id);

        if (seenCells.has(member.diamondCell)) {
            problems.push(`${at} diamondCell ${member.diamondCell}이 다른 멤버와 겹친다`);
        }
        seenCells.add(member.diamondCell);

        ['birthDate', 'dischargeDate'].forEach(field => {
            if (toKstMidnight(member[field]) === null) {
                problems.push(`${at} ${field}가 없거나 형식이 잘못됐다: ${member[field]}`);
            }
        });

        if (member.enlistDate !== null && toKstMidnight(member.enlistDate) === null) {
            problems.push(`${at} enlistDate 형식이 잘못됐다: ${member.enlistDate}`);
        }

        const enlist = toKstMidnight(member.enlistDate);
        const discharge = toKstMidnight(member.dischargeDate);

        if (enlist !== null && discharge !== null && enlist >= discharge) {
            problems.push(`${at} 입대일이 전역일보다 늦거나 같다`);
        }
    });

    return problems;
}
