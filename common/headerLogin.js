// common.js 

document.addEventListener('DOMContentLoaded', () => {
    checkLoginUsingExistingAPI();
});

async function checkLoginUsingExistingAPI() {
    const authArea = document.getElementById("authArea");

    // [중요] 현재 페이지에 헤더(authArea)가 없으면 코드를 멈춰서 에러 방지!
    if (!authArea) return; 

    try {
        const response = await fetch('/api/user/my-info', { method: 'GET' });

        if (response.ok) {
            authArea.innerHTML = `<button type="button" class="btn-login" id="logoutBtn">로그아웃</button>`;
            
            document.getElementById("logoutBtn").addEventListener("click", () => {
                alert("로그아웃 되었습니다.");
                location.reload(); // 새로고침해서 다시 로그인 버튼으로 되돌림
            });
        }
    } catch (error) {
        console.log("로그인 안 된 상태");
    }
}