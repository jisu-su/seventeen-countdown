import { CommentService } from './commentService.js';

/**
 * 다중 멤버 댓글 UI 및 이벤트 제어 모듈 (우지 버전 디자인 통합)
 * 파일 경로: packages/shared/commentUI.js
 */
export const CommentUI = {
    // 상태 관리
    memberId: null,      // 현재 페이지의 멤버 ID
    lastId: null,        // 페이징용 마지막 ID
    pageSize: 10,        // 한 번에 가져올 개수
    _getDDayFunc: null,   // D-Day 계산 함수 보관용
    _memberNames: {      // 멤버 식별자별 표시 이름
        'wonwoo': '원우',
        'hoshi': '호시',
        'jeonghan': '정한',
        'woozi': '우지'
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
            if (this._getDDayFunc) {
                this.renderComments(this._getDDayFunc);
            }
            document.body.style.overflow = 'hidden';
        } else {
            fanPage.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    /**
     * 댓글 삭제 처리 함수
     */
    async handleDelete(id) {
        if (!confirm("이 소중한 응원을 삭제할까요?")) return;

        try {
            const result = await CommentService.deleteComment(id);
            if (result.success) {
                if (this._getDDayFunc) {
                    this.renderComments(this._getDDayFunc);
                }
            } else {
                alert("삭제에 실패했습니다.");
            }
        } catch (e) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    },

    /**
     * 댓글 목록을 화면에 렌더링합니다. (우지 버전 디자인 적용)
     */
    async renderComments(getDDayString, isAppend = false) {
        const listContainer = document.getElementById('comment-list');
        if (!listContainer || !this.memberId) return;

        if (!isAppend) {
            this.lastId = null;
            listContainer.innerHTML = '<div class="loading">로딩 중...</div>';
        }

        const dday = getDDayString();
        const comments = await CommentService.fetchComments(this.memberId, dday, this.lastId, this.pageSize);

        if (comments.length === 0 && !isAppend) {
            listContainer.innerHTML = `<p class="empty-msg">${dday}의 첫 번째 응원을 남겨보세요! 💎</p>`;
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
                    <div class="comment-content">
                        <p>${escapedText}</p>
                        <small>${c.date}</small>
                    </div>
                    <button class="delete-btn" onclick="CommentUI.handleDelete(${c.id})">삭제</button>
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
     * 초기화 및 이벤트 바인딩
     */
    init(memberId, getDDayString) {
        this.memberId = memberId;
        this._getDDayFunc = getDDayString;

        // 1. 헤더 및 기본 구조 주입 (우지 버전 싱크)
        const fanPage = document.getElementById('fan-page');
        if (fanPage && !document.querySelector('.fan-header')) {
            const memberName = this._memberNames[memberId] || '멤버';
            fanPage.innerHTML = `
                <div class="fan-header">
                    <div class="header-title">
                        <span class="header-icon">💎</span>
                        <h2>캐럿 소통창</h2>
                    </div>
                    <p class="header-subtitle">${memberName}에게 따뜻한 응원의 한마디를 남겨주세요!</p>
                </div>
                <div class="card-body">
                    <div class="comment-input-container">
                        <textarea id="comment-input" placeholder="여기에 내용을 입력하세요..."></textarea>
                        <button id="submit-comment">등록하기</button>
                    </div>
                    <div id="comment-list"></div>
                </div>
            `;
        }

        const diamondBtn = document.getElementById('diamond-btn');
        const submitBtn = document.getElementById('submit-comment');
        const inputField = document.getElementById('comment-input');
        let backdrop = document.getElementById('modal-backdrop');

        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = 'modal-backdrop';
            backdrop.className = 'modal-backdrop';
            document.body.appendChild(backdrop);
        }

        if (diamondBtn) {
            diamondBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleComments();
            };
        }

        backdrop.onclick = () => this.toggleComments(true);

        const handleSave = async () => {
            const text = inputField.value.trim();
            if (!text) return;

            const dday = getDDayString();
            try {
                await CommentService.saveComment(this.memberId, dday, text);
                inputField.value = '';
                this.renderComments(getDDayString);
                
                const listContainer = document.getElementById('comment-list');
                if (listContainer) {
                    listContainer.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (e) {
                alert("댓글 저장에 실패했습니다.");
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
    }
};

// 전역객체에 노출 (inline onclick 핸들러에서 사용하기 위함)
window.CommentUI = CommentUI;
