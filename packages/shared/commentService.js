/**
 * 댓글 서비스 레이어 (Cloudflare API와 통신)
 * 파일 경로: packages/shared/commentService.js
 */
export const CommentService = {
    // API 주소 (Pages Functions를 사용하여 루트 /api/comments에서 요청 처리)
    apiEndpoint: '/api/comments',

    /**
     * 특정 멤버와 특정 날짜의 댓글 목록을 가져옵니다. (페이징 지원)
     * @param {string} memberId - 멤버 식별자 (wonwoo, hoshi 등)
     * @param {string} dday - D-340 같은 날짜 키값
     * @param {string|number|null} cursor - 마지막으로 불러온 댓글 ID (더 보기 요청 시 필요)
     * @param {number} limit - 한 번에 가져올 개수 (기본 10개)
     */
    async fetchComments(memberId, dday, cursor = null, limit = 10) {
        try {
            // URL 파라미터 조립 (member, dday, limit, cursor)
            let url = `${this.apiEndpoint}?member=${memberId}&dday=${dday}&limit=${limit}`;
            if (cursor) url += `&cursor=${cursor}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('데이터를 가져오지 못했습니다.');
            return await response.json(); 
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    },

    /**
     * 새로운 댓글을 서버에 저장합니다.
     * @param {string} memberId - 멤버 식별자
     * @param {string} dday - D-340 같은 날짜 키값
     * @param {string} text - 작성된 댓글 내용
     */
    async saveComment(memberId, dday, text) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    memberId,
                    dday, 
                    text, 
                    // 한국 표준시(KST), 24시간 형식으로 날짜 생성 (예: 2026. 04. 01. 16:00:00 (KST))
                    date: new Date().toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    }) + ' (KST)'
                })
            });
            if (!response.ok) throw new Error('댓글을 저장하지 못했습니다.');
            return await response.json();
        } catch (error) {
            console.error('Error saving comment:', error);
            throw error;
        }
    },

    /**
     * 특정 ID의 댓글을 삭제합니다.
     * @param {number|string} id - 삭제할 댓글의 고유 ID
     */
    async deleteComment(id) {
        try {
            const response = await fetch(`${this.apiEndpoint}?id=${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('댓글을 삭제하지 못했습니다.');
            return await response.json();
        } catch (error) {
            console.error('Error deleting comment:', error);
            throw error;
        }
    }
};
