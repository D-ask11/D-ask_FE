;(() => {
  const CONFIG = {
    BASE_URL: "http://10.208.156.213:8000", // 주의: 실배포시 https 필수
    USER_ID: "testUser", // 임시 유저 ID (추후 인증 연동)
  };

// api없어서 일단 임시 수정해야함
  const ChatAPI = {
    // AI QnA 자동응답 (이건있음)
    async askQuestion(question) {
      const res = await fetch(`${CONFIG.BASE_URL}/dask-ai/qna`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (res.ok) return data.answer;
      if ([400, 403].includes(res.status)) throw new Error(data.message);
      if (res.status === 500) throw new Error("서버 에러입니다. 백엔드에게 문의하세요.");
      throw new Error(`API Error: ${res.status}`);
    },

    // 채팅 목록 조회 
    async getRoomList() {
      const res = await fetch(`${CONFIG.BASE_URL}/chat/list?id=${CONFIG.USER_ID}`); // URL Path 확인 필요!
      if (!res.ok) throw new Error("채팅 목록을 불러오는데 실패했습니다.");
      return await res.json();
    },

    // 대화내용 조회
    async getMessages(roomId) {
      const res = await fetch(`${CONFIG.BASE_URL}/chat?id=${roomId}`);
      if (!res.ok) throw new Error("대화 내역을 불러오지 못했습니다.");
      return await res.json();
    },

    // 새 채팅 생성
    async createRoom(question, answer) {
      const message = `질문:${question} 답:${answer}`;
      const res = await fetch(`${CONFIG.BASE_URL}/chat`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("새 채팅방 생성에 실패했습니다.");
      return await res.json();
    },

    // 채팅 업데이트 
    async updateRoom(roomId, question, answer) {
      const message = `질문:${question} 답:${answer}`;
      const res = await fetch(`${CONFIG.BASE_URL}/chat/update`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId, message }),
      });
      if (!res.ok) throw new Error("채팅 기록 저장에 실패했습니다.");
      return await res.json();
    },

    // 채팅 삭제 (DELETE /chat) 
    async deleteRoom(roomId) {
      const res = await fetch(`${CONFIG.BASE_URL}/chat`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: roomId }),
      });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
    },
  };



  const Toast = {
    el: null, timer: null,
    init() { this.el = document.getElementById("toast"); },
    show(message, duration = 2500) {
      if (!this.el) return;
      this.el.textContent = message;
      this.el.classList.add("show");
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.el.classList.remove("show"), duration);
    },
  };



  const ModalManager = {
    overlay: null, confirmBtn: null, cancelBtn: null, _cb: null,
    init() {
      this.overlay = document.getElementById("deleteModalOverlay");
      this.confirmBtn = document.getElementById("deleteConfirmBtn");
      this.cancelBtn = document.getElementById("deleteCancelBtn");
      this.confirmBtn.addEventListener("click", () => { this.hide(); this._cb?.(true); });
      this.cancelBtn.addEventListener("click", () => { this.hide(); this._cb?.(false); });
      this.overlay.addEventListener("click", e => {
        if (e.target === this.overlay) { this.hide(); this._cb?.(false); }
      });
    },
    confirm() {
      return new Promise(resolve => {
        this._cb = resolve;
        this.overlay.classList.add("visible");
      });
    },
    hide() {
      this.overlay.classList.remove("visible");
      this._cb = null;
    },
  };

  const SidebarManager = {
    sidebar: null, closeBtn: null, roomList: null, chatListToggle: null, newChatBtn: null,
    currentRoomId: null, isListCollapsed: false,

    init() {
      this.sidebar = document.getElementById("sidebar");
      this.closeBtn = document.getElementById("sidebarCloseBtn");
      this.roomList = document.getElementById("roomList");
      this.chatListToggle = document.getElementById("chatListToggle");
      this.newChatBtn = document.getElementById("newChatBtn");

      this.bindEvents();
      this.fetchAndRenderRooms();
    },

    bindEvents() {
      this.sidebar.addEventListener("click", (e) => {
        if (!this.isCollapsed()) return;
        if (!e.target.closest(".sidebar__logo") && !e.target.closest("#newChatBtn")) this.expand();
      });

      this.newChatBtn.addEventListener("click", () => ChatManager.startNewChat());
      
      this.closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.collapse();
      });

      this.chatListToggle.addEventListener("click", () => this.toggleRoomList());
    },

    isCollapsed() { return this.sidebar.classList.contains("collapsed"); },
    collapse() { 
      this.sidebar.classList.add("collapsed"); 
      document.querySelector(".app-layout").classList.add("sidebar-collapsed"); 
    },
    expand() { 
      this.sidebar.classList.remove("collapsed"); 
      document.querySelector(".app-layout").classList.remove("sidebar-collapsed"); 
    },
    toggleRoomList() {
      this.isListCollapsed = !this.isListCollapsed;
      this.chatListToggle.classList.toggle("list-collapsed", this.isListCollapsed);
      this.roomList.style.display = this.isListCollapsed ? "none" : "";
    },

    // 서버에서 방 목록 가져와서 보여주기
    async fetchAndRenderRooms() {
      try {
        const rooms = await ChatAPI.getRoomList();
        this.renderRoomList(rooms);
      } catch (err) {
        console.error(err);
        this.roomList.innerHTML = `<li style="padding:12px;color:#ff8080;font-size:0.8rem;text-align:center;">목록을 불러오지 못했습니다.</li>`;
      }
    },

    renderRoomList(rooms) {
      this.roomList.innerHTML = "";
      if (!Array.isArray(rooms) || rooms.length === 0) {
        this.roomList.innerHTML = `<li style="padding:12px;color:rgba(255,255,255,0.3);font-size:0.8rem;text-align:center;">첫 메시지를 보내보세요!</li>`;
        return;
      }

      rooms.forEach(room => this.roomList.appendChild(this._createRoomItem(room)));
      this._updateActiveState();
    },

    _createRoomItem(room) {
      const li = document.createElement("li");
      li.className = "sidebar__room-item";
      li.dataset.roomId = room.id;

      const titleEl = document.createElement("span");
      titleEl.className = "sidebar__room-title";
      titleEl.textContent = room.title;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "sidebar__delete-btn";
      deleteBtn.title = "대화 삭제";
      deleteBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;

      li.appendChild(titleEl);
      li.appendChild(deleteBtn);

      li.addEventListener("click", e => {
        if (e.target.closest(".sidebar__delete-btn")) return;
        this.loadRoom(room.id);
      });
      deleteBtn.addEventListener("click", e => {
        e.stopPropagation();
        this._handleDeleteRoom(room.id);
      });

      return li;
    },

    _updateActiveState() {
      this.roomList.querySelectorAll(".sidebar__room-item").forEach(li => {
        li.classList.toggle("active", li.dataset.roomId === this.currentRoomId);
      });
    },

    async loadRoom(roomId) {
      if (roomId === this.currentRoomId) return;
      this.currentRoomId = roomId;
      this._updateActiveState();
      ChatManager.clearMessages();

      try {
        const messages = await ChatAPI.getMessages(roomId);
        if (!messages || messages.length === 0) {
          ChatManager.showEmptyState();
          return;
        }
        
        // "질문: OOO 답: XXX" 형태의 문자열 파싱
        messages.forEach(msg => {
          const contentStr = msg.content || "";
          const splitText = contentStr.split("답:");
          let qText = splitText[0].replace("질문:", "").trim();
          let aText = splitText[1] ? splitText[1].trim() : "답변을 불러올 수 없습니다.";
          
          if(qText) ChatManager.addMessage(qText, "user", false);
          if(aText) ChatManager.addMessage(aText, "ai", false);
        });
      } catch (err) {
        ChatManager.showLoadError(roomId);
      }
    },

    async _handleDeleteRoom(roomId) {
      const confirmed = await ModalManager.confirm();
      if (!confirmed) return;
      
      try {
        await ChatAPI.deleteRoom(roomId);
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          ChatManager.clearMessages();
          ChatManager.showEmptyState();
        }
        this.fetchAndRenderRooms(); // 삭제 후 목록 리렌더링
        Toast.show("삭제되었습니다.");
      } catch {
        Toast.show("삭제에 실패했습니다.");
      }
    },
  };



  const ChatManager = {
    chatArea: null, messageInput: null, sendBtn: null, emptyState: null, isLoading: false,

    init() {
      this.chatArea = document.getElementById("chatArea");
      this.messageInput = document.getElementById("messageInput");
      this.sendBtn = document.getElementById("sendBtn");
      this.emptyState = document.getElementById("chatEmptyState");

      this.bindEvents();
      // this.messageInput.focus(); // 이 부분은 자동 전송 로직 뒤로 이동
    },

    bindEvents() {
      this.messageInput.addEventListener("input", () => this.handleInputChange());
      this.messageInput.addEventListener("keydown", e => this.handleKeydown(e));
      this.sendBtn.addEventListener("click", () => this.handleSendMessage());
    },

    handleInputChange() {
      this.sendBtn.disabled = !this.messageInput.value.trim() || this.isLoading;
    },

    handleKeydown(e) {
      if (e.key === "Enter" && !e.shiftKey && !this.sendBtn.disabled) {
        e.preventDefault();
        this.handleSendMessage();
      }
    },

    startNewChat() {
      SidebarManager.currentRoomId = null;
      SidebarManager._updateActiveState();
      this.clearMessages();
      this.showEmptyState();
      this.messageInput.focus();
    },

    async handleSendMessage() {
      const question = this.messageInput.value.trim();
      if (!question || this.isLoading) return;

      this.addMessage(question, "user");
      this.messageInput.value = "";
      this.handleInputChange();

      this.isLoading = true;
      this.sendBtn.disabled = true;
      this.showTypingIndicator();

      let answer = "";
      try {
        answer = await ChatAPI.askQuestion(question);
        this.hideTypingIndicator();
        this.addMessage(answer, "ai");

        if (!SidebarManager.currentRoomId) {
          const newRoom = await ChatAPI.createRoom(question, answer);
          SidebarManager.currentRoomId = newRoom.id;
          SidebarManager.fetchAndRenderRooms(); 
        } else {
          await ChatAPI.updateRoom(SidebarManager.currentRoomId, question, answer);
        }
        
      } catch (error) {
        this.hideTypingIndicator();
        this.addMessage(error.message || "오류가 발생했습니다. 다시 시도해주세요.", "ai");
      } finally {
        this.isLoading = false;
        this.handleInputChange();
        this.messageInput.focus();
      }
    },

    addMessage(text, type, animate = true) {
      this.emptyState.classList.add("hidden");
      const messageEl = document.createElement("div");
      messageEl.className = `message message--${type}`;
      if (!animate) messageEl.style.animation = "none";
      const bubbleEl = document.createElement("div");
      bubbleEl.className = "message__bubble";
      bubbleEl.innerHTML = text.replace(/\n/g, "<br>");
      messageEl.appendChild(bubbleEl);
      this.chatArea.appendChild(messageEl);
      this.scrollToBottom();
    },

    clearMessages() {
      Array.from(this.chatArea.children).forEach(child => {
        if (child.id !== "chatEmptyState") child.remove();
      });
    },

    showEmptyState() { this.emptyState.classList.remove("hidden"); },

    showLoadError(roomId) {
      const el = document.createElement("div");
      el.className = "message message--ai";
      el.innerHTML = `
        <div class="message__bubble">
          내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          <br><br>
          <button onclick="this.closest('.message').remove(); SidebarManager.loadRoom('${roomId}')"
                  style="background:var(--primary-1);color:#fff;border:none;padding:6px 16px;border-radius:50px;cursor:pointer;font-size:0.85rem;">
            재시도
          </button>
        </div>`;
      this.chatArea.appendChild(el);
      this.scrollToBottom();
    },

    showTypingIndicator() {
      const el = document.createElement("div");
      el.className = "typing-indicator";
      el.id = "typingIndicator";
      el.innerHTML = "<span></span><span></span><span></span>";
      this.chatArea.appendChild(el);
      this.scrollToBottom();
    },

    hideTypingIndicator() { document.getElementById("typingIndicator")?.remove(); },

    scrollToBottom() { this.chatArea.scrollTop = this.chatArea.scrollHeight; },
  };

  //초기화
  document.addEventListener("DOMContentLoaded", () => {
    Toast.init();
    ModalManager.init();
    SidebarManager.init();
    ChatManager.init();


    // 1. URLSearchParams를 사용하여 URL에서 'q' 파라미터 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');

    // 2. 질문이 존재하는지 확인 (비어있거나 null이면 무시)
    if (initialQuery && initialQuery.trim()) {
      // 3. 디코딩된 질문 텍스트를 입력창에 넣기
      ChatManager.messageInput.value = decodeURIComponent(initialQuery);
      
      // 4. 입력값 변경 핸들러를 호출하여 전송 버튼 활성화 상태 업데이트
      ChatManager.handleInputChange();
      
      // 5. 전송 버튼이 활성화되어 있다면 (공백이 아니라는 뜻), 자동으로 메시지 전송 로직 실행
      if (!ChatManager.sendBtn.disabled) {
        ChatManager.handleSendMessage();
      }
    } else {
      // URL 파라미터가 없을 때만 입력창에 포커스 (사용자 경험 개선)
      ChatManager.messageInput.focus();
    }
  });

  // 전역 범위에서 접근할 수 있도록 SidebarManager 노출 (loadError 재시도 버튼용)
  window.SidebarManager = SidebarManager;

})();