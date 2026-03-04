import streamlit as st
import pandas as pd
from datetime import datetime
from PIL import Image
import os
from streamlit_option_menu import option_menu

# --- Page Configuration ---
st.set_page_config(
    page_title="KENTECH 동아리 연합회 관리 시스템",
    page_icon="🎓",
    layout="wide",
    initial_sidebar_state="collapsed",
)

import base64

# --- Load Logo ---
LOGO_PATH = r"c:\Users\ja010\Desktop\hwaran\hwaran\logo\logo.png"

def get_base64_of_bin_file(bin_file):
    if os.path.exists(bin_file):
        with open(bin_file, 'rb') as f:
            data = f.read()
        return base64.b64encode(data).decode()
    return ""

logo_base64 = get_base64_of_bin_file(LOGO_PATH)

# --- Mock Data ---
if "clubs" not in st.session_state:
    st.session_state.clubs_data = pd.DataFrame([
        {"id": 1, "name": "코딩 동아리 (Algo)", "category": "학술", "members": 45, "status": "활동 중", "description": "알고리즘 및 웹 개발을 공부합니다."},
        {"id": 2, "name": "밴드 동아리 (Rock)", "category": "공연", "members": 20, "status": "활동 중", "description": "정기 공연을 개최하는 밴드 동아리입니다."},
        {"id": 3, "name": "농구 동아리 (Hoop)", "category": "체육", "members": 35, "status": "활동 중", "description": "매주 수요일 농구 경기를 진행합니다."},
        {"id": 4, "name": "사진 동아리 (Focus)", "category": "예술", "members": 28, "status": "모집 중", "description": "사진 촬영 및 전시회를 엽니다."},
    ])

if "announcements" not in st.session_state:
    st.session_state.announcements_data = [
        {"date": "2024-03-01", "title": "2024학년도 1학기 동아리 등록 안내", "author": "동아리 연합회", "is_important": True},
        {"date": "2024-02-28", "title": "동아리방 배정 결과 공지", "author": "시설관리부", "is_important": False},
        {"date": "2024-02-15", "title": "신입 회원 모집 가이드라인", "author": "동아리 연합회", "is_important": False},
    ]

if "executives" not in st.session_state:
    st.session_state.executives_data = pd.DataFrame([
        {"role": "회장", "name": "김철수", "department": "컴퓨터공학과", "contact": "010-1234-5678"},
        {"role": "부회장", "name": "이영희", "department": "경영학과", "contact": "010-8765-4321"},
        {"role": "총무부장", "name": "박민수", "department": "경제학과", "contact": "010-1111-2222"},
        {"role": "기획부장", "name": "정소진", "department": "사회학과", "contact": "010-3333-4444"},
    ])

# --- Custom CSS (to mimic the provided image design) ---
st.markdown("""
<style>
    /* Base margin handling for full width */
    .block-container {
        padding-top: 2rem !important; /* Give back top padding so header isn't cut off */
        padding-bottom: 2rem !important;
        max-width: 100% !important;
    }
    
    /* Top Logo/Navigation Area */
    .top-nav-area {
        background-color: #121212; /* Dark background matching image */
        padding: 15px 50px;
        display: flex;
        align-items: center;
        width: 100vw;
    }
    
    .logo-img {
        height: 60px;
        margin-right: 15px;
    }
    
    .nav-title {
        color: white;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
    }
    
    /* Main Banner Area styling (Pink/Coral spectrum) */
    .main-banner {
        background: linear-gradient(135deg, #ff7e5f, #feb47b); /* Soft pinkish/peach gradient */
        padding: 60px 20px;
        text-align: center;
        color: white;
        width: 100vw;
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    
    .banner-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
    }

    .banner-logo {
        height: 90px;
        border-radius: 50%;
        background-color: white;
        padding: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    .main-banner h1 {
        font-size: 2.8rem;
        font-weight: 800;
        margin: 0;
        color: white;
        letter-spacing: -1px;
    }
    
    .main-banner p {
        font-size: 1.15rem;
        opacity: 0.95;
        margin: 0;
    }
    
    /* Main Content Wrapper (to give margin back to the content) */
    .content-wrapper {
        padding: 0 5vw;
        max-width: 1400px;
        margin: 0 auto;
    }
    
    /* Card Styles */
    .custom-card {
        background-color: white;
        border-radius: 12px;
        padding: 25px 20px;
        box-shadow: 0 4px 12px rgba(255, 126, 95, 0.15); /* Soft pink shadow */
        border: 1px solid #fdf5f5;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    
    .card-icon {
        font-size: 2rem;
        color: #ff7e5f; /* Pinkish icon color */
        margin-bottom: 15px;
    }
    
    .card-title {
        font-size: 1.2rem;
        font-weight: 700;
        color: #333;
        margin-bottom: 8px;
    }
    
    .card-desc {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 20px;
        flex-grow: 1;
    }
    
    /* Button overrides for cards */
    .stButton > button {
        background-color: #ff7e5f;
        color: white;
        border: none;
        border-radius: 6px;
        width: 100%;
        padding: 10px;
        font-weight: 600;
        transition: all 0.3s;
    }
    .stButton > button:hover {
        background-color: #e56d53;
        color: white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }

    /* Other styles */
    .status-active { color: #155724; background-color: #d4edda; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .status-recruiting { color: #856404; background-color: #fff3cd; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
    .announcement-card { border: 1px solid #fdf5f5; padding: 15px; border-radius: 8px; margin-bottom: 10px; background-color: white;}
    .important-badge { color: white; background-color: #ff7e5f; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px;}
</style>
""", unsafe_allow_html=True)

