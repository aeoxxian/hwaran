import {
  Notice, Club, ClubMember, CalendarEvent, BoardPost,
  GalleryAlbum, Document, InventoryItem, Banner, ExternalChannel,
  Draft, ClubApplication, AppNotification,
} from "./types";

export const mockNotices: Notice[] = [
  {
    id: "1",
    title: "2026학년도 1학기 동아리 등록 공고",
    content: "2026학년도 1학기 동아리 등록을 아래와 같이 공고합니다.\n\n1. 등록 기간: 2026.03.02 ~ 2026.03.15\n2. 등록 방법: 동아리연합회 사무실 방문 또는 온라인 신청\n3. 필요 서류: 동아리 등록 신청서, 회원 명부, 활동 계획서\n\n자세한 사항은 동아리연합회 사무실로 문의 바랍니다.",
    author: "동아리연합회",
    createdAt: "2026-03-01",
    isPinned: true,
  },
  {
    id: "2",
    title: "제4대 동아리연합회 '화란' 출범",
    content: "안녕하세요, 한국에너지공과대학교 제4대 동아리연합회 '화란'입니다.\n\n화란은 '꽃이 피다'라는 뜻으로, 학우들의 동아리 활동이 아름답게 꽃피길 바라는 마음을 담았습니다.\n\n앞으로 동아리 활동 지원, 행사 주최, 복지 향상을 위해 최선을 다하겠습니다.",
    author: "동아리연합회",
    createdAt: "2026-02-28",
    isPinned: true,
  },
  {
    id: "3",
    title: "3월 동아리방 사용 시간표 안내",
    content: "3월 동아리방 사용 시간표를 안내드립니다. 첨부된 시간표를 확인하시고, 변경 사항이 있을 경우 동아리연합회로 연락 바랍니다.",
    author: "동아리연합회",
    createdAt: "2026-02-27",
    isPinned: false,
  },
  {
    id: "4",
    title: "동아리 활동 지원금 신청 안내",
    content: "2026학년도 1학기 동아리 활동 지원금 신청을 받습니다.\n\n신청 기간: 2026.03.10 ~ 2026.03.20\n대상: 등록 완료된 모든 중앙동아리\n신청 방법: 활동 계획서 및 예산안 제출",
    author: "동아리연합회",
    createdAt: "2026-03-05",
    isPinned: false,
  },
  {
    id: "5",
    title: "동아리 박람회 개최 안내",
    content: "2026학년도 신입생 환영 동아리 박람회를 개최합니다.\n\n일시: 2026.03.18 (수) 12:00-17:00\n장소: 학생회관 앞 광장\n\n모든 동아리의 적극적인 참여를 부탁드립니다.",
    author: "동아리연합회",
    createdAt: "2026-03-10",
    isPinned: false,
  },
];

export const mockClubs: Club[] = [
  {
    id: "1",
    name: "에너지탐험대",
    description: "에너지 기술과 정책을 연구하고 토론하는 학술 동아리입니다. 매주 세미나와 현장 탐방을 진행합니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/energy_explorers",
    category: "학술",
    memberCount: 25,
  },
  {
    id: "2",
    name: "하모니",
    description: "음악을 사랑하는 학우들이 모인 밴드 동아리입니다. 정기 공연과 버스킹을 진행합니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/harmony_band",
    category: "공연",
    memberCount: 18,
  },
  {
    id: "3",
    name: "그린캠퍼스",
    description: "캠퍼스 내 환경 보호와 지속가능한 생활을 실천하는 봉사 동아리입니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/green_campus",
    category: "봉사",
    memberCount: 30,
  },
  {
    id: "4",
    name: "KENTECH FC",
    description: "축구를 통해 체력을 기르고 친목을 다지는 체육 동아리입니다. 교내외 대회에 참가합니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/kentech_fc",
    category: "체육",
    memberCount: 22,
  },
  {
    id: "5",
    name: "셔터",
    description: "사진과 영상을 통해 캠퍼스의 순간을 기록하는 미디어 동아리입니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/shutter_kentech",
    category: "문화",
    memberCount: 15,
  },
  {
    id: "6",
    name: "코드브릭",
    description: "프로그래밍과 소프트웨어 개발을 함께 배우고 프로젝트를 진행하는 개발 동아리입니다.",
    logo: "/images/club-placeholder.png",
    bannerImage: "/images/banner-placeholder.png",
    instagramUrl: "https://instagram.com/codebrick_kentech",
    category: "학술",
    memberCount: 20,
  },
];

