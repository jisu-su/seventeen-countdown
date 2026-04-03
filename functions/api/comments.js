/**
 * 다중 멤버 댓글 API (D1 데이터베이스 연동)
 * 파일 경로: functions/api/comments.js
 */

// [GET] 특정 멤버와 날짜(D-Day)의 댓글을 페이징 처리하여 가져옵니다.
export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const memberId = searchParams.get('member'); // 필수: 멤버 식별자 (wonwoo, hoshi 등)
  const dday = searchParams.get('dday');       // 필수: 조회할 날짜 (D-340 등)
  const limit = parseInt(searchParams.get('limit') || '10'); // 선택: 한 번에 가져올 개수 (기본 10개)
  const cursor = searchParams.get('cursor');   // 선택: 마지막으로 본 댓글의 ID (이후 데이터를 가져오기 위함)

  if (!memberId || !dday) {
    return new Response(JSON.stringify({ error: 'member와 dday 파라미터가 필요합니다.' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let results;
    
    // 커서(마지막 ID)가 있는 경우: 해당 ID보다 작은(더 과거의) 데이터를 가져옴
    if (cursor) {
      const query = await context.env.DB.prepare(
        "SELECT * FROM comments WHERE member_id = ? AND dday = ? AND id < ? ORDER BY id DESC LIMIT ?"
      )
      .bind(memberId, dday, cursor, limit)
      .all();
      results = query.results;
    } 
    // 커서가 없는 경우 (최초 로딩): 가장 최신 데이터부터 가져옴
    else {
      const query = await context.env.DB.prepare(
        "SELECT * FROM comments WHERE member_id = ? AND dday = ? ORDER BY id DESC LIMIT ?"
      )
      .bind(memberId, dday, limit)
      .all();
      results = query.results;
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// [POST] 새로운 댓글을 데이터베이스에 저장합니다.
export async function onRequestPost(context) {
  try {
    // 클라이언트로부터 전달받은 JSON 데이터 추출
    const { memberId, dday, text, date } = await context.request.json();

    if (!memberId || !dday || !text) {
      return new Response(JSON.stringify({ error: '데이터가 누락되었습니다. (memberId, dday, text 필수)' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // D1 데이터베이스에 새로운 댓글 정보 삽입
    const result = await context.env.DB.prepare(
      "INSERT INTO comments (member_id, dday, text, date) VALUES (?, ?, ?, ?)"
    )
    .bind(memberId, dday, text, date || new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true, id: result.lastRowId }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// [DELETE] 특정 댓글을 삭제합니다.
export async function onRequestDelete(context) {
  try {
    const { searchParams } = new URL(context.request.url);
    const id = searchParams.get('id'); // 필수: 삭제할 댓글 ID

    if (!id) {
      return new Response(JSON.stringify({ error: 'id 파라미터가 필요합니다.' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await context.env.DB.prepare(
      "DELETE FROM comments WHERE id = ?"
    )
    .bind(id)
    .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
