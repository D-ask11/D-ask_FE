const CONFIG = {
  CHAT_PAGE_URL: "../page1/index.html",
  CALENDAR_PAGE_URL: "../calendar/index.html",
}


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
    window.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.touches[0].clientY
      },
      { passive: true },
    )

    window.addEventListener(
      "touchmove",
      (e) => {
        const touchY = e.touches[0].clientY
        const deltaY = touchStartY - touchY

        if (this.isInHeroSection() && deltaY > 30 && !this.hasSnapped) {
          this.snapToGuide()
        }
      },
      { passive: true },
    )

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY < this.heroSection.offsetHeight * 0.3) {
          this.hasSnapped = false
        }
      },
      { passive: true },
    )
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

    setTimeout(() => {
      this.isSnapping = false
    }, 800)
  },
}

// 슬라이더..
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
        if (openAnswer !== answer) {
          openAnswer.classList.remove("open")
        }
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

    const goToCalendar = () => {
      window.location.href = CONFIG.CALENDAR_PAGE_URL
    }

    calendarBtn?.addEventListener("click", goToCalendar)
    calendarLinkBtn?.addEventListener("click", goToCalendar)
  },
}

document.addEventListener("DOMContentLoaded", () => {
  ScrollSnapController.init()
  NavigationController.init()
  SliderController.init()
  FAQController.init()
})


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