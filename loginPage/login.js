const API_BASE_URL = 'https://d-ask.duckdns.org';

checkLoginCallback();

document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google');
    const kakaoBtn = document.getElementById('btn-kakao');
    const naverBtn = document.getElementById('btn-naver');

    if (googleBtn) googleBtn.addEventListener('click', () => loginProcess('google'));
    if (kakaoBtn) kakaoBtn.addEventListener('click', () => loginProcess('kakao'));
    if (naverBtn) naverBtn.addEventListener('click', () => loginProcess('naver'));
<<<<<<< HEAD
    checkLoginCallback();
=======

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    updateAuthUI();
>>>>>>> dev
});


function loginProcess(socialKind) {
    console.log(`${socialKind} 로그인을 시도합니다...`);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${API_BASE_URL}/api/auth/login?provider=${socialKind}`;
    document.body.appendChild(form);
    form.submit();
}

<<<<<<< HEAD

// 회원가입 API 호출 및 자동 로그인 처리/ 회원가입 성공 시 받은 토큰을 저장하고 메인으로 이동
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

function saveTokens(data) {
    if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('provider', data.provider);
    }
}


//마지막에 토큰을 받아옴.
=======

>>>>>>> dev
function checkLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const provider = urlParams.get('provider');

    if (accessToken) {
<<<<<<< HEAD
        // 토큰이 URL에 있다면 로그인 성공으로 간주하고 저장 후 메인 이동
        const authData = {
            access_token: accessToken,
            refresh_token: urlParams.get('refresh_token'),
            provider: urlParams.get('provider')
        };
        saveTokens(authData);
        window.location.href = '/index.html';
=======
        // 데이터 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('provider', provider);

        console.log("로그인 정보 저장 완료!");
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        window.location.href = '/main.html';
>>>>>>> dev
    }
}

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

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('provider');
    alert("로그아웃 되었습니다.");
    window.location.href = '/'; // 메인으로 이동
}