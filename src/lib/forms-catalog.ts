/**
 * 동아리 운영에 필요한 공식 서류 양식 카탈로그.
 *
 * 실제 파일은 `public/forms/<카테고리>/<파일>` 로 정적 호스팅 되며,
 * 페이지에서는 카테고리별로 그룹화하여 다운로드 링크로 노출한다.
 *
 * 원본 파일은 `document_forms/` 아래에 있으며 이 카탈로그는 그 매핑을 보존한다.
 */

export type FormCategory =
  | "일반 행정"
  | "결산"
  | "동아리 등록"
  | "본부원 모집"
  | "선거권"
  | "회장단 선거"
  | "예산안"
  | "불참사유서"
  | "징계"
  | "회의록"
  | "초과 등록";

export type FormFileType = "docx" | "xlsx" | "pdf";

export interface FormTemplate {
  /** URL/리스트용 슬러그 (sanitized 파일 경로 기반) */
  id: string;
  /** 화면에 노출할 한국어 라벨 */
  displayName: string;
  /** 부가 설명 (선택) */
  description?: string;
  /** 파일 확장자 */
  fileType: FormFileType;
  /** 분류 */
  category: FormCategory;
  /** 정적 다운로드 URL (public/ 기준) */
  downloadUrl: string;
}

/** 페이지에서 사용할 카테고리 표시 순서. */
export const FORM_CATEGORY_ORDER: FormCategory[] = [
  "동아리 등록",
  "예산안",
  "결산",
  "회의록",
  "일반 행정",
  "본부원 모집",
  "불참사유서",
  "징계",
  "초과 등록",
  "선거권",
  "회장단 선거",
];

/** 카테고리별 한 줄 설명 (페이지 헤더용). */
export const FORM_CATEGORY_DESCRIPTIONS: Record<FormCategory, string> = {
  "일반 행정": "회의 공고, 제안서, 경위서 등 일상적인 행정 처리 양식",
  결산: "학기말 결산 보고에 필요한 내역서, 영수증, 자산목록 양식",
  "동아리 등록": "신규/재등록 동아리가 매 학기 제출해야 하는 등록 서류",
  "본부원 모집": "동아리연합회 본부원 모집 및 결과 공고 양식",
  선거권: "총선거 선거권 사전 신청 양식",
  "회장단 선거": "동아리연합회 회장·부회장 후보자 등록 및 공약 양식",
  예산안: "분기별·동아리별 예산 계획서 양식",
  불참사유서: "동아리연합회의 불참 시 제출하는 사유서",
  징계: "동아리 징계의결 결과 통보 양식",
  회의록: "정기회의 등 회의록 작성 양식",
  "초과 등록": "동아리 가입 인원 초과 신청 양식",
};

