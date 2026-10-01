// 나침반 사고 활동지 → 구글 시트 저장용 Apps Script
// 시트 메뉴 [확장 프로그램 > Apps Script]에 붙여 넣고 웹 앱으로 배포하세요.

const SHEET_NAME = '나침반';
const HEADERS = ['제출 시각', '모둠', '번호', '이름', '기사 제목', '신문사', '한 줄 요약',
                 '동(좋은 점)', '서(우려되는 점)', '북(필요한 것)', '남(제안)'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 여러 학생이 동시에 제출해도 줄이 섞이지 않게
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(HEADERS);
      sh.setFrozenRows(1);
    }
    const keys = ['team', 'num', 'nick', 'atitle', 'apress', 'asum', 'e', 'w', 'n', 's'];
    sh.appendRow([new Date()].concat(keys.map(k => clean(d[k]))));
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// 학생 입력이 수식으로 실행되지 않도록 막고 길이를 제한
function clean(v) {
  let s = String(v == null ? '' : v).slice(0, 2000);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