export const mockClubMembers: ClubMember[] = [
  { id: "1", name: "김태양", role: "회장", introduction: "에너지 기술의 미래를 함께 만들어갑니다.", clubId: "1" },
  { id: "2", name: "이수현", role: "부회장", introduction: "세미나 기획을 담당하고 있습니다.", clubId: "1" },
  { id: "3", name: "박지민", role: "회원", clubId: "1" },
  { id: "4", name: "정하늘", role: "회장", introduction: "음악으로 하나되는 캠퍼스를 꿈꿉니다.", clubId: "2" },
  { id: "5", name: "최서연", role: "부회장", introduction: "기타 담당입니다.", clubId: "2" },
  { id: "6", name: "강민수", role: "회장", introduction: "지구를 위한 작은 실천을 이어갑니다.", clubId: "3" },
  { id: "7", name: "한소율", role: "부회장", introduction: "캠페인 기획을 맡고 있습니다.", clubId: "3" },
  { id: "8", name: "오진우", role: "회장", introduction: "열정적으로 축구합니다!", clubId: "4" },
  { id: "9", name: "윤서아", role: "회장", introduction: "렌즈로 세상을 담습니다.", clubId: "5" },
  { id: "10", name: "임도현", role: "회장", introduction: "코드로 세상을 바꿉니다.", clubId: "6" },
];

export const mockEvents: CalendarEvent[] = [
  { id: "1", title: "동아리 박람회", startDate: "2026-03-18", endDate: "2026-03-18", location: "학생회관 앞 광장", description: "신입생 환영 동아리 박람회", color: "#E05252" },
  { id: "2", title: "에너지탐험대 세미나", startDate: "2026-03-20", endDate: "2026-03-20", clubId: "1", clubName: "에너지탐험대", location: "세미나실 A", description: "3월 정기 세미나", color: "#3B82F6" },
  { id: "3", title: "하모니 정기 공연", startDate: "2026-04-05", endDate: "2026-04-05", clubId: "2", clubName: "하모니", location: "소공연장", description: "봄맞이 정기 공연", color: "#8B5CF6" },
  { id: "4", title: "그린캠퍼스 환경 캠페인", startDate: "2026-04-10", endDate: "2026-04-12", clubId: "3", clubName: "그린캠퍼스", location: "캠퍼스 전역", description: "지구의 날 맞이 환경 캠페인", color: "#10B981" },
  { id: "5", title: "KENTECH FC 친선 경기", startDate: "2026-04-15", endDate: "2026-04-15", clubId: "4", clubName: "KENTECH FC", location: "운동장", description: "교내 친선 축구 대회", color: "#F59E0B" },
  { id: "6", title: "동아리연합회 정기 회의", startDate: "2026-03-25", endDate: "2026-03-25", location: "회의실", description: "3월 정기 회의", color: "#E05252" },
  { id: "7", title: "코드브릭 해커톤", startDate: "2026-04-20", endDate: "2026-04-21", clubId: "6", clubName: "코드브릭", location: "컴퓨터실", description: "24시간 해커톤", color: "#6366F1" },
];

export const mockBoardPosts: BoardPost[] = [
  { id: "1", title: "동아리방 예약은 어떻게 하나요?", content: "동아리방 예약 절차를 알고 싶습니다.", author: "김학생", createdAt: "2026-03-15", category: "qna", status: "답변완료", reply: "동아리연합회 사무실 방문 또는 홈페이지에서 신청 가능합니다.", replyDate: "2026-03-16" },
  { id: "2", title: "동아리 지원금 사용 범위 문의", content: "지원금으로 장비 구매가 가능한지 알고 싶습니다.", author: "이학생", createdAt: "2026-03-14", category: "qna", status: "대기" },
  { id: "3", title: "동아리방 난방 시설 개선 요청", content: "동아리방 난방이 잘 되지 않아 개선을 요청합니다.", author: "익명", createdAt: "2026-03-12", category: "complaints", status: "해결", isAnonymous: true },
  { id: "4", title: "학생회관 소음 문제", content: "학생회관 3층 복도 소음이 심합니다. 방음 시설 설치를 건의합니다.", author: "익명", createdAt: "2026-03-10", category: "complaints", status: "대기", isAnonymous: true },
  { id: "5", title: "검정색 에어팟 프로 분실", content: "3월 15일 학생회관 2층에서 검정색 에어팟 프로를 분실했습니다. 찾으신 분은 연락 부탁드립니다.", author: "박학생", createdAt: "2026-03-15", category: "lost-found", status: "미해결" },
  { id: "6", title: "파란색 텀블러 발견", content: "학생식당에서 파란색 텀블러를 발견했습니다. 동아리연합회 사무실에 보관 중입니다.", author: "동아리연합회", createdAt: "2026-03-14", category: "lost-found", status: "미해결" },
  { id: "7", title: "[에너지탐험대] 3월 신규 회원 모집!", content: "에너지탐험대에서 새로운 회원을 모집합니다!\n\n에너지 기술에 관심 있는 분이라면 누구나 환영합니다.\n모집 기간: 3/15 ~ 3/25\n문의: @energy_explorers", author: "에너지탐험대", createdAt: "2026-03-15", category: "promotions", clubId: "1", clubName: "에너지탐험대" },
  { id: "8", title: "[하모니] 봄 정기 공연 안내", content: "하모니의 봄 정기 공연에 초대합니다!\n\n일시: 4월 5일 저녁 7시\n장소: 소공연장\n\n많은 관심 부탁드립니다.", author: "하모니", createdAt: "2026-03-20", category: "promotions", clubId: "2", clubName: "하모니" },
];

