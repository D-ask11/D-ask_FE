/**
 * Page 2 - Chat Page Script
 * 채팅 기능 및 API 연동
 */

;(() => {
  // ============================================
  // API Configuration - 백엔드 연동 시 이 부분만 수정
  // ============================================
  const ChatAPI = {
    BASE_URL: "/api", // 실제 API URL로 변경

    /**
     * 메시지 전송 API
     * @param {string} message - 사용자 메시지
     * @returns {Promise<string>} AI 응답
     */
    async sendMessage(message) {
      // === 실제 API 연동 시 아래 코드 사용 ===
      /*
            const response = await fetch(`${this.BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            const data = await response.json();
            return this.parseResponse(data);
            */

      // === 테스트용 Mock 응답 ===
      return this.mockResponse(message)
    },

    /**
     * API 응답 파싱 - 백엔드 응답 구조에 맞게 수정
     * @param {Object} data - API 응답 데이터
     * @returns {string} 파싱된 메시지
     */
    parseResponse(data) {
      // 백엔드 응답 구조에 맞게 수정
      // 예: return data.response || data.message || data.answer
      return data.response
    },

    /**
     * 테스트용 Mock 응답
     * @param {string} message
     * @returns {Promise<string>}
     */
    mockResponse(message) {
      return new Promise((resolve) => {
        setTimeout(
          () => {
            const responses = {
              독서록:
                "한 학기에 인증제 채우려면 6개를 작성하면 됩니다.\n한 달에 한권 정도만 작성하면 인증제를 완벽하게 채울 수 있어요!\n어쩌고저쩌고어쩌고.... 저쩌고,,,,,\n이래서 저렇게 하면 됩니다......",
              인증제:
                "DMS 인증제는 학생들의 다양한 활동을 인증해주는 제도입니다.\n독서, 봉사, 체육 등 여러 영역에서 활동을 인증받을 수 있습니다.",
              "12개": "네, 맞습니다 !\nDMS 독서품은 1년에 12권을 작성하면 됩니다.",
              default: "안녕하세요! 학교에 대해 궁금한 점이 있으시면 질문해주세요.",
            }

            let response = responses.default
            for (const [key, value] of Object.entries(responses)) {
              if (key !== "default" && message.includes(key)) {
                response = value
                break
              }
            }

            resolve(response)
          },
          1000 + Math.random() * 500,
        )
      })
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
        this.addMessage("죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.", "ai")
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
      bubbleEl.textContent = text

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
