document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('btn-google');
    const kakaoBtn = document.getElementById('btn-kakao');
    const naverBtn = document.getElementById('btn-naver');

    if(googleBtn) googleBtn.addEventListener('click', () => loginProcess('google'));
    if(kakaoBtn) kakaoBtn.addEventListener('click', () => loginProcess('kakao'));
    if(naverBtn) naverBtn.addEventListener('click', () => loginProcess('naver'));
});

async function loginProcess(socialKind) {
    try {
        /* [수정] 명세서상 Query Parameter로 되어 있으므로 URL 뒤에 붙임 
           만약 POST Body 형식을 써야 한다면 이전처럼 JSON.stringify 사용
        */
        const response = await fetch(`/api/auth/login?provider=${socialKind}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('로그인 서버 응답 에러');

        const data = await response.json();

        /* [수정] 명세서에 따르면 신규 유저일 경우 ID 필드가 비어있음.
           access_token 존재 여부로 로그인 성공/가입 필요를 판단합니다.
        */
        if (!data.access_token) {
            console.log("신규 유저입니다. 회원가입을 진행합니다.");
            
            // 실제 서비스에서는 prompt 대신 이메일/닉네임 등을 받는 모달이나 페이지가 권장됩니다.
            const newUserId = prompt("서비스에서 사용할 아이디(또는 닉네임)를 입력해주세요.");
            
            if (newUserId) {
                await registerUser(newUserId, socialKind); 
            } else {
                alert("입력이 취소되었습니다.");
            }
            return;
        }

        // 기존 유저 로그인 성공
        console.log(`로그인 성공! Provider: ${data.provider}`);
        
        // [추가] 토큰 저장 (필요 시)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        window.location.href = '/main.html';

    } catch (error) {
        console.error("오류 발생:", error);
        alert("처리에 실패했습니다.");
    }
}

/**
 * [POST] 회원가입 API
 */
async function registerUser(userId, provider) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            /* [주석] 백엔드 DB 설계에 따라 추가 정보(email, provider 등)를 
               함께 보내야 할 수도 있습니다. 
            */
            body: JSON.stringify({ 
                UserID: userId,
                provider: provider // 가입 시 어떤 소셜로 가입했는지 함께 전송
            }) 
        });

        if (response.ok) {
            alert("회원가입이 완료되었습니다! 다시 로그인 해주세요.");
            // 가입 후 바로 토큰을 주지 않는 경우 다시 로그인을 유도하거나 
            // 백엔드 응답에 따라 바로 로그인 처리
            location.reload(); 
        } else {
            alert("회원가입 실패. 중복된 아이디일 수 있습니다.");
        }
    } catch (error) {
        console.error("회원가입 에러:", error);
    }
}