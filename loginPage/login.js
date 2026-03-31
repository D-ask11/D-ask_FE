document.addEventListener('DOMContentLoaded', () => {
    // 버튼 연결 (id 확인: btn-google, btn-kakao, btn-naver)
    const googleBtn = document.getElementById('btn-google');
    const kakaoBtn = document.getElementById('btn-kakao');
    const naverBtn = document.getElementById('btn-naver');

    if(googleBtn) googleBtn.addEventListener('click', () => loginProcess('google'));
    if(kakaoBtn) kakaoBtn.addEventListener('click', () => loginProcess('kakao'));
    if(naverBtn) naverBtn.addEventListener('click', () => loginProcess('naver'));
});

// 전체 로그인/가입 프로세스
async function loginProcess(socialKind) {
    try {
        // 1. 먼저 로그인을 시도 (기존 유저인지 확인)
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ social_kind: socialKind })
        });

        if (!response.ok) throw new Error('로그인 서버 응답 에러');

        const data = await response.json();

        // 2. 신규 유저인 경우 (id가 없음)
        if (!data.id) {
            console.log("신규 유저입니다. 즉시 가입 절차를 시작합니다.");
            
            // 별도 페이지 이동 대신 입력창(prompt) 활용
            const newUserId = prompt("서비스에서 사용할 아이디를 입력해주세요.");
            
            if (newUserId) {
                await registerUser(newUserId); // 회원가입 함수 호출
            } else {
                alert("아이디 입력이 취소되었습니다.");
            }
            return;
        }

        // 3. 기존 유저인 경우
        console.log(`로그인 성공! ID: ${data.id}`);
        window.location.href = '/main.html';

    } catch (error) {
        console.error("오류 발생:", error);
        alert("처리에 실패했습니다.");
    }
}

/**
 * [POST] 회원가입 API (api/auth/register)
 */
async function registerUser(userId) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ UserID: userId }) // 명세서 스펙
        });

        if (response.ok) {
            const data = await response.json();
            alert("회원가입이 완료되었습니다!");
            window.location.href = '/main.html'; // 가입 후 메인으로
        } else {
            alert("회원가입 실패. 다시 시도해주세요.");
        }
    } catch (error) {
        console.error("회원가입 에러:", error);
    }
}