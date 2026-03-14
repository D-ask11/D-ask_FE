
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
