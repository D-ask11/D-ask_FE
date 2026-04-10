const API_BASE_URL = 'https://d-ask.duckdns.org';

document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google');
    const kakaoBtn = document.getElementById('btn-kakao');
    const naverBtn = document.getElementById('btn-naver');

    if (googleBtn) googleBtn.addEventListener('click', () => loginProcess('google'));
    if (kakaoBtn) kakaoBtn.addEventListener('click', () => loginProcess('kakao'));
    if (naverBtn) naverBtn.addEventListener('click', () => loginProcess('naver'));

    // OAuth 인증 후 돌아왔을 때 URL 파라미터에 토큰이 있는지 확인하는 로직 (선택 사항)
    checkLoginCallback();
});

/**
 * 1. 로그인 프로세스 시작
 * HTML Form을 생성하여 백엔드의 OAuth 엔드포인트로 POST 전송합니다.
 */
function loginProcess(socialKind) {
    console.log(`${socialKind} 로그인을 위해 백엔드로 이동합니다...`);
    
    const form = document.createElement('form');
    form.method = 'POST';
    // API 명세에 따른 경로 (Query Parameter 포함)
    form.action = `${API_BASE_URL}/api/auth/login?provider=${socialKind}`;
    
    document.body.appendChild(form);
    form.submit();
}

/**
 * 2. 회원가입 API 호출 및 자동 로그인 처리
 * 회원가입 성공 시 받은 토큰을 저장하고 메인으로 이동합니다.
 */
async function registerUser(userId, provider) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                UserID: userId, // 명세에 따라 id가 없을 경우 빈 값이나 특정 값 처리
                provider: provider 
            }) 
        });

        const data = await response.json();

        if (response.ok) {
            // 회원가입 성공 시 받은 토큰 정보를 로컬 스토리지에 저장
            saveTokens(data);
            alert("회원가입이 완료되었습니다! 메인 화면으로 이동합니다.");
            window.location.href = '/main.html'; // 메인 페이지 경로
        } else {
            alert("회원가입 실패: " + (data.message || "이미 가입된 계정일 수 있습니다."));
        }
    } catch (error) {
        console.error("회원가입 통신 에러:", error);
    }
}

/**
 * 3. 토큰 저장 유틸리티
 */
function saveTokens(data) {
    if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('provider', data.provider);
    }
}

/**
 * 4. (참고) 백엔드에서 리다이렉트 시 토큰을 받아오는 로직
 * 보통 OAuth 완료 후 백엔드가 프론트로 토큰을 넘겨줄 때 사용합니다.
 */
function checkLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
        // 토큰이 URL에 있다면 로그인 성공으로 간주하고 저장 후 메인 이동
        const authData = {
            access_token: accessToken,
            refresh_token: urlParams.get('refresh_token'),
            provider: urlParams.get('provider')
        };
        saveTokens(authData);
        window.location.href = '/main.html';
    }
}