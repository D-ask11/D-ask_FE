// ===============================
// 현재 날짜 정보
// ===============================
const currentDate = new Date()
let currentYear = currentDate.getFullYear()
let currentMonth = currentDate.getMonth() + 1
let selectedDate = null

// ===============================
// 일정 데이터
// ===============================
let scheduleData = []

// ===============================
// DOM 요소
// ===============================
const daysContainer = document.getElementById("daysContainer")
const currentMonthEl = document.getElementById("currentMonth")
const prevBtn = document.getElementById("prevBtn")
const nextBtn = document.getElementById("nextBtn")
const eventDate = document.getElementById("eventDate")
const eventList = document.getElementById("eventList")

// ===============================
// 일정 API 호출
// ===============================
async function fetchSchedule(year, month) {
  const API_URL = `http://10.108.50.143:8000/calendar?year=${year}&month=${month}`

  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      console.error("API 요청 실패:", response.status)
      return []
    }

    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error("API 연결 실패:", error)
    return []
  }
}

// ===============================
// 달력 HTML 생성
// ===============================
function generateDaysHTML(year, month, scheduleData) {
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const prevLastDay = new Date(year, month - 1, 0)

  const startDayOfWeek = firstDay.getDay()
  const totalDays = lastDay.getDate()

  let daysHTML = ""

  // 이전 달
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    daysHTML += `<div class="day other-month">${prevLastDay.getDate() - i}</div>`
  }

  // 이번 달
  const today = new Date()

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const dayOfWeek = new Date(year, month - 1, day).getDay()

    const classes = ["day"]

    if (
      year === today.getFullYear() &&
      month === today.getMonth() + 1 &&
      day === today.getDate()
    ) {
      classes.push("today")
    }

    if (scheduleData.some(e => e.date === dateStr && e.title)) {
      classes.push("has-event")
    }

    if (dayOfWeek === 0) classes.push("sunday")
    if (dayOfWeek === 6) classes.push("saturday")

    daysHTML += `
      <div class="${classes.join(" ")}"
           data-date="${dateStr}"
           onclick="selectDate('${dateStr}')">
        ${day}
      </div>
    `
  }

  // 다음 달
  const remaining = 42 - (startDayOfWeek + totalDays)
  for (let i = 1; i <= remaining; i++) {
    daysHTML += `<div class="day other-month">${i}</div>`
  }

  return daysHTML
}

// ===============================
// 달력 렌더링
// ===============================
async function renderCalendar() {
  currentMonthEl.textContent = `${currentYear}년 ${currentMonth}월`

  // 날짜는 항상 먼저 그림
  daysContainer.innerHTML = generateDaysHTML(currentYear, currentMonth, [])

  // 일정 로드
  scheduleData = await fetchSchedule(currentYear, currentMonth)

  // 일정 있으면 다시 렌더
  if (scheduleData.length > 0) {
    daysContainer.innerHTML = generateDaysHTML(currentYear, currentMonth, scheduleData)
  }
}

// ===============================
// 날짜 선택
// ===============================
function selectDate(dateStr) {
  document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"))

  const target = document.querySelector(`[data-date="${dateStr}"]`)
  if (target) target.classList.add("selected")

  const [y, m, d] = dateStr.split("-")
  eventDate.textContent = `${y}년 ${Number(m)}월 ${Number(d)}일 일정`

  const events = scheduleData.filter(e => e.date === dateStr && e.title)

  if (events.length > 0) {
    eventList.innerHTML = events
      .map(e => `<div class="event-item">- ${e.title}</div>`)
      .join("")
  } else {
    eventList.innerHTML = `<p class="no-event">이 날은 일정이 없습니다.</p>`
  }
}

// ===============================
// 이전 / 다음 달
// ===============================
prevBtn.addEventListener("click", () => {
  currentMonth--
  if (currentMonth < 1) {
    currentMonth = 12
    currentYear--
  }
  renderCalendar()
})

nextBtn.addEventListener("click", () => {
  currentMonth++
  if (currentMonth > 12) {
    currentMonth = 1
    currentYear++
  }
  renderCalendar()
})

// ===============================
// 초기 실행
// ===============================
renderCalendar()
