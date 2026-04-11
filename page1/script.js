;(() => {
  const searchInput = document.getElementById("searchInput")
  const sendBtn = document.getElementById("sendBtn")
  const suggestionBtns = document.querySelectorAll(".suggestion-btn")

  /**
   * 채팅 페이지로 이동
   * @param {string} query - 검색어
   */
  function navigateToChat(query) {
    if (!query.trim()) return

    // URL 파라미터로 초기 메시지 전달
    const encodedQuery = encodeURIComponent(query.trim())
    window.location.href = `../page2/index.html?q=${encodedQuery}`
  }

  /**
   * 입력값 변경 핸들러
   */
  function handleInputChange() {
    const hasValue = searchInput.value.trim().length > 0
    sendBtn.disabled = !hasValue
  }

  /**
   * 메시지 전송 핸들러
   */
  function handleSend() {
    navigateToChat(searchInput.value)
  }

  /**
   * 키보드 이벤트 핸들러
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey && !sendBtn.disabled) {
      e.preventDefault()
      handleSend()
    }
  }

  /**
   * 추천 질문 클릭 핸들러
   * @param {Event} e
   */
  function handleSuggestionClick(e) {
    const btn = e.currentTarget
    const query = btn.dataset.query
    if (query) {
      navigateToChat(query)
    }
  }

  // Event Listeners
  searchInput.addEventListener("input", handleInputChange)
  searchInput.addEventListener("keydown", handleKeydown)
  sendBtn.addEventListener("click", handleSend)

  suggestionBtns.forEach((btn) => {
    btn.addEventListener("click", handleSuggestionClick)
  })

  // Focus input on load
  searchInput.focus()
})()

document.addEventListener('DOMContentLoaded', () => {
    // 1. 로그인 상태 업데이트 실행
    updateAuthUI();

    // 2. 로그아웃 버튼 클릭 이벤트 연결
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // 로컬 스토리지 비우기
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('provider');
            
            alert("로그아웃 되었습니다.");
            // 메인 페이지로 이동 또는 새로고침
            location.href = '../index.html';
        });
    }
});

/**
 * 로그인 상태(토큰 유무)에 따라 헤더의 버튼을 교체하는 함수
 */
function updateAuthUI() {
    const accessToken = localStorage.getItem('accessToken');
    const loginGroup = document.getElementById('login-group');
    const userGroup = document.getElementById('user-group');

    if (accessToken) {
        // 토큰이 있으면: 로그인 버튼 숨기고, 로그아웃 버튼 보이기
        if (loginGroup) loginGroup.style.display = 'none';
        if (userGroup) userGroup.style.display = 'block';
    } else {
        // 토큰이 없으면: 로그인 버튼 보이고, 로그아웃 버튼 숨기기
        if (loginGroup) loginGroup.style.display = 'block';
        if (userGroup) userGroup.style.display = 'none';
    }
}