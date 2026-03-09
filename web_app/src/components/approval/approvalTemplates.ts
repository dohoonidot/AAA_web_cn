// 전자결재 양식별 HTML 템플릿
// Tiptap이 올바르게 파싱하도록 <td>/<th> 내부에 <p> 태그 포함

const thStyle = 'border:1px solid #C0C7D0;padding:8px 12px;background:#E3E8FF;font-weight:600;text-align:center;';
const tdStyle = 'border:1px solid #C0C7D0;padding:8px 12px;';
const tdCenterStyle = 'border:1px solid #C0C7D0;padding:8px 12px;text-align:center;';
const totalRowStyle = 'border:1px solid #C0C7D0;padding:8px 12px;background:#FFF9C4;font-weight:700;text-align:center;';
const tableStyle = 'width:100%;border-collapse:collapse;';

// 빈 셀 (편집 가능한 여백)
const empty = '<p> </p>';

export const approvalTemplates: Record<string, string> = {
  '매출/매입계약 기안서': `
<h2 style="text-align:center;">매출/매입계약 기안서</h2>

<p><strong>매출/매입계약내역 PA 요약</strong> &nbsp;&nbsp; <span style="font-size:11px;color:#555;">(부가세별도)</span></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>항목</p></th>
      <th style="${thStyle}"><p>금액</p></th>
      <th style="${thStyle}"><p>거래처</p></th>
      <th style="${thStyle}"><p>세금계산서 발행예정일</p></th>
      <th style="${thStyle}"><p>결제조건</p></th>
      <th style="${thStyle}"><p>특이사항</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>1) H/W 매출</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>2) S/W 매출</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>3) 컨설팅 또는 개발매출</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>4) 기타(&nbsp;&nbsp;&nbsp;&nbsp;) 매출</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}"><p>매출액</p></td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}" colspan="6"><p>3rd Party 컨설팅 또는 개발용역비 원가</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>1)</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>2)</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>3)</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}"><p>매입액</p></td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${totalRowStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}"><p>원가총액</p></td>
      <td style="${totalRowStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}"><p>매출총이익</p></td>
      <td style="${totalRowStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}"><p>이익율</p></td>
      <td style="${totalRowStyle}" colspan="5">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>매출 계약 내역서</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <td style="${thStyle}"><p>계약명</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약일자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약업체</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약담당자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>당사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약기간</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약금액</p></td>
      <td style="${tdStyle}" colspan="5"><p>${empty} &nbsp;<span style="color:#555;font-size:11px;">(부가세별도)</span></p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>청구시점</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>결제조건</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>첨부</p></td>
      <td style="${tdStyle}" colspan="5"><p>1. 계약서</p><p>2. PL Sheet [반드시 첨부해 주세요]</p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>특이사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>직전 계약 대비 변경사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
  </tbody>
</table>
<p style="font-size:0.85em;color:#555;">* 특이사항란에는 계약 진행시 유의할점 및 위약사항에 따른 불이익등을 기입해 주시기 바랍니다.</p>
<p style="font-size:0.85em;color:#555;">* 직전 계약 대비 변경사항란에는 직전 계약내용과 차이가 있어 확인이 필요한 내용을 기입해 주시기 바랍니다.</p>
<p style="font-size:0.85em;color:#555;">* 계약내용란에는 유지보수내역을 상세히 기입해 주시기 바랍니다. 예) 인력투입 시 투입인원, 업무내용 등</p>
<p style="font-size:0.85em;color:#555;">* 계약No.란은 관리팀에서 작성할 부분이니 기입하지 마시기 바랍니다.</p>
<p style="font-size:0.85em;color:#555;">* 매출&amp;매입계약 PA 요약 및 계약서(원본 or 사본) 첨부.</p>

<p><br/></p>
<p><strong>매입 계약 내역서_1</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <td style="${thStyle}"><p>계약명</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약일자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약업체</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약담당자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>당사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약기간</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약금액</p></td>
      <td style="${tdStyle}" colspan="5"><p>${empty} &nbsp;<span style="color:#555;font-size:11px;">(부가세별도)</span></p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>청구시점</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>결제조건</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>첨부</p></td>
      <td style="${tdStyle}" colspan="5"><p>1. 계약서</p><p>2. PL Sheet [반드시 첨부해 주세요]</p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>특이사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>직전 계약 대비 변경사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>매입 계약 내역서_2</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <td style="${thStyle}"><p>계약명</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약일자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약업체</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
      <td style="${thStyle}"><p>계약담당자</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>당사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약사</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약기간</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>계약금액</p></td>
      <td style="${tdStyle}" colspan="5"><p>${empty} &nbsp;<span style="color:#555;font-size:11px;">(부가세별도)</span></p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>청구시점</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>결제조건</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>첨부</p></td>
      <td style="${tdStyle}" colspan="5"><p>1. 계약서</p><p>2. PL Sheet [반드시 첨부해 주세요]</p></td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>특이사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>직전 계약 대비 변경사항</p></td>
      <td style="${tdStyle}" colspan="5">${empty}</td>
    </tr>
  </tbody>
</table>
`,

  'Novation order_(고객사명)': `
<h2 style="text-align:center;">Novation order_(고객사명)</h2>

<p>오더 진행 프로세스 및 필요한 서류를 안내해드립니다.</p>
<p>아래 내용이 준비되셔야 Q2C 로 오더 진행이 가능합니다.</p>

<p><br/></p>
<p><strong>■ 오더진행에 필요한 서류 ■</strong></p>

<p><strong>1. SAP Software License Schedule (SLS)</strong></p>
<p style="margin-left:20px;">A. 예전에 EULA 라 불렸던 서류입니다.</p>
<p style="margin-left:20px;">B. End-user 의 법인명판, 도장, 일자가 필요하며, 추가로 진행되는 계약에도 필요합니다. (즉, 항상 입니다...)</p>
<p style="margin-left:20px;">C. 만약 SLS 에 명판 및 도장대신 고객사 담당자 서명으로 받아야하는 경우, 사전에 반드시 저희와 상의해 주십시요. 확인하여 드리겠습니다.</p>

<p><strong>2. Proof of End User Certificate (POEU)</strong></p>
<p style="margin-left:20px;">A. 샘플 위치 : 그룹웨어 / 문서관리 / 회사서식 / SAP Order 진행 필요서류_sample</p>
<p style="margin-left:20px;">B. 계약 진행 시, 항상 End-User 로부터 받아야 합니다.</p>
<p style="margin-left:20px;">C. End-User 의 명판, 도장, 일자 필요합니다.</p>
<p style="margin-left:20px;">D. POEU 에는 정확한 제품명 및 수량이 명기 되어야하며, runtime DB 가 포함되는 경우에는 DB 도 같이 명기해주셔야 합니다.</p>

<p><strong>3. 견적서</strong></p>

<p><strong>4. 업무-form</strong></p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p> </p></th>
      <th style="${thStyle}"><p>구분</p></th>
      <th style="${thStyle}"><p>내용</p></th>
      <th style="${thStyle}"><p>기타</p></th>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="2"><p>매출액</p></td>
      <td style="${tdStyle}"><p>License</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>MA</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="2"><p>매입액</p></td>
      <td style="${tdStyle}"><p>License</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>MA</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="2"><p>Company address</p></td>
      <td style="${tdStyle}"><p>Name</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>영문회사주소</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>address</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>영문회사주소</p></td>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="3"><p>CD recipient</p></td>
      <td style="${tdStyle}"><p>Name</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>영문담당자성명</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>Phone no</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>E-mail address</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>영문담당자이메일주소</p></td>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="3"><p>Contract Type</p></td>
      <td style="${tdStyle}"><p>Type of purchase</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>신규 or 추가 인지</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>Type of system</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>Production or Development</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>Maintenance</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p>Enterprise or Standard</p></td>
    </tr>
    <tr>
      <td style="${thStyle}" rowspan="3"><p>Infrastructure for installation</p></td>
      <td style="${tdStyle}"><p>Hardware</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>Operation system</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>Database</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${thStyle}"><p>직전 Channel Partner</p></td>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
  </tbody>
</table>
`,

  'Online Order': `
<h2 style="text-align:center;">Online Order</h2>

<p>오더 진행 프로세스 및 필요한 서류를 안내해드립니다.</p>
<p>아래 내용이 준비되셔야 Q2C 로 오더 진행이 가능합니다.</p>

<p><br/></p>
<p><strong>■ 오더진행에 필요한 서류</strong></p>

<p><strong>1. END USER LICENSE AGREEMENT ACCEPTANCE FORM (EULA)</strong></p>
<p style="margin-left:20px;">A. 예전에 SLS 라 불렸던 서류입니다. (SAP Software License Schedule)</p>
<p style="margin-left:20px;">B. End-user 의 법인명판, 도장, 일자가 필요하며, 추가로 진행되는 계약에도 필요합니다.</p>
<p style="margin-left:20px;">C. 만약 SLS 에 명판 및 도장대신 고객사 담당자 서명으로 받아야하는 경우, 사전에 반드시 저희와 상의해 주십시요. 확인하여 드리겠습니다.</p>

<p><strong>2. Proof of End User Certificate (POEU)</strong></p>
<p style="margin-left:20px;">A. 샘플 위치 : 그룹웨어 / 게시판 / 회사서식 / SAP Order 진행 필요서류_sample</p>
<p style="margin-left:20px;">B. 계약 진행 시, 항상 End-User 로부터 받아야 합니다.</p>
<p style="margin-left:20px;">C. End-User 의 명판, 도장, 일자 필요합니다.</p>
<p style="margin-left:20px;">D. POEU 에는 정확한 제품명 및 수량이 명기 되어야하며, runtime DB 가 포함되는 경우에는 DB 도 같이 명기해주셔야 합니다.</p>

<p><strong>3. SAP로 부터 받은 매입 견적서 와 PL Sheet 를 필히 첨부해 주시기 바랍니다.</strong></p>

<p><strong>4. 업무-form</strong> (내용의 빈칸을 꼭 채워주세요.)</p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>No.</p></th>
      <th style="${thStyle}"><p>구분</p></th>
      <th style="${thStyle}"><p>내용</p></th>
      <th style="${thStyle}"><p>기타</p></th>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>1</p></td>
      <td style="${tdStyle}"><p>처리기한</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>2</p></td>
      <td style="${tdStyle}"><p>고객사명</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>3</p></td>
      <td style="${tdStyle}"><p>프로젝트명</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>4</p></td>
      <td style="${tdStyle}"><p>SAP 영업대표 정보</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}" rowspan="4"><p>5</p></td>
      <td style="${tdStyle}" rowspan="2"><p>매출</p></td>
      <td style="${tdStyle}"><p>License</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>MA</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}" rowspan="2"><p>매입</p></td>
      <td style="${tdStyle}"><p>License</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>MA</p></td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>6</p></td>
      <td style="${tdStyle}"><p>첨부문서</p></td>
      <td style="${tdStyle}"><p>1. Quotation</p><p>2. END USER LICENSE AGREEMENT ACCEPTANCE FORM (EULA)</p></td>
      <td style="${tdStyle}"><p>반드시 첨부해 주세요</p></td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>7</p></td>
      <td style="${tdStyle}"><p>Hardware</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>8</p></td>
      <td style="${tdStyle}"><p>Operation system</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>9</p></td>
      <td style="${tdStyle}"><p>Database</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>
`,

  '구매신청서': `
<h2 style="text-align:center;">구매신청서</h2>
<p>상기 제목과 같이 구매 신청 드리오니 검토 후 재가바랍니다.</p>
<p style="text-align:center;"><strong>- 아 래 -</strong></p>

<p><strong>1. 목적 (사유)</strong></p>
<p> </p><p> </p><p> </p>

<p><strong>2. 내용 및 비용</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>구입 항목</p></th>
      <th style="${thStyle}"><p>단가*</p></th>
      <th style="${thStyle}"><p>수량</p></th>
      <th style="${thStyle}"><p>금액*</p></th>
      <th style="${thStyle}"><p>비고</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>
<p style="font-size:0.85em;color:#555;">* VAT 포함 여부 必</p>

<p><strong>3. 총 비용</strong></p>
<p> </p><p> </p>

<p><strong>4. 견적서</strong></p>
<p> </p><p> </p>

<p><strong>5. 비고</strong></p>
<p>항목별 구매처 URL, 정보, 업체, 구매방법 등 정보 기입</p>
<p> </p><p> </p>

<p style="text-align:center;"><strong>- 이 상 -</strong></p>
<p style="text-align:center;">끝.</p>
`,

  '경비 추가 예산 신청서': `
<h2 style="text-align:center;">경비 추가 예산 신청서</h2>
<p>상기 제목과 같이 경비 추가 사용 신청 드리오니 검토 후 재가바랍니다.</p>
<p style="text-align:center;"><strong>- 아 래 -</strong></p>

<p><strong>1. 목적 (사유)</strong></p>
<p> </p><p> </p><p> </p>

<p><strong>2. 내용 및 비용</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>일&nbsp;&nbsp;자</p></th>
      <th style="${thStyle}"><p>프 로 젝 트</p></th>
      <th style="${thStyle}"><p>내&nbsp;&nbsp;용 (적요)</p></th>
      <th style="${thStyle}"><p>금&nbsp;&nbsp;액</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${totalRowStyle}" colspan="3"><p>총 금액</p></td>
      <td style="${totalRowStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>3. 공용법인카드 반출 여부 :</strong> (필요 / 불필요)</p>
<p>&nbsp;&nbsp;&nbsp;반출기간 :</p>
<p> </p>
<p style="font-size:0.85em;color:#555;">*VAT 포함 여부 必</p>

<p style="text-align:center;"><strong>- 이 상 -</strong></p>
<p style="text-align:center;">끝.</p>
`,

  '병가신청서': `
<h2 style="text-align:center;">병 가 신 청 서</h2>

<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>부서</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>이름</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기간</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>사유</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>참고</p></th>
      <td style="${tdStyle}" colspan="3"><p>스캔 파일 첨부하여 증빙 제출 / 원본은 추후 경영관리팀 제출</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p>위의 사유로 병가 신청서를 제출합니다.</p>
<p>20&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일</p>
`,

  '복직신청서': `
<h2 style="text-align:center;">복 직 신 청 서</h2>

<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>부서</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>이름</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>휴직기간</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>복직희망일</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>사유</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>비고</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p>위의 사유로 복직신청서를 제출합니다.</p>
<p>20&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일</p>
`,

  '선계약/선지급 승인 요청서': `
<h2 style="text-align:center;">선계약/선지급 승인 요청서</h2>
<p>상기 제목과 같이 선계약/선지급 승인 요청 드리오니 검토 후 재가바랍니다.</p>

<p><br/></p>
<p><strong>*요청유형 :</strong> &nbsp;□ 선계약 &nbsp;&nbsp; □ 선지급</p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>1. 관련 매출 계약명 [프로젝트코드]</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>2. 매출 계약 체결 예정일</p></th>
      <td style="${tdStyle}"><p>${empty} &nbsp;<span style="font-size:0.85em;color:#555;">(매입계약 선행 시 작성)</span></p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>3. 요청사유</p></th>
      <td style="${tdStyle}"><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>4. 매입 선계약/선지급 예정일</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p style="font-size:0.85em;color:#555;">* 첨부서류 : 매입 선계약 요청시 해당 계약서 첨부 부탁드립니다.</p>
`,

  '주말 당직 결과보고서': `
<h2 style="text-align:center;">주말 당직 결과보고서</h2>

<p style="font-size:0.85em;color:#555;">- 결재선 지정 : AMS본부장 결재 득</p>
<p style="font-size:0.85em;color:#555;">- 참조자 지정 : AMS 內 모든 팀장 및 CSM(고기철상무, 안경상부장)</p>

<p><br/></p>
<p><strong>1. 고객 전화 응대</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>고객사</p></th>
      <th style="${thStyle}"><p>문의자</p></th>
      <th style="${thStyle}"><p>문의시간</p></th>
      <th style="${thStyle}"><p>문의사항</p></th>
      <th style="${thStyle}"><p>처리내용</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}"><p>예) 파리크라상</p></td>
      <td style="${tdStyle}"><p>홍길동</p></td>
      <td style="${tdStyle}"><p>09:35</p></td>
      <td style="${tdStyle}"><p>시스템에 대한 권한 부여 요청</p></td>
      <td style="${tdStyle}"><p>시스템 담당자에게 요청하여 권한등록 처리함</p></td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>2. 전산실 온도 체크</strong> <span style="font-size:0.85em;color:#555;">(각 시간대의 전산실 온도를 기입해주세요)</span></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}" rowspan="2"><p>구분</p></th>
      <th style="${thStyle}" colspan="2"><p>온도 (적정온도 16~28 도)</p></th>
      <th style="${thStyle}" rowspan="2"><p>비고</p></th>
    </tr>
    <tr>
      <th style="${thStyle}"><p>오전 10시</p></th>
      <th style="${thStyle}"><p>오후 1시</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>3. 인수인계</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>다음주 당직자에게 인수인계(문자전송)를 완료하였습니까?</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>
<p style="font-size:0.85em;color:#555;">※ 당직자 인수인계(문자전송)를 철저히 하여 주시기 바랍니다.</p>
`,

  '직원 채용 공고 등록 신청': `
<h2 style="text-align:center;">직원 채용 공고 등록 신청</h2>
<p>직원 채용 공고를 아래와 같이 신청하고자 합니다.</p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>No.</p></th>
      <th style="${thStyle}"><p>구분</p></th>
      <th style="${thStyle}"><p>내용</p></th>
      <th style="${thStyle}"><p>비고</p></th>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>1</p></td>
      <td style="${tdStyle}"><p>채용제목</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>2</p></td>
      <td style="${tdStyle}"><p>모집분야</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>3</p></td>
      <td style="${tdStyle}"><p>담당업무</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>4</p></td>
      <td style="${tdStyle}"><p>고용형태</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p style="font-size:0.85em;">정규직, 계약직, 인턴, 파견직, 도급, 프리랜서, 아르바이트, 연수생/교육생, 위촉직/개인사업자</p></td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>5</p></td>
      <td style="${tdStyle}"><p>모집인원</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>6</p></td>
      <td style="${tdStyle}"><p>급여조건</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p style="font-size:0.85em;">회사내규에 따름, 면접후 결정</p></td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>7</p></td>
      <td style="${tdStyle}"><p>직급/직책</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>8</p></td>
      <td style="${tdStyle}"><p>경력사항</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p style="font-size:0.85em;">신입, 경력, 신입+경력, 경력무관</p></td>
    </tr>
    <tr>
      <td style="${tdCenterStyle}"><p>9</p></td>
      <td style="${tdStyle}"><p>최종학력</p></td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}"><p style="font-size:0.85em;">대학졸업(2,3년), 대학졸업(4년), 대학원 석사졸업, 대학원 박사졸업, 학력무관</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>&lt;채용 담당자 정보&gt;</strong></p>
<p>담당자명 :</p>
<p>부서명 :</p>
<p>연락처 :</p>
<p>e-메일 :</p>

<p><br/></p>
<p>결재 승인이 완료되면 취업사이트 공고를 진행하도록 하겠습니다.</p>
`,

  '출장 신청서': `
<p>□ 국내출장신청서</p>
<p>□ 해외출장신청서</p>

<table style="${tableStyle}">
  <colgroup>
    <col style="width:20%;"/>
    <col style="width:25%;"/>
    <col style="width:25%;"/>
    <col style="width:30%;"/>
  </colgroup>
  <tbody>
    <tr>
      <th style="${thStyle}"><p>출 장 일 자</p></th>
      <td style="${tdStyle}" colspan="3"><p>&nbsp;&nbsp;&nbsp;&nbsp;년&nbsp;&nbsp;월&nbsp;&nbsp;일&nbsp;&nbsp;~&nbsp;&nbsp;&nbsp;&nbsp;년&nbsp;&nbsp;월&nbsp;&nbsp;일</p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>출 장 지</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>동 행 인</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>출 장 목 적</p></th>
      <td style="${tdStyle}" colspan="3"><p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p></td>
    </tr>
    <tr>
      <th style="${thStyle}" rowspan="6"><p>출 장 일 정</p></th>
      <th style="${thStyle}"><p>성 명</p></th>
      <th style="${thStyle}"><p>일 정</p></th>
      <th style="${thStyle}"><p>내 용</p></th>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기 대 효 과</p></th>
      <td style="${tdStyle}" colspan="3"><p>&nbsp;</p><p>&nbsp;</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>(출장비 계산)</strong></p>
<table style="${tableStyle}">
  <colgroup>
    <col style="width:15%;"/>
    <col style="width:20%;"/>
    <col style="width:15%;"/>
    <col style="width:10%;"/>
    <col style="width:20%;"/>
    <col style="width:20%;"/>
  </colgroup>
  <tbody>
    <tr>
      <th style="${thStyle}"><p>내 역</p></th>
      <th style="${thStyle}"><p>단 가</p></th>
      <th style="${thStyle}"><p>횟수(DAY)</p></th>
      <th style="${thStyle}"><p>인 원</p></th>
      <th style="${thStyle}"><p>금 액</p></th>
      <th style="${thStyle}"><p>비 고</p></th>
    </tr>
    <tr>
      <th style="${thStyle}"><p>숙 박 비</p></th>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdStyle}" rowspan="5">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교 통 비</p></th>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>식 비</p></th>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>일 비</p></th>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기 타</p></th>
      <td style="${tdStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdCenterStyle}">${empty}</td>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${totalRowStyle}" colspan="4"><p>합 계</p></th>
      <td style="${totalRowStyle}">${empty}</td>
      <td style="${tdStyle} border-left:none;">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>경 영 관 리 팀</p></th>
      <th style="${thStyle}"><p>접 수 일 자</p></th>
      <td style="${tdCenterStyle}" colspan="2"><p>20&nbsp;&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일</p></td>
      <th style="${thStyle}"><p>담당자확인</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>
`,

  '프로젝트 결과 보고': `
<h2 style="text-align:center;">프로젝트 결과 보고</h2>
<p style="font-size:0.85em;color:#555;">결재선: 소속 본부장 &gt; 대표이사</p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>구분</p></th>
      <th style="${thStyle}"><p>내용</p></th>
    </tr>
    <tr>
      <th style="${thStyle}"><p>고객사</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>프로젝트명</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>프로젝트 완료일</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>프로젝트 결과 요약 보고</p></th>
      <td style="${tdStyle}"><p> </p><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>최종 산출물 파일</p></th>
      <td style="${tdStyle}"><p>YES(O)&nbsp;&nbsp; NO( )</p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>구글 드라이브 등록 여부 및 링크 표기</p></th>
      <td style="${tdStyle}"><p>URL :</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>[주의사항]</strong></p>
<p>1) 프로젝트 제안완료 보고를 상신하기 전에, 반드시 프로젝트 최종 제안서 파일을 회사 구글 드라이브 &gt; ASPN &gt; ASPN 중요문서 &gt; 최종 제안서 폴더에 등록해야 합니다. (파일 등록 전에 ITS 팀 이충훈 과장에게 폴더 접근 권한 요청을 해야 함)</p>
<p>2) 그룹웨어 문서관리에 있는 정보자산 관리지침을 참고하여 반드시 프로젝트 최종 제안서 파일에 정보자산 등급표기를 해야합니다.</p>
`,

  '프로젝트 제안완료 보고': `
<h2 style="text-align:center;">프로젝트 제안완료 보고</h2>
<p style="font-size:0.85em;color:#555;">결재선: 소속 본부장 &gt; 대표이사</p>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>구분</p></th>
      <th style="${thStyle}"><p>내용</p></th>
    </tr>
    <tr>
      <th style="${thStyle}"><p>고객사</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>프로젝트명</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>최종 제안서 제출일</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>제안 관련 보고 내용</p></th>
      <td style="${tdStyle}"><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>최종 제안서 파일</p></th>
      <td style="${tdStyle}"><p>YES(O)&nbsp;&nbsp; NO( )</p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>구글 드라이브 등록 여부 및 링크 표기</p></th>
      <td style="${tdStyle}"><p>URL :</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>[주의사항]</strong></p>
<p>1) 프로젝트 제안완료 보고를 상신하기 전에, 반드시 프로젝트 최종 제안서 파일을 회사 구글 드라이브 &gt; ASPN &gt; ASPN 중요문서 &gt; 최종 제안서 폴더에 등록해야 합니다. (파일 등록 전에 ITS 팀 이충훈 과장에게 폴더 접근 권한 요청을 해야 함)</p>
<p>2) 그룹웨어 문서관리에 있는 정보자산 관리지침을 참고하여 반드시 프로젝트 최종 제안서 파일에 정보자산 등급표기를 해야합니다.</p>
`,

  '프로젝트 출장비 신청서': `
<h2 style="text-align:center;">프로젝트 출장비 신청서</h2>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>계 약 명</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>계약 기간</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>P M</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>투입 인원</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>출 장 비</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기타 사항</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p style="font-size:0.85em;color:#555;">* 제목은 계약명 출장비 신청서로 작성한다.</p>
<p style="font-size:0.85em;color:#555;">* 프로젝트 시작전 PM 은 출장비 신청서를 작성하여 본부장의 승인을 득한다.</p>
<p style="font-size:0.85em;color:#555;">* 승인된 내역을 기준으로 투입인원은 경비를 신청한다.</p>
`,

  '휴직신청서': `
<h2 style="text-align:center;">휴 직 신 청 서</h2>

<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>부서</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>이름</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기간</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>사유</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p><p> </p></td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>참고</p></th>
      <td style="${tdStyle}" colspan="3"><p>증빙 제출 필요시 원본으로 경영관리팀에 제출</p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p>위의 사유로 휴직원을 제출합니다.</p>
<p>20&nbsp;&nbsp;년&nbsp;&nbsp;&nbsp;월&nbsp;&nbsp;&nbsp;일</p>
`,

  '기본양식': `
<h2 style="text-align:center;">(제목을 입력하세요)</h2>
<p> </p>
<p> </p>
<p> </p>
`,

  '교육신청서': `
<h2 style="text-align:center;">교육신청서</h2>
<p>다음과 같이 사외 교육을 신청합니다.</p>

<p><br/></p>
<p><strong>◆ 교육 신청자</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>소속</p></th>
      <td style="${tdStyle}">${empty}</td>
      <th style="${thStyle}"><p>성명</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>◆ 교육내용</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>교육명</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교육기간</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교육기관</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교육장소</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교육비용</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>고용보험 / MDF 적용</p></th>
      <td style="${tdStyle}"><p>여 &nbsp;/&nbsp; 부</p></td>
      <th style="${thStyle}"><p>적용률 및 환급액</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>교육내용</p></th>
      <td style="${tdStyle}" colspan="3"><p> </p><p> </p><p> </p></td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>교육명</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>
<p>상기 교육비를 지원 받은 후 퇴사시 아래 내용을 준수 할 것을 협약합니다.</p>
<p>1. 100만원 미만은 1년 이내 퇴사시 전액 반환</p>
<p>2. 100만원 이상은 2년 이내 퇴사시 전액 반환</p>

<p><br/></p>
<p><strong>◆ 교육 목적 및 기대효과</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>교육목적</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>기대효과</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p>20&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;.&nbsp;&nbsp;&nbsp;&nbsp;신청자 : &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(인)</p>

<p><br/></p>
<p>※ 별 첨 : 해당교육 참고자료</p>

<p><br/></p>
<p><strong>관련 지침 사항</strong></p>
<p>교육 수강 전 - 수강증 사본과 세금계산서를 반드시 경영관리팀에 제출함.</p>
<p>교육 수강 완료 후 - 수료증 및 교육 이수 증서 사본 제출함.</p>
<p>&nbsp;- 팀장 또는 대표이사의 지시가 있을 시 관련직원을 대상으로 교육을 실시해야 함. (사내교육강의료 관련 없음.)</p>
<p>SAP 인증시험 - 합격 증서 사본 제출함. 본인의 업무 관련 Module 지원.</p>
`,

  '경조사비 지급신청서': `
<h2 style="text-align:center;">경조사비 지급신청서</h2>

<p><strong>1. 신청인</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>소속</p></th>
      <td style="${tdStyle}">${empty}</td>
      <th style="${thStyle}"><p>성명</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p><strong>2. 경조사항</strong></p>
<table style="${tableStyle}">
  <tbody>
    <tr>
      <th style="${thStyle}"><p>경조내용</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>경조일자</p></th>
      <td style="${tdStyle}">${empty}</td>
      <th style="${thStyle}"><p>신청인과의 관계</p></th>
      <td style="${tdStyle}">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>신청금액</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
    <tr>
      <th style="${thStyle}"><p>첨부자료</p></th>
      <td style="${tdStyle}" colspan="3">${empty}</td>
    </tr>
  </tbody>
</table>

<p><br/></p>
<p>위와 같이 경조금 지급을 신청합니다.</p>
`,
};

export const getApprovalTemplate = (approvalType: string): string => {
  return approvalTemplates[approvalType] || approvalTemplates['기본양식'];
};