# 2. Centered Animated Option Menu (Pink Theme aware)
st.markdown('<div class="content-wrapper">', unsafe_allow_html=True)
page = option_menu(
    menu_title=None,  # Hide the title
    options=["홈", "동아리 목록", "동아리 등록", "공지사항", "세칙", "조직도"],
    icons=["house", "people", "pencil-square", "bell", "book", "diagram-3"], 
    menu_icon="cast", 
    default_index=0, 
    orientation="horizontal",
    styles={
        "container": {
            "padding": "15px", 
            "background-color": "#ffffff", 
            "border-radius": "12px",
            "box-shadow": "0px 4px 15px rgba(0,0,0,0.1)",
            "margin": "0 auto 40px auto",
            "max-width": "1000px",
            "border": "1px solid #f0f0f0",
            "position": "relative",
            "z-index": "100"
        },
        "icon": {"color": "inherit", "font-size": "18px"}, 
        "nav-link": {
            "font-size": "16px", 
            "text-align": "center", 
            "margin": "0px 5px", 
            "font-weight": "600", 
            "color": "#666",
            "--hover-color": "#fef0ef"
        },
        "nav-link-selected": {"background-color": "#ff7e5f", "color": "white"}
    }
)
st.markdown('</div>', unsafe_allow_html=True)

# 3. Main Header Banner Area (Pink Theme, with Logo) -> Persistent across pages
img_tag = f'<img src="data:image/png;base64,{logo_base64}" class="banner-logo" />' if logo_base64 else ""

st.markdown(f"""
<div class="main-banner">
<div class="banner-content">
{img_tag}
<h1>동아리 연합회 관리 시스템</h1>
<p>동아리 등록부터 활동 관리까지, 모든 것을 한 곳에서</p>
</div>
</div>
""", unsafe_allow_html=True)

# 4. Content Wrapper Start (Applies to all page bodies)
st.markdown('<div class="content-wrapper">', unsafe_allow_html=True)

# --- Render Pages ---

