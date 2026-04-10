const CONFIG = {
  CHAT_PAGE_URL: "../page1/index.html",
  CALENDAR_PAGE_URL: "../calendar/index.html",
}

// ---------------------------------------------------------
// [추가] 1. 로그인 콜백 및 상태 관리 로직 (최상단 배치)
// ---------------------------------------------------------

/**
 * 주소창의 쿼리 파라미터에서 토큰을 추출하여 로컬 스토리지에 저장
 */
function checkLoginCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');
  const provider = urlParams.get('provider');

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('provider', provider);

    // 주소창에서 토큰 정보 제거 (미관 및 보안)
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    
    console.log("로그인 성공: 토큰이 저장되었습니다.");
  }
}

/**
 * 로그인 상태에 따라 헤더 버튼 UI 업데이트
 */
function updateAuthUI() {
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
}

// 즉시 실행하여 토큰 가로채기
checkLoginCallback();

// ---------------------------------------------------------
// 기존 컨트롤러 로직 (스크롤, 슬라이더, FAQ 등)
// ---------------------------------------------------------

const ScrollSnapController = {
  heroSection: null,
  guideSection: null,
  isSnapping: false,
  hasSnapped: false,

  init() {
    this.heroSection = document.getElementById("hero")
    this.guideSection = document.getElementById("guide")
    if (!this.heroSection || !this.guideSection) return
    this.bindEvents()
  },

  bindEvents() {
    window.addEventListener("wheel", (e) => this.handleWheel(e), { passive: false })
    let touchStartY = 0
    window.addEventListener("touchstart", (e) => { touchStartY = e.touches[0].clientY }, { passive: true })
    window.addEventListener("touchmove", (e) => {
      const touchY = e.touches[0].clientY
      const deltaY = touchStartY - touchY
      if (this.isInHeroSection() && deltaY > 30 && !this.hasSnapped) {
        this.snapToGuide()
      }
    }, { passive: true })
    window.addEventListener("scroll", () => {
      if (window.scrollY < this.heroSection.offsetHeight * 0.3) {
        this.hasSnapped = false
      }
    }, { passive: true })
  },

  handleWheel(e) {
    if (this.isInHeroSection() && e.deltaY > 0 && !this.isSnapping && !this.hasSnapped) {
      e.preventDefault()
      this.snapToGuide()
    }
  },

  isInHeroSection() {
    return window.scrollY < this.heroSection.offsetHeight * 0.3
  },

  snapToGuide() {
    if (this.isSnapping) return
    this.isSnapping = true
    this.hasSnapped = true
    this.guideSection.scrollIntoView({ behavior: "smooth" })
    setTimeout(() => { this.isSnapping = false }, 800)
  },
}

const SliderController = {
  currentIndex: 0,
  totalSlides: 3,

  init() {
    this.track = document.getElementById("sliderTrack")
    this.dots = document.querySelectorAll(".slider-pagination .dot")
    this.tabs = document.querySelectorAll(".tab-btn")
    this.prevBtn = document.querySelector(".slider-prev")
    this.nextBtn = document.querySelector(".slider-next")
    this.bindEvents()
  },

  bindEvents() {
    this.prevBtn?.addEventListener("click", () => this.prev())
    this.nextBtn?.addEventListener("click", () => this.next())
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => this.goTo(index))
    })
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabIndex = Number.parseInt(tab.dataset.tab, 10)
        this.goTo(tabIndex)
      })
    })
  },

  goTo(index) {
    this.currentIndex = index
    this.updateUI()
  },

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides
    this.updateUI()
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.totalSlides
    this.updateUI()
  },

  updateUI() {
    if (this.track) {
      this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`
    }
    this.dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === this.currentIndex)
    })
    this.tabs.forEach((tab) => {
      const tabIndex = Number.parseInt(tab.dataset.tab, 10)
      tab.classList.toggle("active", tabIndex === this.currentIndex)
    })
  },
}

const FAQController = {
  init() {
    const container = document.getElementById("faqList")
    if (!container) return
    container.addEventListener("click", (e) => {
      const questionBtn = e.target.closest(".faq-question")
      if (!questionBtn) return
      const faqItem = questionBtn.closest(".faq-item")
      const answer = faqItem.querySelector(".faq-answer")
      container.querySelectorAll(".faq-answer.open").forEach((openAnswer) => {
        if (openAnswer !== answer) openAnswer.classList.remove("open")
      })
      answer.classList.toggle("open")
    })
  },
}

const NavigationController = {
  init() {
    this.bindSearchBox()
    this.bindScrollDown()
    this.bindCalendarButtons()
  },

  bindSearchBox() {
    const searchBox = document.getElementById("searchBox")
    searchBox?.addEventListener("click", () => {
      window.location.href = CONFIG.CHAT_PAGE_URL
    })
  },

  bindScrollDown() {
    const scrollDownBtn = document.getElementById("scrollDownBtn")
    scrollDownBtn?.addEventListener("click", () => {
      ScrollSnapController.snapToGuide()
    })
  },

  bindCalendarButtons() {
    const calendarBtn = document.getElementById("calendarBtn")
    const calendarLinkBtn = document.getElementById("calendarLinkBtn")
    const goToCalendar = () => { window.location.href = CONFIG.CALENDAR_PAGE_URL }
    calendarBtn?.addEventListener("click", goToCalendar)
    calendarLinkBtn?.addEventListener("click", goToCalendar)
  },
}

// ---------------------------------------------------------
// 실행 및 이벤트 바인딩
// ---------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // 초기 UI 업데이트
  updateAuthUI();

  // 로그아웃 버튼 바인딩
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('provider');
      alert("로그아웃 되었습니다.");
      location.reload(); // 현재 페이지 새로고침하여 UI 반영
    });
  }

  // 기존 컨트롤러 초기화
  ScrollSnapController.init()
  NavigationController.init()
  SliderController.init()
  FAQController.init()
})