export const mockGalleryAlbums: GalleryAlbum[] = [
  { id: "1", title: "2025 가을 동아리 축제", date: "2025-10-15", description: "2025년 가을 동아리 축제 현장 스케치", coverImage: "/images/gallery-placeholder.png", images: ["/images/gallery-placeholder.png"], },
  { id: "2", title: "2025 동아리 박람회", date: "2025-09-05", description: "신입생 환영 동아리 박람회", coverImage: "/images/gallery-placeholder.png", images: ["/images/gallery-placeholder.png"], },
  { id: "3", title: "하모니 겨울 공연", date: "2025-12-20", description: "하모니 연말 정기 공연", coverImage: "/images/gallery-placeholder.png", images: ["/images/gallery-placeholder.png"], clubId: "2", clubName: "하모니" },
];

export const mockDocuments: Document[] = [
  { id: "1", title: "동아리연합회 회칙 (2026년 개정)", category: "회칙", fileUrl: "#", createdAt: "2026-02-20" },
  { id: "2", title: "동아리 등록 신청서 양식", category: "양식", fileUrl: "#", createdAt: "2026-02-15" },
  { id: "3", title: "활동 지원금 신청서 양식", category: "양식", fileUrl: "#", createdAt: "2026-02-15" },
  { id: "4", title: "제4대 동아리연합회 1차 정기회의록", category: "회의록", fileUrl: "#", createdAt: "2026-03-05" },
  { id: "5", title: "제4대 동아리연합회 2차 정기회의록", category: "회의록", fileUrl: "#", createdAt: "2026-03-20" },
];

export const mockInventory: InventoryItem[] = [
  { id: "1", name: "블루투스 스피커", quantity: 3, status: "사용가능", location: "동아리연합회 사무실", note: "행사용" },
  { id: "2", name: "접이식 테이블", quantity: 10, status: "사용가능", location: "학생회관 창고" },
  { id: "3", name: "빔 프로젝터", quantity: 2, status: "대여중", location: "동아리연합회 사무실", note: "에너지탐험대 대여 (3/20 반납 예정)" },
  { id: "4", name: "확성기", quantity: 1, status: "수리중", location: "수리 업체", note: "4월 초 수리 완료 예정" },
  { id: "5", name: "텐트 (3x3m)", quantity: 5, status: "사용가능", location: "학생회관 창고" },
  { id: "6", name: "현수막 거치대", quantity: 4, status: "사용가능", location: "학생회관 창고" },
];

export const mockBanners: Banner[] = [
  { id: "1", clubId: "1", clubName: "에너지탐험대", imageUrl: "/images/banner-placeholder.png", linkUrl: "/clubs/1", isActive: true },
  { id: "2", clubId: "2", clubName: "하모니", imageUrl: "/images/banner-placeholder.png", linkUrl: "/clubs/2", isActive: true },
  { id: "3", clubId: "3", clubName: "그린캠퍼스", imageUrl: "/images/banner-placeholder.png", linkUrl: "/clubs/3", isActive: true },
  { id: "4", clubId: "6", clubName: "코드브릭", imageUrl: "/images/banner-placeholder.png", linkUrl: "/clubs/6", isActive: true },
];

