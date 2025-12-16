/**
 * D-ask 메인 페이지 스크립트
 * - 페이지 네비게이션
 * - 슬라이더 기능
 * - FAQ 아코디언
 * - 스크롤 스냅 기능
 * - API 연동 준비
 */

// ===== 설정 =====
const CONFIG = {
  // 페이지 경로 (실제 환경에 맞게 수정)
  CHAT_PAGE_URL: "../page1/index.html",
  CALENDAR_PAGE_URL: "../calendar/index.html",

  // API 엔드포인트 (백엔드 연동 시 수정)
  API: {
    BASE_URL: "/api",
    FAQ_ENDPOINT: "/faq",
  },
}

// ===== FAQ 데이터 (API 연동 전 임시 데이터) =====
const FAQ_DATA = [
  {
    id: 1,
    question: "ai가 학교 문서도 요약해서 사용자에게 알려주나요?",
    answer:
      "네. ai가 모든 학교 문서를 학습하고 있어, 사용자가 문서의 내용을 궁금해하면 문서를 요약해 사용자에게 보여줍니다.",
  },
  {
    id: 2,
    question: "ai가 학교 문서도 요약해서 사용자에게 알려주나요?",
    answer:
      "네. ai가 모든 학교 문서를 학습하고 있어, 사용자가 문서의 내용을 궁금해하면 문서를 요약해 사용자에게 보여줍니다.",
  },
  {
    id: 3,
    question: "ai가 학교 문서도 요약해서 사용자에게 알려주나요?",
    answer:
      "네. ai가 모든 학교 문서를 학습하고 있어, 사용자가 문서의 내용을 궁금해하면 문서를 요약해 사용자에게 보여줍니다.",
  },
]

// ===== API 서비스 =====
const APIService = {
  async getFAQList() {
    // API 연동 시 아래 주석 해제
    /*
    try {
      const response = await fetch(`${CONFIG.API.BASE_URL}${CONFIG.API.FAQ_ENDPOINT}`);
      if (!response.ok) throw new Error('FAQ 로딩 실패');
      const data = await response.json();
      return data.faqs || [];
    } catch (error) {
      console.error('FAQ API 오류:', error);
      return FAQ_DATA;
    }
    */
    return Promise.resolve(FAQ_DATA)
  },
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
    // wheel 이벤트로 Hero 섹션에서의 스크롤 감지
    window.addEventListener("wheel", (e) => this.handleWheel(e), { passive: false })

    // 터치 디바이스 지원
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

    // 스크롤 위치 감지 - Hero로 돌아오면 스냅 리셋
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
    // Hero 섹션에서 아래로 스크롤할 때만 스냅
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

// ===== 슬라이더 컨트롤러 =====
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

// ===== FAQ 컨트롤러 =====
const FAQController = {
  container: null,

  async init() {
    this.container = document.getElementById("faqList")
    if (!this.container) return

    const faqs = await APIService.getFAQList()
    this.render(faqs)
    this.bindEvents()
  },

  render(faqs) {
    this.container.innerHTML = faqs
      .map(
        (faq) => `
          <div class="faq-item" data-id="${faq.id}">
            <button class="faq-question">${faq.question}</button>
            <div class="faq-answer">
              <div class="faq-answer-inner">${faq.answer}</div>
            </div>
          </div>
        `,
      )
      .join("")
  },

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const questionBtn = e.target.closest(".faq-question")
      if (!questionBtn) return

      const faqItem = questionBtn.closest(".faq-item")
      const answer = faqItem.querySelector(".faq-answer")

      this.container.querySelectorAll(".faq-answer.open").forEach((openAnswer) => {
        if (openAnswer !== answer) {
          openAnswer.classList.remove("open")
        }
      })

      answer.classList.toggle("open")
    })
  },
}

// ===== 네비게이션 컨트롤러 =====
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

// ===== 초기화 =====
document.addEventListener("DOMContentLoaded", () => {
  ScrollSnapController.init()
  NavigationController.init()
  SliderController.init()
  FAQController.init()
})