export const FORMS_CATALOG: FormTemplate[] = [
  // ─── 일반 행정 ───────────────────────────────────────────────
  {
    id: "general-attendance-leave",
    displayName: "결석 사유서",
    description: "회의·행사 결석 시 제출 (소속·직위·이름 기재)",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/attendance_leave.docx",
  },
  {
    id: "general-goods-receipt",
    displayName: "물품 수령 확인서",
    description: "사업명·날짜별 물품 수령 확인용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/goods_receipt.docx",
  },
  {
    id: "general-prize-receipt",
    displayName: "상품 수령 확인서",
    description: "행사 시상품 수령 확인용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/prize_receipt.docx",
  },
  {
    id: "general-agenda",
    displayName: "안건 양식 (운영·총회·투표)",
    description: "운영·총회·투표 등 회의 안건 작성용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/agenda_meeting_general_vote.docx",
  },
  {
    id: "general-participants",
    displayName: "참여 명단",
    description: "행사·회의 참여자 명단 정리용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/participants_list.docx",
  },
  {
    id: "general-meeting-notice",
    displayName: "회의 실시 공고문",
    description: "회의 일정·장소 사전 공지용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/meeting_notice.docx",
  },
  {
    id: "general-cooperation-request",
    displayName: "업무 협조 요청서",
    description: "타 국·서로 업무 협조 요청 시 사용 (소속·제목·수신국서·날짜)",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/cooperation_request.docx",
  },
  {
    id: "general-proposal",
    displayName: "제안서",
    description: "사업·행사 제안 제출용 (제목·소속·이름·날짜)",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/proposal.docx",
  },
  {
    id: "general-meeting-document",
    displayName: "회의 자료",
    description: "회의 종류·소속·날짜별 자료 작성용",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/meeting_document.docx",
  },
  {
    id: "general-incident-report",
    displayName: "경위서",
    description: "사건·사고 경위 보고용 (소속·제목·이름)",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/incident_report.docx",
  },
  {
    id: "general-staff-application",
    displayName: "화란 국원 지원서",
    description: "화란 본부 국원 지원 시 제출",
    fileType: "docx",
    category: "일반 행정",
    downloadUrl: "/forms/general_admin/hwaran_staff_application.docx",
  },

  // ─── 결산 ────────────────────────────────────────────────────
  {
    id: "settlement-summary",
    displayName: "결산 내역서",
    description: "학기별 결산 내역 정리 (xlsx)",
    fileType: "xlsx",
    category: "결산",
    downloadUrl: "/forms/settlement/settlement_statement.xlsx",
  },
  {
    id: "settlement-receipts",
    displayName: "영수증 첨부지",
    description: "영수증 부착용 표지",
    fileType: "docx",
    category: "결산",
    downloadUrl: "/forms/settlement/receipts_attachment.docx",
  },
  {
    id: "settlement-assets-semester",
    displayName: "자산 목록 (학기)",
    description: "학기별 동아리 자산 목록",
    fileType: "xlsx",
    category: "결산",
    downloadUrl: "/forms/settlement/assets_semester.xlsx",
  },
  {
    id: "settlement-assets-annual",
    displayName: "자산 목록 (연간)",
    description: "연간 자산 목록 정리",
    fileType: "xlsx",
    category: "결산",
    downloadUrl: "/forms/settlement/assets_annual.xlsx",
  },
  {
    id: "settlement-activity-report",
    displayName: "활동 보고서 (결산용)",
    description: "결산과 함께 제출하는 학기 활동 보고서",
    fileType: "docx",
    category: "결산",
    downloadUrl: "/forms/settlement/activity_report_settlement.docx",
  },

  // ─── 동아리 등록 ─────────────────────────────────────────────
  {
    id: "registration-application",
    displayName: "동아리 등록 신청서",
    description: "신규/재등록 동아리 등록 신청용",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/club_registration_application.docx",
  },
  {
    id: "registration-budget-plan",
    displayName: "예산 계획서",
    description: "학기 예산 계획 (xlsx)",
    fileType: "xlsx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/budget_plan.xlsx",
  },
  {
    id: "registration-event-plan",
    displayName: "행사 기획서",
    description: "학기 중 진행할 행사 기획안",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/event_plan.docx",
  },
  {
    id: "registration-activity-plan",
    displayName: "활동 계획서",
    description: "학기 활동 계획 제출용",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/activity_plan.docx",
  },
  {
    id: "registration-activity-report",
    displayName: "활동 보고서",
    description: "이전 학기 활동 결과 보고",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/activity_report.docx",
  },
  {
    id: "registration-club-rules",
    displayName: "정규 동아리 회칙",
    description: "정규 동아리 회칙 양식",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/club_bylaws.docx",
  },
  {
    id: "registration-extra-membership",
    displayName: "동아리 초과 가입 신청서",
    description: "초과 가입 신청용 (이름·학번 기재)",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/extra_membership_application.docx",
  },
  {
    id: "registration-example-activity-report",
    displayName: "예시 — 주동 활동 보고서",
    description: "작성 예시 (2025-2학기 주동)",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/example_activity_report.docx",
  },
  {
    id: "registration-example-budget-plan",
    displayName: "예시 — 주동 예산 계획서",
    description: "작성 예시 (2026-1학기 주동)",
    fileType: "xlsx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/example_budget_plan.xlsx",
  },
  {
    id: "registration-example-activity-plan",
    displayName: "예시 — 주동 활동 계획서",
    description: "작성 예시 (2026-1학기 주동)",
    fileType: "docx",
    category: "동아리 등록",
    downloadUrl: "/forms/club_registration/example_activity_plan.docx",
  },

  // ─── 본부원 모집 ──────────────────────────────────────────────
  {
    id: "staff-application",
    displayName: "본부원 지원서",
    description: "동아리연합회 본부원 지원용 (2025-2학기 기준)",
    fileType: "docx",
    category: "본부원 모집",
    downloadUrl: "/forms/staff_recruitment/staff_application.docx",
  },
  {
    id: "staff-result-notice",
    displayName: "본부원 모집 결과 공고",
    description: "본부원 모집 결과 공고문 양식",
    fileType: "docx",
    category: "본부원 모집",
    downloadUrl: "/forms/staff_recruitment/staff_recruitment_result_notice.docx",
  },

  // ─── 선거권 ──────────────────────────────────────────────────
  {
    id: "vote-preregistration",
    displayName: "선거권 사전 신청서",
    description: "총선거 선거권 사전 신청용",
    fileType: "docx",
    category: "선거권",
    downloadUrl: "/forms/voting_eligibility/voting_pre_registration.docx",
  },

  // ─── 회장단 선거 ──────────────────────────────────────────────
  {
    id: "election-1-candidate-registration",
    displayName: "1. 후보자 등록 신청서",
    description: "회장단 선거 후보자 등록 1단계",
    fileType: "docx",
    category: "회장단 선거",
    downloadUrl: "/forms/presidential_election/1_candidate_registration.docx",
  },
  {
    id: "election-2-resume-president",
    displayName: "2. 후보자 이력서 (회장)",
    description: "회장 후보자 이력서",
    fileType: "docx",
    category: "회장단 선거",
    downloadUrl: "/forms/presidential_election/2_resume_president.docx",
  },
  {
    id: "election-2-resume-vice",
    displayName: "2. 후보자 이력서 (부회장)",
    description: "부회장 후보자 이력서",
    fileType: "docx",
    category: "회장단 선거",
    downloadUrl: "/forms/presidential_election/2_resume_vice_president.docx",
  },
  {
    id: "election-3-pledges",
    displayName: "3. 핵심 선거 공약",
    description: "핵심 공약 작성 양식",
    fileType: "docx",
    category: "회장단 선거",
    downloadUrl: "/forms/presidential_election/3_election_pledges.docx",
  },

  // ─── 예산안 ──────────────────────────────────────────────────
  {
    id: "budget-quarterly-unit",
    displayName: "분기 예산안 (단위체)",
    description: "단위체별 분기 예산안 (2025-1분기 기준)",
    fileType: "xlsx",
    category: "예산안",
    downloadUrl: "/forms/budget_proposal/quarterly_budget_unit.xlsx",
  },
  {
    id: "budget-club-plan",
    displayName: "동아리 예산 계획서",
    description: "동아리별 예산 계획서 양식",
    fileType: "xlsx",
    category: "예산안",
    downloadUrl: "/forms/budget_proposal/club_budget_plan.xlsx",
  },

  // ─── 불참사유서 ──────────────────────────────────────────────
  {
    id: "absence-form",
    displayName: "불참 사유서",
    description: "동아리연합회의 불참 시 제출",
    fileType: "docx",
    category: "불참사유서",
    downloadUrl: "/forms/absence_excuse/absence_excuse_form.docx",
  },
  {
    id: "absence-example",
    displayName: "불참 사유서 예시",
    description: "작성 예시 (PDF)",
    fileType: "pdf",
    category: "불참사유서",
    downloadUrl: "/forms/absence_excuse/absence_excuse_example.pdf",
  },

  // ─── 징계 ────────────────────────────────────────────────────
  {
    id: "discipline-notice",
    displayName: "동아리 징계의결 통보서",
    description: "징계의결 결과 통보 양식",
    fileType: "docx",
    category: "징계",
    downloadUrl: "/forms/disciplinary/disciplinary_decision_notice.docx",
  },

  // ─── 회의록 ──────────────────────────────────────────────────
  {
    id: "minutes-regular",
    displayName: "정기 회의록",
    description: "정기 회의록 작성 양식",
    fileType: "docx",
    category: "회의록",
    downloadUrl: "/forms/meeting_minutes/regular_meeting_minutes.docx",
  },

  // ─── 초과 등록 ───────────────────────────────────────────────
  {
    id: "extra-registration",
    displayName: "동아리 초과 가입 신청서",
    description: "정원 초과 가입 신청용",
    fileType: "docx",
    category: "초과 등록",
    downloadUrl: "/forms/excess_registration/excess_membership_application.docx",
  },
];

/** 카테고리별로 그룹화된 양식 목록을 반환. */
export function groupFormsByCategory(): Array<{
  category: FormCategory;
  description: string;
  forms: FormTemplate[];
}> {
  return FORM_CATEGORY_ORDER.map((category) => ({
    category,
    description: FORM_CATEGORY_DESCRIPTIONS[category],
    forms: FORMS_CATALOG.filter((f) => f.category === category),
  })).filter((group) => group.forms.length > 0);
}
