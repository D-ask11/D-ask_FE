// 현재 날짜 정보
const currentDate = new Date()
let currentYear = currentDate.getFullYear()
let currentMonth = currentDate.getMonth() + 1
let selectedDate = null

// 일정 데이터 저장
let scheduleData = []

// DOM 요소
const daysContainer = document.getElementById("daysContainer")
const currentMonthEl = document.getElementById("currentMonth")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const eventPanel = document.getElementById("eventPanel")
const eventDate = document.getElementById("eventDate")
const eventList = document.getElementById("eventList")

async function fetchSchedule(year, month) {
  // API 명세서: GET Dask-AI/calendar?year=값&month=값
  const API_URL = `Dask-AI/calendar?year=${year}&month=${month}`

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    // 500 Internal Server Error 처리
    if (response.status === 500) {
      console.error("서버 에러가 발생했습니다. 백엔드에게 문의하세요.")
      return []
    }

    // 200 OK - 정상 응답 (빈 배열도 200으로 반환됨)
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }

    // 기타 에러
    console.error("API 요청 실패:", response.status)
    return []
  } catch (error) {
    console.error("API 연결 실패:", error)
    return []
  }
}

async function renderCalendar() {
  // 현재 월 표시
  currentMonthEl.textContent = `${currentYear}년 ${currentMonth}월`

  // 해당 월의 첫날과 마지막 날 (API 호출 전에 먼저 계산)
  const firstDay = new Date(currentYear, currentMonth - 1, 1)
  const lastDay = new Date(currentYear, currentMonth, 0)

  // 이전 달의 마지막 날
  const prevLastDay = new Date(currentYear, currentMonth - 1, 0)

  // 첫 번째 날의 요일 (0: 일요일)
  const startDayOfWeek = firstDay.getDay()

  // 이번 달의 총 일수
  const totalDays = lastDay.getDate()

  // 일정 데이터 가져오기 (실패해도 빈 배열로 처리)
  try {
    scheduleData = await fetchSchedule(currentYear, currentMonth)
  } catch (error) {
    console.error("일정 데이터 로드 실패:", error)
    scheduleData = []
  }

  let daysHTML = ""

  // 이전 달의 날짜들
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevLastDay.getDate() - i
    daysHTML += `<div class="day other-month">${day}</div>`
  }

  // 이번 달의 날짜들
  const today = new Date()
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay()

    const classes = ["day"]

    // 오늘 날짜 체크
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1 && day === today.getDate()) {
      classes.push("today")
    }

    // 일정 있는 날 체크 - API 응답에서 title과 date 확인
    const hasEvent = scheduleData.some((event) => event.date === dateStr && event.title)
    if (hasEvent) {
      classes.push("has-event")
    }

    // 요일 색상
    if (dayOfWeek === 0) classes.push("sunday")
    if (dayOfWeek === 6) classes.push("saturday")

    daysHTML += `<div class="${classes.join(" ")}" data-date="${dateStr}" onclick="selectDate('${dateStr}', ${day})">${day}</div>`
  }

  // 다음 달의 날짜들
  const remainingDays = 42 - (startDayOfWeek + totalDays)
  for (let day = 1; day <= remainingDays; day++) {
    daysHTML += `<div class="day other-month">${day}</div>`
  }

  daysContainer.innerHTML = daysHTML
}

// 날짜 선택
function selectDate(dateStr, day) {
  // 이전 선택 제거
  document.querySelectorAll(".day.selected").forEach((el) => {
    el.classList.remove("selected")
  })

  // 새 선택 추가
  const selectedEl = document.querySelector(`[data-date="${dateStr}"]`)
  if (selectedEl) {
    selectedEl.classList.add("selected")
  }

  selectedDate = dateStr

  // 이벤트 표시
  const [year, month, dayNum] = dateStr.split("-")
  eventDate.textContent = `${year}년 ${Number.parseInt(month)}월 ${Number.parseInt(dayNum)}일 일정`

  // API 응답에서 해당 날짜의 일정 필터링
  const dayEvents = scheduleData.filter((event) => event.date === dateStr && event.title)

  if (dayEvents.length > 0) {
    eventList.innerHTML = dayEvents.map((event) => `<div class="event-item">- ${event.title}</div>`).join("")
  } else {
    eventList.innerHTML = '<p class="no-event">이 날은 일정이 없습니다.</p>'
  }
}

// 이전 달
prevBtn.addEventListener("click", () => {
  currentMonth--
  if (currentMonth < 1) {
    currentMonth = 12
    currentYear--
  }
  renderCalendar()
})

// 다음 달
nextBtn.addEventListener("click", () => {
  currentMonth++
  if (currentMonth > 12) {
    currentMonth = 1
    currentYear++
  }
  renderCalendar()
})

renderCalendar()