# 1. Home
if page == "홈":
    
    # Cards layout mimicking the image
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="custom-card">
            <div>
                <div class="card-icon">👥</div>
                <div class="card-title">동아리 디렉터리</div>
                <div class="card-desc">등록된 동아리 목록을 확인하세요</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("바로가기", key="btn_directory"):
            # Note: Streamlit radio buttons drive the state natively. 
            # To click a button and change a radio button is hacky unles we use session state callbacks.
            # We'll show a toast message here instead if clicked.
            st.toast("상단 '동아리 목록' 탭을 클릭하여 이동해주세요!", icon="⬆️")

    with col2:
        st.markdown("""
        <div class="custom-card">
            <div>
                <div class="card-icon">🔔</div>
                <div class="card-title">공지사항</div>
                <div class="card-desc">연합회 공지 및 회의록 확인</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("바로가기", key="btn_announcements"):
            st.toast("상단 '공지사항' 탭을 클릭하여 이동해주세요!", icon="⬆️")

    with col3:
        st.markdown("""
        <div class="custom-card">
            <div>
                <div class="card-icon">📖</div>
                <div class="card-title">세칙</div>
                <div class="card-desc">동아리 연합회 운영 세칙</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("바로가기", key="btn_regulations"):
            st.toast("상단 '세칙' 탭을 클릭하여 이동해주세요!", icon="⬆️")
            
    # Add some spacing and the second row of cards
    st.markdown("<br>", unsafe_allow_html=True)
    
    col4, col5, col6 = st.columns(3)
    with col4:
        st.markdown("""
        <div class="custom-card">
            <div>
                <div class="card-icon">🗂️</div>
                <div class="card-title">조직도</div>
                <div class="card-desc">연합회 임원진 소개</div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("바로가기", key="btn_org"):
            st.toast("상단 '조직도' 탭을 클릭하여 이동해주세요!", icon="⬆️")
            
    with col5:
        st.empty() # Empty column to align with layout
        
    with col6:
        st.empty() # Empty column to align with layout

# 2. Clubs Directory
elif page == "동아리 목록":
    st.markdown('<p class="big-font">동아리 디렉터리</p>', unsafe_allow_html=True)
    st.write("현재 등록되어 활동 중인 동아리 목록을 확인하세요.")
    
    search_query = st.text_input("🔍 동아리 이름 검색")
    
    df = st.session_state.clubs_data
    if search_query:
        df = df[df['name'].str.contains(search_query, case=False)]
        
    # Categories filter
    categories = ["전체"] + list(df['category'].unique())
    selected_cat = st.selectbox("분류 필터", categories)
    
    if selected_cat != "전체":
        df = df[df['category'] == selected_cat]
        
    st.markdown("---")
    
    # Display as cards
    for idx, row in df.iterrows():
        status_class = "status-active" if row['status'] == "활동 중" else "status-recruiting"
        with st.container(border=True):
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"### {row['name']} <span class='{status_class}'>{row['status']}</span>", unsafe_allow_html=True)
                st.write(row['description'])
                st.caption(f"분류: {row['category']} | 총원: {row['members']}명")
            with col2:
                st.button("상세 보기", key=f"view_{row['id']}")

# 3. Registration
elif page == "동아리 등록":
    st.markdown('<p class="big-font">신규 동아리 등록 신청</p>', unsafe_allow_html=True)
    st.write("동아리 정보와 승인에 필요한 서류를 제출해 주세요.")
    
    with st.form("club_registration_form"):
        st.subheader("기본 정보")
        club_name = st.text_input("동아리 이름", placeholder="예: 코딩연구회")
        club_category = st.selectbox("분류", ["학술", "공연", "예술", "체육", "종교", "친목", "기타"])
        club_desc = st.text_area("동아리 소개 (200자 이내)", max_chars=200)
        
        st.subheader("대표자 정보")
        rep_name = st.text_input("대표자 성명")
        rep_contact = st.text_input("연락처", placeholder="010-0000-0000")
        
        st.subheader("증빙 서류")
        uploaded_file = st.file_uploader("활동 계획서 또는 회원 명부 첨부 (PDF, DOCX 등)", type=['pdf', 'docx', 'xlsx'])
        
        st.markdown("---")
        submitted = st.form_submit_button("✅ 등록 신청서 제출", type="primary")
        
        if submitted:
            if not club_name or not rep_name:
                st.error("동아리 이름과 대표자 성명은 필수 항목입니다.")
            else:
                st.success(f"성공적으로 제출되었습니다! 연합회 승인 후 정식 등록됩니다. ({club_name})")

# 4. Announcements
elif page == "공지사항":
    st.markdown('<p class="big-font">공지사항</p>', unsafe_allow_html=True)
    st.write("연합회의 최근 소식 및 회의록을 확인하세요.")
    
    for idx, ann in enumerate(st.session_state.announcements_data):
        important_tag = "<span class='important-badge'>필독</span> " if ann['is_important'] else ""
        with st.expander(f"{'🚨 ' if ann['is_important'] else ''}{ann['title']}"):
            st.markdown(f"**작성자:** {ann['author']} | **등록일:** {ann['date']}")
            st.write("해당 공지의 상세 내용은 여기에 표시됩니다. 첨부 파일이 있다면 아래에서 다운로드 받을 수 있습니다.")
            st.button("첨부파일 다운로드", key=f"download_ann_{idx}")

# 5. Regulations
elif page == "세칙":
    st.markdown('<p class="big-font">동아리 연합회 세칙</p>', unsafe_allow_html=True)
    
    search_term = st.text_input("🔍 세칙 본문 검색")
    if search_term:
        st.info("해당 단어가 포함된 조항을 검색 중입니다... (검색 결과가 없습니다 - 테스트 모드)")
    else:
        tab1, tab2, tab3 = st.tabs(["제1장 총칙", "제2장 조직 및 임원", "제3장 재정 및 징계"])
        
        with tab1:
            st.markdown("""
            **제 1 조 (목적)**
            이 세칙은 학생 동아리 연합회의 구성, 운영 및 기타 필요한 사항을 규정하여 
            자치활동을 보장하고 건전한 동아리 문화를 조성함을 목적으로 한다.
            
            **제 2 조 (명칭)**
            본 회는 'KENTECH(한국에너지공과대학교) 총동아리연합회'라 칭한다.
            """)
        with tab2:
            st.write("조직 구성 및 임원의 권리와 의무에 관한 조항이 들어갈 자리입니다.")
        with tab3:
            st.write("회비 징수, 예산 분배 절차, 그리고 동아리 경고 및 제명 기준이 들어갈 자리입니다.")

# 6. Organization
elif page == "조직도":
    st.markdown('<p class="big-font">조직도 및 연합회 구성원</p>', unsafe_allow_html=True)
    st.write("연합회를 이끌어가는 학생 임원진 및 소속 부서를 안내합니다.")
    
    # Render table nicely
    st.dataframe(
        st.session_state.executives_data,
        use_container_width=True,
        hide_index=True,
        column_config={
            "role": st.column_config.TextColumn("직책"),
            "name": st.column_config.TextColumn("이름"),
            "department": st.column_config.TextColumn("소속 학과"),
            "contact": st.column_config.TextColumn("연락처 (사무실/이메일)")
        }
    )
    
    st.write("📬 기타 문의사항은 이메일: student_union@university.ac.kr 로 연락바랍니다.")

# Close the content wrapper
st.markdown('</div>', unsafe_allow_html=True)

