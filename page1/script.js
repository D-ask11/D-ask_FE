(() => {
  const searchInput = document.getElementById("searchInput");
  const sendBtn = document.getElementById("sendBtn");
  const suggestionBtns = document.querySelectorAll(".suggestion-btn");

  const navigateToChat = (query) => { // 질문들고 그대로 다음페이지 챠팅 이동
    if (!query.trim()) return;
    window.location.href = `../page2/index.html?q=${encodeURIComponent(query.trim())}`;
  };

  searchInput.addEventListener("input", () => {
    sendBtn.disabled = searchInput.value.trim().length === 0;
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !sendBtn.disabled) {
      e.preventDefault();
      navigateToChat(searchInput.value);
    }
  });

  sendBtn.addEventListener("click", () => navigateToChat(searchInput.value));

  suggestionBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const query = e.currentTarget.dataset.query;
      if (query) navigateToChat(query);
    });
  });

  searchInput.focus();
})();



// 로그인 상태(토큰 유무) 확인해서 헤더 버튼 바꿔주는 것
const updateAuthUI = () => {
  const accessToken = localStorage.getItem('accessToken');
  const loginGroup = document.getElementById('login-group');
  const userGroup = document.getElementById('user-group');

  if (accessToken) {
    if (loginGroup) loginGroup.style.display = 'none';
    if (userGroup) userGroup.style.display = 'block';
  } else {
    if (loginGroup) loginGroup.style.display = 'block';
    if (userGroup) userGroup.style.display = 'none';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // 로그아웃 시 스토리지 다비우고 메인으로 보냄
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('provider');
      
      alert("로그아웃 되었습니다.");
      location.href = '../index.html';
    });
  }
});