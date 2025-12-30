<<<<<<< HEAD
;(() => {

  /* ============================================================
     1. ChatAPI
     ============================================================ */
  const ChatAPI = {
    BASE_URL: "http://10.208.156.213:8000", // TODO: 실제 서버 URL

    async sendMessage(question) {
      const response = await fetch(`${this.BASE_URL}/qna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })
      const data = await response.json()
      if (response.ok)             return data.answer
      if (response.status === 400) return data.message
      if (response.status === 403) return data.message
      if (response.status === 500) throw new Error(data.message || "서버 에러입니다.")
      throw new Error(`API Error: ${response.status}`)
    },

    /**
     * 채팅방 히스토리 조회
     * TODO: 퍼블리싱 완료 후 아래 주석 블록으로 교체하세요.
     *
     * GET {BASE_URL}/rooms/{roomId}/messages
     * Headers: Authorization: Bearer {JWT토큰}
     * 응답: { title: string, messages: [{role, content, timestamp}] }
     * 에러: 403(권한없음) / 404(존재안함) / 500(서버오류)
     */
    async getRoomHistory(roomId) {
      // ── 임시: 로컬스토리지 (API 연동 전) ──
      const room = StorageManager.getRoom(roomId)
      if (!room) throw { status: 404, message: "존재하지 않는 대화입니다." }
      return { title: room.title, messages: room.messages }
      // ── API 연동 후 교체 ──────────────────
      // const token = /* TODO: JWT */
      // const res = await fetch(`${this.BASE_URL}/rooms/${roomId}/messages`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // if (res.status === 403) throw { status: 403, message: "접근 권한이 없습니다." }
      // if (res.status === 404) throw { status: 404, message: "존재하지 않는 대화입니다." }
      // if (!res.ok) throw { status: res.status, message: "내역을 불러오지 못했습니다." }
      // return await res.json()
    },

    /**
     * 채팅방 삭제
     * TODO: 퍼블리싱 완료 후 아래 주석 블록으로 교체하세요.
     *
     * DELETE {BASE_URL}/rooms/{roomId}
     * Headers: Authorization: Bearer {JWT토큰}
     */
    async deleteRoom(roomId) {
      // ── 임시: 로컬스토리지 (API 연동 전) ──
      StorageManager.deleteRoom(roomId)
      // ── API 연동 후 교체 ──────────────────
      // const token = /* TODO: JWT */
      // const res = await fetch(`${this.BASE_URL}/rooms/${roomId}`, {
      //   method: "DELETE",
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // if (!res.ok) {
      //   const data = await res.json()
      //   throw new Error(data.message || "삭제에 실패했습니다.")
      // }
    },
  }

  /* ============================================================
     2. StorageManager — 로컬 임시 저장소 (API 연동 전)
        TODO: API 연동 완료 후 제거하거나 캐시 용도로만 사용하세요.
     ============================================================ */
  const STORAGE_KEY = "dask_rooms"

  const StorageManager = {
    getRooms() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] }
      catch { return [] }
    },
    saveRooms(rooms) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
    },
    getRoom(roomId) {
      return this.getRooms().find(r => r.id === roomId) || null
    },
    createRoom(firstMessage) {
      const rooms = this.getRooms()
      const room = {
        id: `room_${Date.now()}`,
        title: firstMessage.length > 20 ? firstMessage.slice(0, 20) + "..." : firstMessage,
        messages: [],
        createdAt: new Date().toISOString(),
      }
      rooms.unshift(room)
      this.saveRooms(rooms)
      return room
    },
    addMessage(roomId, role, content) {
      const rooms = this.getRooms()
      const room = rooms.find(r => r.id === roomId)
      if (!room) return
      room.messages.push({ role, content, timestamp: new Date().toISOString() })
      this.saveRooms(rooms)
    },
    deleteRoom(roomId) {
      this.saveRooms(this.getRooms().filter(r => r.id !== roomId))
    },
  }

  /* ============================================================
     3. Toast
     ============================================================ */
  const Toast = {
    el: null, timer: null,
    init() { this.el = document.getElementById("toast") },
    show(message, duration = 2500) {
      if (!this.el) return
      this.el.textContent = message
      this.el.classList.add("show")
      clearTimeout(this.timer)
      this.timer = setTimeout(() => this.el.classList.remove("show"), duration)
    },
  }

  /* ============================================================
     4. ModalManager
     ============================================================ */
  const ModalManager = {
    overlay: null, confirmBtn: null, cancelBtn: null, _cb: null,
    init() {
      this.overlay    = document.getElementById("deleteModalOverlay")
      this.confirmBtn = document.getElementById("deleteConfirmBtn")
      this.cancelBtn  = document.getElementById("deleteCancelBtn")
      this.confirmBtn.addEventListener("click", () => { this.hide(); this._cb?.(true) })
      this.cancelBtn.addEventListener("click",  () => { this.hide(); this._cb?.(false) })
      this.overlay.addEventListener("click", e => {
        if (e.target === this.overlay) { this.hide(); this._cb?.(false) }
      })
    },
    confirm() {
      return new Promise(resolve => {
        this._cb = resolve
        this.overlay.classList.add("visible")
      })
    },
    hide() {
      this.overlay.classList.remove("visible")
      this._cb = null
    },
  }

  /* ============================================================
     5. SidebarManager
        collapsed  → 60px 아이콘 바
        expanded   → 220px 목록 패널
     ============================================================ */
  const SidebarManager = {
    sidebar: null,
    closeBtn: null,
    logoLink: null,
    appLayout: null,
    roomList: null,
    chatListToggle: null,
    newChatBtn: null,

    currentRoomId: null,
    isListCollapsed: false,

    init() {
      this.sidebar        = document.getElementById("sidebar")
      this.closeBtn       = document.getElementById("sidebarCloseBtn")
      this.logoLink       = this.sidebar.querySelector(".sidebar__logo")
      this.appLayout      = document.querySelector(".app-layout")
      this.roomList       = document.getElementById("roomList")
      this.chatListToggle = document.getElementById("chatListToggle")
      this.newChatBtn     = document.getElementById("newChatBtn")

      this.bindEvents()
      this.renderRoomList()
    },

    bindEvents() {
      // 사이드바 전체 클릭 핸들러: collapsed 상태일 때 확장
      // 단, 클릭된 요소가 로고(.sidebar__logo) 또는 + 버튼(#newChatBtn) 이면 확장하지 않음
      this.sidebar.addEventListener("click", (e) => {
        if (!this.isCollapsed()) return
        const isLogo    = !!e.target.closest(".sidebar__logo")
        const isNewChat = !!e.target.closest("#newChatBtn")
        if (!isLogo && !isNewChat) this.expand()
      })

      // 로고: href 그대로 동작 (항상 메인화면 이동) — 추가 처리 없음

      // + 새 채팅 버튼: 항상 새 채팅 시작
      this.newChatBtn.addEventListener("click", () => {
        ChatManager.startNewChat()
      })

      // ← 접기 버튼: stopPropagation으로 사이드바 전체 핸들러 버블링 차단
      this.closeBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.collapse()
      })

      // 섹션 헤더 (채팅 ▼)
      this.chatListToggle.addEventListener("click", () => this.toggleRoomList())
    },

    isCollapsed() {
      return this.sidebar.classList.contains("collapsed")
    },

    collapse() {
      this.sidebar.classList.add("collapsed")
      this.appLayout.classList.add("sidebar-collapsed")
    },

    expand() {
      this.sidebar.classList.remove("collapsed")
      this.appLayout.classList.remove("sidebar-collapsed")
    },

    toggleRoomList() {
      this.isListCollapsed = !this.isListCollapsed
      this.chatListToggle.classList.toggle("list-collapsed", this.isListCollapsed)
      this.roomList.style.display = this.isListCollapsed ? "none" : ""
    },

    /**
     * 채팅방 목록 렌더링
     * TODO: API 연동 후 StorageManager → 서버 응답으로 교체하세요.
     */
    renderRoomList() {
      const rooms = StorageManager.getRooms()
      this.roomList.innerHTML = ""

      if (rooms.length === 0) {
        const li = document.createElement("li")
        li.style.cssText = "padding:12px;color:rgba(255,255,255,0.3);font-size:0.8rem;text-align:center;"
        li.textContent = "첫 메시지를 보내보세요!"
        this.roomList.appendChild(li)
        return
      }

      rooms.forEach(room => this.roomList.appendChild(this._createRoomItem(room)))
      this._updateActiveState()
    },

    _createRoomItem(room) {
      const li = document.createElement("li")
      li.className = "sidebar__room-item"
      li.dataset.roomId = room.id

      const titleEl = document.createElement("span")
      titleEl.className = "sidebar__room-title"
      titleEl.textContent = room.title

      const deleteBtn = document.createElement("button")
      deleteBtn.className = "sidebar__delete-btn"
      deleteBtn.title = "대화 삭제"
      deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`

      li.appendChild(titleEl)
      li.appendChild(deleteBtn)

      li.addEventListener("click", e => {
        if (e.target.closest(".sidebar__delete-btn")) return
        this.loadRoom(room.id)
      })
      deleteBtn.addEventListener("click", e => {
        e.stopPropagation()
        this._handleDeleteRoom(room.id)
      })

      return li
    },

    _updateActiveState() {
      this.roomList.querySelectorAll(".sidebar__room-item").forEach(li => {
        li.classList.toggle("active", li.dataset.roomId === this.currentRoomId)
      })
    },

    async loadRoom(roomId) {
      if (roomId === this.currentRoomId) return
      this.currentRoomId = roomId
      this._updateActiveState()
      ChatManager.clearMessages()

      try {
        const { messages } = await ChatAPI.getRoomHistory(roomId)
        if (!messages || messages.length === 0) {
          ChatManager.showEmptyState()
          return
        }
        messages.forEach(msg => {
          ChatManager.addMessage(msg.content, msg.role === "user" ? "user" : "ai", false)
        })
      } catch (err) {
        if (err.status === 404) {
          ChatManager.addMessage("존재하지 않는 대화입니다.", "ai")
          return
        }
        ChatManager.showLoadError(roomId)
      }
    },

    async _handleDeleteRoom(roomId) {
      const confirmed = await ModalManager.confirm()
      if (!confirmed) return
      try {
        await ChatAPI.deleteRoom(roomId)
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null
          ChatManager.clearMessages()
          ChatManager.showEmptyState()
        }
        this.renderRoomList()
      } catch {
        Toast.show("삭제에 실패했습니다.")
      }
    },

    createNewRoom(firstMessage) {
      const room = StorageManager.createRoom(firstMessage)
      this.currentRoomId = room.id
      this.renderRoomList()
      return room.id
    },
  }

  /* ============================================================
     6. ChatManager
     ============================================================ */
=======
/**
 * Page 2 - Chat Page Script
 * 채팅 기능 및 API 연동
 */


;(() => {
  // ============================================
  // API Configuration
  // ============================================
  const ChatAPI = {
  BASE_URL: "http://192.168.1.28:8080",


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
>>>>>>> e3f5616 (QnA_page)
  const ChatManager = {
    chatArea: null,
    messageInput: null,
    sendBtn: null,
<<<<<<< HEAD
    emptyState: null,
    isLoading: false,

    init() {
      this.chatArea     = document.getElementById("chatArea")
      this.messageInput = document.getElementById("messageInput")
      this.sendBtn      = document.getElementById("sendBtn")
      this.emptyState   = document.getElementById("chatEmptyState")
=======
    isLoading: false,

    /**
     * 초기화
     */
    init() {
      this.chatArea = document.getElementById("chatArea")
      this.messageInput = document.getElementById("messageInput")
      this.sendBtn = document.getElementById("sendBtn")
>>>>>>> e3f5616 (QnA_page)

      this.bindEvents()
      this.handleInitialMessage()
    },

<<<<<<< HEAD
    bindEvents() {
      this.messageInput.addEventListener("input",   () => this.handleInputChange())
      this.messageInput.addEventListener("keydown", e => this.handleKeydown(e))
      this.sendBtn.addEventListener("click",        () => this.sendMessage())
    },

    handleInitialMessage() {
      const params = new URLSearchParams(window.location.search)
      const q = params.get("q")
      if (q) {
        this.messageInput.value = q
        this.handleInputChange()
=======
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
>>>>>>> e3f5616 (QnA_page)
        setTimeout(() => this.sendMessage(), 300)
      } else {
        this.messageInput.focus()
      }
    },

<<<<<<< HEAD
    handleInputChange() {
      this.sendBtn.disabled = !this.messageInput.value.trim() || this.isLoading
    },

=======
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
>>>>>>> e3f5616 (QnA_page)
    handleKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey && !this.sendBtn.disabled) {
        e.preventDefault()
        this.sendMessage()
      }
    },

<<<<<<< HEAD
    startNewChat() {
      SidebarManager.currentRoomId = null
      SidebarManager._updateActiveState()
      this.clearMessages()
      this.showEmptyState()
      this.messageInput.focus()
    },

=======
    /**
     * 메시지 전송
     */
>>>>>>> e3f5616 (QnA_page)
    async sendMessage() {
      const message = this.messageInput.value.trim()
      if (!message || this.isLoading) return

<<<<<<< HEAD
      if (!SidebarManager.currentRoomId) {
        SidebarManager.createNewRoom(message)
      }

      this.addMessage(message, "user")
      StorageManager.addMessage(SidebarManager.currentRoomId, "user", message)

      this.messageInput.value = ""
      this.handleInputChange()

=======
      // 사용자 메시지 추가
      this.addMessage(message, "user")
      this.messageInput.value = ""
      this.handleInputChange()

      // 로딩 상태 시작
>>>>>>> e3f5616 (QnA_page)
      this.isLoading = true
      this.sendBtn.disabled = true
      this.showTypingIndicator()

      try {
<<<<<<< HEAD
        const response = await ChatAPI.sendMessage(message)
        this.hideTypingIndicator()
        this.addMessage(response, "ai")
        StorageManager.addMessage(SidebarManager.currentRoomId, "model", response)
      } catch (error) {
        this.hideTypingIndicator()
        this.addMessage(error.message || "죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.", "ai")
=======
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

<<<<<<< HEAD
    addMessage(text, type, animate = true) {
      this.emptyState.classList.add("hidden")
      const messageEl = document.createElement("div")
      messageEl.className = `message message--${type}`
      if (!animate) messageEl.style.animation = "none"
      const bubbleEl = document.createElement("div")
      bubbleEl.className = "message__bubble"
      bubbleEl.innerHTML = text.replace(/\n/g, "<br>")
      messageEl.appendChild(bubbleEl)
      this.chatArea.appendChild(messageEl)
      this.scrollToBottom()
    },

    clearMessages() {
      Array.from(this.chatArea.children).forEach(child => {
        if (child.id !== "chatEmptyState") child.remove()
      })
    },

    showEmptyState() {
      this.emptyState.classList.remove("hidden")
    },

    showLoadError(roomId) {
      const el = document.createElement("div")
      el.className = "message message--ai"
      el.innerHTML = `
        <div class="message__bubble">
          내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          <br><br>
          <button
            onclick="this.closest('.message').remove(); SidebarManager.loadRoom('${roomId}')"
            style="background:var(--primary-1);color:#fff;border:none;padding:6px 16px;border-radius:50px;cursor:pointer;font-size:0.85rem;"
          >재시도</button>
        </div>`
      this.chatArea.appendChild(el)
      this.scrollToBottom()
    },

    showTypingIndicator() {
      const el = document.createElement("div")
      el.className = "typing-indicator"
      el.id = "typingIndicator"
      el.innerHTML = "<span></span><span></span><span></span>"
      this.chatArea.appendChild(el)
      this.scrollToBottom()
    },

    hideTypingIndicator() {
      document.getElementById("typingIndicator")?.remove()
    },

=======
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
>>>>>>> e3f5616 (QnA_page)
    scrollToBottom() {
      this.chatArea.scrollTop = this.chatArea.scrollHeight
    },
  }

<<<<<<< HEAD
  /* ============================================================
     초기화
     ============================================================ */
  document.addEventListener("DOMContentLoaded", () => {
    Toast.init()
    ModalManager.init()
    SidebarManager.init()
    ChatManager.init()
  })

})()
=======
  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    ChatManager.init()
  })
})()
>>>>>>> e3f5616 (QnA_page)
