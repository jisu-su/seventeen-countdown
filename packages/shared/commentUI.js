import { CommentService } from './commentService.js';

/**
 * 다중 멤버 댓글 UI 및 이벤트 제어 모듈
 * 파일 경로: packages/shared/commentUI.js
 */
export const CommentUI = {
    // 상태 관리
    memberId: null,    // 현재 페이지의 멤버 ID
    lastId: null,      // 페이징용 마지막 ID
    pageSize: 10,      // 한 번에 가져올 개수
    _getDDayFunc: null, // D-Day 계산 함수 보관용

    /**
     * 댓글 목록을 화면에 렌더링합니다.
     * @param {function} getDDayString - 현재 D-Day 문자열을 반환하는 함수
     * @param {boolean} isAppend - 기존 목록 뒤에 붙일지 여부
     */
    async renderComments(getDDayString, isAppend = false) {
        const listContainer = document.getElementById('comment-list');
        if (!listContainer || !this.memberId) return;

        if (!isAppend) {
            this.lastId = null;
            // 초기 로딩 시 스피너나 메시지 표시 가능 (생략)
        }

        const dday = getDDayString();
        const comments = await CommentService.fetchComments(this.memberId, dday, this.lastId, this.pageSize);

        if (comments.length === 0 && !isAppend) {
            listContainer.innerHTML = `<p style="text-align:center; color:#888; padding:30px;">${dday}의 첫 번째 응원을 남겨보세요! 💎</p>`;
            this.toggleLoadMoreButton(false);
            return;
        }

        const html = comments.map(c => {
            const escapedText = c.text
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

            return `
                <div class="comment-item">
                    <p>${escapedText}</p>
                    <small>${c.date}</small>
                </div>
            `;
        }).join('');

        if (isAppend) {
            listContainer.insertAdjacentHTML('beforeend', html);
        } else {
            listContainer.innerHTML = html;
        }

        if (comments.length > 0) {
            this.lastId = comments[comments.length - 1].id;
        }

        this.toggleLoadMoreButton(comments.length === this.pageSize);
    },

    /**
     * "더 보기" 버튼 제어
     */
    toggleLoadMoreButton(show) {
        let loadMoreBtn = document.getElementById('load-more-btn');
        const listContainer = document.getElementById('comment-list');
        if (!listContainer) return;

        if (show && !loadMoreBtn) {
            loadMoreBtn = document.createElement('button');
            loadMoreBtn.id = 'load-more-btn';
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.innerText = '댓글 더 보기 ▾';
            listContainer.after(loadMoreBtn);
            
            loadMoreBtn.onclick = () => {
                if (this._getDDayFunc) {
                    this.renderComments(this._getDDayFunc, true);
                }
            };
        }

        if (loadMoreBtn) {
            loadMoreBtn.style.display = show ? 'block' : 'none';
        }
    },

    /**
     * 댓글 창(모달)의 가시성을 토글합니다.
     */
    toggleComments(forceClose = false) {
        const fanPage = document.getElementById('fan-page');
        const backdrop = document.getElementById('modal-backdrop');
        
        if (!fanPage) return;

        const isOpening = !fanPage.classList.contains('active') && !forceClose;

        if (isOpening) {
            fanPage.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            // 열릴 때 최신 댓글 로드
            if (this._getDDayFunc) {
                this.renderComments(this._getDDayFunc);
            }
            // 스크롤 방지 (선택 사항)
            document.body.style.overflow = 'hidden';
        } else {
            fanPage.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * 초기화 및 이벤트 바인딩
     * @param {string} memberId - 멤버 고유 식별자 (wonwoo, hoshi 등)
     * @param {function} getDDayString - D-Day 문자열을 반환하는 함수
     */
    init(memberId, getDDayString) {
        this.memberId = memberId;
        this._getDDayFunc = getDDayString;

        // 1. 필수 요소 확인 및 이벤트 바인딩
        const diamondBtn = document.getElementById('diamond-btn');
        const submitBtn = document.getElementById('submit-comment');
        const inputField = document.getElementById('comment-input');
        let backdrop = document.getElementById('modal-backdrop');

        // 백드롭이 없으면 동적으로 생성
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'modal-backdrop';
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
        }

        // 💎 다이아몬드 버튼 클릭 이벤트
        if (diamondBtn) {
            diamondBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleComments();
            };
        }

        // 백드롭 클릭 시 닫기
        backdrop.onclick = () => this.toggleComments(true);

        // 댓글 등록 로직
        const handleSave = async () => {
            const text = inputField.value.trim();
            if (!text) return;

            const dday = getDDayString();
            try {
                await CommentService.saveComment(this.memberId, dday, text);
                inputField.value = '';
                this.renderComments(getDDayString);
                
                // 등록 성공 시 약간 위로 스크롤하여 새 댓글 확인
                const listContainer = document.getElementById('comment-list');
                if (listContainer) {
                    listContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (e) {
                alert("댓글 저장에 실패했습니다. (서버 상태를 확인해주세요)");
            }
        };

        if (submitBtn && inputField) {
            submitBtn.onclick = handleSave;
            inputField.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                }
            };
        }

        // 초기 댓글 로드는 모달이 열릴 때 수행하도록 토글 로직으로 위임됨
    }
};
