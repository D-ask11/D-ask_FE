const API_BASE_URL = 'https://d-ask.duckdns.org';

checkLoginCallback();

document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google');
    const kakaoBtn = document.getElementById('btn-kakao');
    const naverBtn = document.getElementById('btn-naver');

    if (googleBtn) googleBtn.addEventListener('click', () => loginProcess('google'));
    if (kakaoBtn) kakaoBtn.addEventListener('click', () => loginProcess('kakao'));
    if (naverBtn) naverBtn.addEventListener('click', () => loginProcess('naver'));

    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    updateAuthUI();
});


function loginProcess(socialKind) {
    console.log(`${socialKind} 로그인을 시도합니다...`);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `${API_BASE_URL}/api/auth/login?provider=${socialKind}`;
    document.body.appendChild(form);
    form.submit();
}


function checkLoginCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const provider = urlParams.get('provider');

    if (accessToken) {
        // 데이터 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('provider', provider);

        console.log("로그인 정보 저장 완료!");
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
        window.location.href = '/main.html';
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