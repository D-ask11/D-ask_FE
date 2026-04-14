const currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth() + 1;
let scheduleData = [];

const daysContainer = document.getElementById("daysContainer");
const currentMonthEl = document.getElementById("currentMonth");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const eventDate = document.getElementById("eventDate");
const eventList = document.getElementById("eventList");


// YYYYMMDD -> YYYY-MM-DD 
const apiDateToISO = (dateStr) => {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
};

// 일정가져오기
const fetchSchedule = async (year, month) => {
  try {
    const response = await fetch(`https://d-ask.duckdns.org/api/calendar?year=${year}&month=${month}`);
    if (!response.ok) return [];

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("API 오류", error);
    return [];
  }
};


// 달력 칸 그리기 로직 (빈 칸 채우고 날짜 박아넣는 부분)
const generateDaysHTML = (year, month, scheduleData) => {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const prevLastDay = new Date(year, month - 1, 0);

  const startDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();
  let daysHTML = "";

  // 저번 달 남은 칸 채우기
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    daysHTML += `<div class="day other-month">${prevLastDay.getDate() - i}</div>`;
  }

  const today = new Date();

  // 이번 달 날짜들 쭉 채우기
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = new Date(year, month - 1, day).getDay();
    const classes = ["day"];

    // 오늘 날짜면 체크
    if (year === today.getFullYear() && month === today.getMonth() + 1 && day === today.getDate()) {
      classes.push("today");
    }

    // 일정이 있으면 점
    if (scheduleData.some(e => apiDateToISO(e.date) === dateStr && e.title)) {
      classes.push("has-event");
    }

    if (dayOfWeek === 0) classes.push("sunday");
    if (dayOfWeek === 6) classes.push("saturday");

    daysHTML += `<div class="${classes.join(" ")}" data-date="${dateStr}">${day}</div>`;
  }

  // 다음 달 남은 칸 채우기 (총 42칸 고정)
  const remaining = 42 - (startDayOfWeek + totalDays);
  for (let i = 1; i <= remaining; i++) {
    daysHTML += `<div class="day other-month">${i}</div>`;
  }

  return daysHTML;
};


const renderCalendar = async () => {
  currentMonthEl.textContent = `${currentYear}년 ${currentMonth}월`;

  daysContainer.innerHTML = generateDaysHTML(currentYear, currentMonth, []);
  scheduleData = await fetchSchedule(currentYear, currentMonth);
  daysContainer.innerHTML = generateDaysHTML(currentYear, currentMonth, scheduleData);
};


// 일정있는 날 클릭시 하단에 일정 목록 띄워줌
const selectDate = (dateStr) => {
  document.querySelectorAll(".day.selected").forEach(el => el.classList.remove("selected"));

  const target = document.querySelector(`[data-date="${dateStr}"]`);
  if (target) target.classList.add("selected");

  const [y, m, d] = dateStr.split("-");
  eventDate.textContent = `${y}년 ${Number(m)}월 ${Number(d)}일 일정`;

  const events = scheduleData.filter(e => apiDateToISO(e.date) === dateStr && e.title);

  if (events.length > 0) {
    eventList.innerHTML = events.map(e => `<div class="event-item">- ${e.title}</div>`).join("");
  } else {
    eventList.innerHTML = `<p class="no-event">이 날은 일정이 없습니다.</p>`;
  }
};


// 클릭 이벤트리스너 모음
daysContainer.addEventListener("click", e => {
  const target = e.target.closest(".day[data-date]");
  if (!target) return;
  selectDate(target.dataset.date);
});

prevBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 1) {
    currentMonth = 12;
    currentYear--;
  }
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 12) {
    currentMonth = 1;
    currentYear++;
  }
  renderCalendar();
});
renderCalendar();



// 로그인상태 확인 후 헤더 버튼 없애거나 함
const updateAuthUI = () => {
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
};

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('provider');
      
      alert("로그아웃 되었습니다.");
      location.href = '../index.html';
    });
  }
});