export const mockExternalChannels: ExternalChannel[] = [
  { id: "1", name: "화란 공식 인스타그램", platform: "instagram", url: "https://instagram.com/hwaran_kentech", description: "동아리연합회 공식 인스타그램" },
  { id: "2", name: "KENTECH 공연 정보", platform: "instagram", url: "https://instagram.com/kentech_stage", description: "교내 공연 및 행사 소식" },
  { id: "3", name: "KENTECH 학생회", platform: "instagram", url: "https://instagram.com/kentech_student", description: "총학생회 공식 계정" },
];

export const clubCategories = ["전체", "학술", "공연", "봉사", "체육", "문화", "종교"];

// ─── 관리자 포털 목업 데이터 ────────────────────────────────────

export const mockDrafts: Draft[] = [
  {
    id: "d1",
    title: "2026년 1학기 동아리 운영 예산 기안",
    content: "동아리연합회 운영을 위한 2026년 1학기 예산안을 상신합니다.\n\n1. 사무용품비: 300,000원\n2. 행사 운영비: 500,000원\n3. 예비비: 200,000원",
    type: "예산",
    status: "1차검토중",
    authorId: "u1",
    authorName: "김국원",
    authorRole: "국원",
    currentReviewerRole: "국장팀장",
    attachments: [],
    comments: [
      {
        id: "c1",
        authorId: "u2",
        authorName: "이국장",
        authorRole: "국장팀장",
        content: "예산 항목을 구체적으로 작성해 주세요.",
        action: "검토의견",
        createdAt: "2026-03-10T10:00:00Z",
      },
    ],
    createdAt: "2026-03-09T09:00:00Z",
    updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "d2",
    title: "봄 축제 물품 사용 신청",
    content: "봄 축제 행사에 필요한 물품 사용을 신청합니다.\n- 스피커 2대\n- 마이크 3개\n- 행사 테이블 5개",
    type: "물품사용",
    status: "최종검토중",
    authorId: "u3",
    authorName: "박팀장",
    authorRole: "국장팀장",
    currentReviewerRole: "회장단",
    attachments: [],
    comments: [],
    createdAt: "2026-03-11T14:00:00Z",
    updatedAt: "2026-03-11T14:00:00Z",
  },
  {
    id: "d3",
    title: "신규 동아리 등록 신청 - 코딩클럽",
    content: "코딩클럽의 신규 동아리 등록을 신청합니다. 첨부 파일을 확인해주세요.",
    type: "동아리등록",
    status: "승인",
    authorId: "u1",
    authorName: "김국원",
    authorRole: "국원",
    attachments: [],
    comments: [
      {
        id: "c2",
        authorId: "u4",
        authorName: "최회장",
        authorRole: "회장단",
        content: "승인합니다.",
        action: "승인",
        createdAt: "2026-03-05T16:00:00Z",
      },
    ],
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-05T16:00:00Z",
  },
];

export const mockApplications: ClubApplication[] = [
  {
    id: "a1",
    title: "축구부 2026년 1학기 등록 신청",
    type: "동아리등록",
    clubName: "축구부",
    submitterName: "정동아리장",
    submittedAt: "2026-03-08",
    status: "대기",
    attachments: [],
  },
  {
    id: "a2",
    title: "밴드부 물품 사용 신청",
    type: "물품사용",
    clubName: "밴드부",
    submitterName: "홍길동",
    submittedAt: "2026-03-10",
    status: "1차검토중",
    attachments: [],
  },
  {
    id: "a3",
    title: "독서클럽 예산 집행 신청",
    type: "예산",
    clubName: "독서클럽",
    submitterName: "이회장",
    submittedAt: "2026-03-05",
    status: "승인",
    attachments: [],
    reviewComment: "승인합니다.",
    reviewedAt: "2026-03-07",
    reviewerName: "최회장",
  },
];

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    recipientId: "u2",
    title: "새 기안이 도착했습니다",
    message: "김국원님이 '2026년 1학기 동아리 운영 예산 기안'을 상신했습니다.",
    link: "/admin/drafts/d1",
    isRead: false,
    createdAt: "2026-03-09T09:05:00Z",
    kind: "기안",
  },
  {
    id: "n2",
    recipientId: "u1",
    title: "기안에 검토 의견이 등록됐습니다",
    message: "이국장님이 검토 의견을 남겼습니다.",
    link: "/admin/drafts/d1",
    isRead: true,
    createdAt: "2026-03-10T10:05:00Z",
    kind: "기안",
  },
];
