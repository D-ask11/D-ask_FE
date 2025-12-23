/**
 * Page 2 - Chat Page Script
 * 채팅 기능 및 API 연동
 */

;(() => {
  // ============================================
  // API Configuration
  // ============================================
  const ChatAPI = {
    BASE_URL: "Dask-AI",

    /**
     * 메시지 전송 API
     * @param {string} question - 사용자 질문
     * @returns {Promise<string>} AI 응답
     */
    async sendMessage(question) {
      const response = await fetch(`${this.BASE_URL}/qna`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      const data = await response.json()

      if (response.ok) {
        // 200 OK - 정상 응답
        return data.answer
      } else if (response.status === 400) {
        // 400 Bad Request - 관련 없는 질문 또는 user 정보 질문
        return data.message
      } else if (response.status === 403) {
        // 403 Forbidden - 학교 보안 관련 질문
        return data.message
      } else if (response.status === 500) {
        // 500 Internal Server Error
        throw new Error(data.message || "서버 에러입니다.")
      } else {
        throw new Error(`API Error: ${response.status}`)
      }
    },
  }

  // ============================================
  // Chat Manager
  // ============================================
  const ChatManager = {
    chatArea: null,
    messageInput: null,
    sendBtn: null,
    isLoading: false,

    /**
     * 초기화
     */
    init() {
      this.chatArea = document.getElementById("chatArea")
      this.messageInput = document.getElementById("messageInput")
      this.sendBtn = document.getElementById("sendBtn")

      this.bindEvents()
      this.handleInitialMessage()
    },

    /**
     * 이벤트 바인딩
     */
    bindEvents() {
      this.messageInput.addEventListener("input", () => this.handleInputChange())
      this.messageInput.addEventListener("keydown", (e) => this.handleKeydown(e))
      this.sendBtn.addEventListener("click", () => this.sendMessage())
    },

    /**
     * URL 파라미터로 전달된 초기 메시지 처리
     */
    handleInitialMessage() {
      const params = new URLSearchParams(window.location.search)
      const initialQuery = params.get("q")

      if (initialQuery) {
        this.messageInput.value = initialQuery
        this.handleInputChange()
        // 약간의 딜레이 후 자동 전송
        setTimeout(() => this.sendMessage(), 300)
      } else {
        this.messageInput.focus()
      }
    },

    /**
     * 입력값 변경 핸들러
     */
    handleInputChange() {
      const hasValue = this.messageInput.value.trim().length > 0
      this.sendBtn.disabled = !hasValue || this.isLoading
    },

    /**
     * 키보드 이벤트 핸들러
     * @param {KeyboardEvent} e
     */
    handleKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey && !this.sendBtn.disabled) {
        e.preventDefault()
        this.sendMessage()
      }
    },

    /**
     * 메시지 전송
     */
    async sendMessage() {
      const message = this.messageInput.value.trim()
      if (!message || this.isLoading) return

      // 사용자 메시지 추가
      this.addMessage(message, "user")
      this.messageInput.value = ""
      this.handleInputChange()

      // 로딩 상태 시작
      this.isLoading = true
      this.sendBtn.disabled = true
      this.showTypingIndicator()

      try {
        // API 호출
        const response = await ChatAPI.sendMessage(message)

        // 타이핑 인디케이터 제거 후 응답 추가
        this.hideTypingIndicator()
        this.addMessage(response, "ai")
      } catch (error) {
        console.error("API Error:", error)
        this.hideTypingIndicator()
        this.addMessage(error.message || "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.", "ai")
      } finally {
        this.isLoading = false
        this.handleInputChange()
        this.messageInput.focus()
      }
    },

    /**
     * 메시지 추가
     * @param {string} text - 메시지 내용
     * @param {string} type - 'user' 또는 'ai'
     */
    addMessage(text, type) {
      const messageEl = document.createElement("div")
      messageEl.className = `message message--${type}`

      const bubbleEl = document.createElement("div")
      bubbleEl.className = "message__bubble"

      // 줄바꿈 처리
      bubbleEl.innerHTML = text.replace(/\n/g, "<br>")

      messageEl.appendChild(bubbleEl)
      this.chatArea.appendChild(messageEl)

      this.scrollToBottom()
    },

    /**
     * 타이핑 인디케이터 표시
     */
    showTypingIndicator() {
      const indicator = document.createElement("div")
      indicator.className = "typing-indicator"
      indicator.id = "typingIndicator"
      indicator.innerHTML = "<span></span><span></span><span></span>"
      this.chatArea.appendChild(indicator)
      this.scrollToBottom()
    },

    /**
     * 타이핑 인디케이터 제거
     */
    hideTypingIndicator() {
      const indicator = document.getElementById("typingIndicator")
      if (indicator) {
        indicator.remove()
      }
    },

    /**
     * 스크롤 하단으로 이동
     */
    scrollToBottom() {
      this.chatArea.scrollTop = this.chatArea.scrollHeight
    },
  }

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    ChatManager.init()
  })
})()
