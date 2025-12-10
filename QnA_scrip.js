 const searchInput = document.getElementById('searchInput');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    const sendBtn = document.getElementById('sendBtn');

    // 선택지 버튼 클릭 시 검색창에 텍스트 입력
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        searchInput.value = text;
        searchInput.focus();
      });
    });

    // 전송 버튼 클릭 시 (기본 동작 예시)
    sendBtn.addEventListener('click', () => {
      if (searchInput.value.trim()) {
        alert('질문: ' + searchInput.value);
        // 여기에 실제 챗봇 로직을 추가하세요
      }
    });

    // Enter 키로 전송
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        sendBtn.click();
      }
    });