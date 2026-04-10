;(() => {
  const CONFIG = {
  CHAT_URL: "https://d-ask.duckdns.org/",
HISTORY_URL: "https://d-ask.duckdns.org/", 
    
    USER_ID: "testUser", 
    ACCESS_TOKEN: "your_access_token_here", 
    REFRESH_TOKEN: "your_refresh_token_here",
    PROVIDER: "google", 
  };

  const getAuthHeaders = () => ({
    "Authorization": `Bearer ${CONFIG.ACCESS_TOKEN}, ${CONFIG.REFRESH_TOKEN}`,
    "Content-Type": "application/json"
  });

  const ChatAPI = {
    async askQuestion(question) {
      const res = await fetch(`${CONFIG.CHAT_URL}/ai/qna`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${CONFIG.ACCESS_TOKEN}`, 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          question: question,
          user_id: CONFIG.USER_ID 
        }),
      });

      let data = {};
      try { data = await res.json(); } 
      catch (err) { throw new Error(`서버 응답 오류 (상태 코드: ${res.status})`); }

      if (res.ok) return data.answer; 
      if (data.message) throw new Error(data.message); 
      
      throw new Error(`알 수 없는 API 에러 (${res.status})`);
    },

    // 2. 채팅 목록 조회 (GET /api/chat/read_chat)
    async getRoomList() {
      const res = await fetch(`${CONFIG.HISTORY_URL}/api/chat/read_chat?provider=${CONFIG.PROVIDER}`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      if (res.status === 500) throw new Error("서버 에러, 백엔드에게 문의하세요.");
      if (!res.ok) throw new Error("채팅 목록 조회 실패");
      return await res.json();
    },

    // 3. 대화내용 조회 (GET /api/chat/read_message) 
    async getMessages(roomId) {
      const res = await fetch(`${CONFIG.HISTORY_URL}/api/chat/read_message?id=${roomId}`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      if (res.status === 500) throw new Error("서버 에러, 백엔드에게 문의하세요.");
      if (!res.ok) throw new Error("대화 내역 조회 실패");
      return await res.json();
    },

    // 4. 새 채팅 생성 (POST /api/chat/create)
    async createRoom() {
      const res = await fetch(`${CONFIG.HISTORY_URL}/api/chat/create?provider=${CONFIG.PROVIDER}`, { 
        method: "POST",
        headers: getAuthHeaders()
      });
      if (res.status === 500) throw new Error("서버 에러, 백엔드에게 문의하세요.");
      if (!res.ok) throw new Error("채팅방 생성 실패");
      return await res.json(); 
    },

    // 5. 채팅 업데이트 (POST /api/chat/update)
    async updateRoom(roomId, message, role) {
      const res = await fetch(`${CONFIG.HISTORY_URL}/api/chat/update/${roomId}?provider=${CONFIG.PROVIDER}`, { 
        method: "POST", 
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: message, role: role }),
      });
      if (res.status === 500) throw new Error("서버 에러, 백엔드에게 문의하세요.");
      if (!res.ok) throw new Error("채팅 기록 저장 실패");
      return await res.json(); 
    },

    // 6. 채팅 삭제 (DELETE /api/chat/delete)
    async deleteRoom(roomId) {
      const res = await fetch(`${CONFIG.HISTORY_URL}/api/chat/delete/${roomId}?provider=${CONFIG.PROVIDER}`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (res.status === 500) throw new Error("서버 에러, 백엔드에게 문의하세요.");
      if (!res.ok) throw new Error("삭제 실패");
    },
  };

  // --- UI 컴포넌트 관리 ---
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
      this.closeBtn.addEventListener("click", (e) => { e.stopPropagation(); this.collapse(); });
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

    async fetchAndRenderRooms() {
      try {
        const rooms = await ChatAPI.getRoomList();
        this.renderRoomList(rooms);
      } catch (err) {
        this.roomList.innerHTML = `<li style="padding:12px;color:#ff8080;font-size:0.8rem;text-align:center;">${err.message}</li>`;
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

      li.innerHTML = `
        <span class="sidebar__room-title">${room.title}</span>
        <button class="sidebar__delete-btn" title="대화 삭제"><i class="fa-regular fa-trash-can"></i></button>
      `;

      li.addEventListener("click", e => {
        if (!e.target.closest(".sidebar__delete-btn")) this.loadRoom(room.id);
      });
      
      li.querySelector(".sidebar__delete-btn").addEventListener("click", e => {
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
        
        messages.forEach(msg => {
          if(msg.role) {
             ChatManager.addMessage(msg.content || msg.message, msg.role === 'user' ? 'user' : 'ai', false);
          } else {
            const splitText = (msg.content || msg.message || "").split("답:");
            const qText = splitText[0].replace("질문:", "").trim();
            const aText = splitText[1] ? splitText[1].trim() : "답변을 불러올 수 없습니다.";
            
            if(qText) ChatManager.addMessage(qText, "user", false);
            if(aText) ChatManager.addMessage(aText, "ai", false);
          }
        });
      } catch (err) {
        ChatManager.showLoadError(roomId);
      }
    },

    async _handleDeleteRoom(roomId) {
      if (!(await ModalManager.confirm())) return;
      
      try {
        await ChatAPI.deleteRoom(roomId);
        if (this.currentRoomId === roomId) {
          this.currentRoomId = null;
          ChatManager.clearMessages();
          ChatManager.showEmptyState();
        }
        this.fetchAndRenderRooms(); 
        Toast.show("삭제되었습니다.");
      } catch(err) {
        Toast.show(err.message || "삭제에 실패했습니다.");
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

      this.messageInput.addEventListener("input", () => this.handleInputChange());
      this.messageInput.addEventListener("keydown", e => {
        if (e.key === "Enter" && !e.shiftKey && !this.sendBtn.disabled) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
      this.sendBtn.addEventListener("click", () => this.handleSendMessage());
    },

    handleInputChange() {
      this.sendBtn.disabled = !this.messageInput.value.trim() || this.isLoading;
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

      try {
        const answer = await ChatAPI.askQuestion(question);
        this.hideTypingIndicator();
        this.addMessage(answer, "ai");

        if (!SidebarManager.currentRoomId) {
          const newRoom = await ChatAPI.createRoom(); 
          SidebarManager.currentRoomId = newRoom.id;
        } 
        
        await ChatAPI.updateRoom(SidebarManager.currentRoomId, question, "user");
        await ChatAPI.updateRoom(SidebarManager.currentRoomId, answer, "assistant");
        
        SidebarManager.fetchAndRenderRooms(); 
        
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
      
      messageEl.innerHTML = `<div class="message__bubble">${text.replace(/\n/g, "<br>")}</div>`;
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
          내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.<br><br>
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

  document.addEventListener("DOMContentLoaded", () => {
    Toast.init();
    ModalManager.init();
    SidebarManager.init();
    ChatManager.init();

    const initialQuery = new URLSearchParams(window.location.search).get('q');
    if (initialQuery && initialQuery.trim()) {
      ChatManager.messageInput.value = decodeURIComponent(initialQuery);
      ChatManager.handleInputChange();
      if (!ChatManager.sendBtn.disabled) ChatManager.handleSendMessage();
    } else {
      ChatManager.messageInput.focus();
    }
  });

  window.SidebarManager = SidebarManager;
})();

