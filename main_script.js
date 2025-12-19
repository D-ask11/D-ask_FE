// 1. 페이지를 끝까지 움직이면 header가 고정되도록
const header = document.querySelector("header");
const progressBar = document.querySelector(".bar");
// covertitle 움직이게
const coverTitle = document.querySelector(".coverTitle");
// 3. 커버 이미지 움직이게
const coverWrap = document.querySelector(".coverWrap");
// 4. 백그라운드 컬러 검은색으로 변하게 하기
const dimd = coverWrap.querySelector(".dimd");
const contWrap = document.querySelector(".contWrap");


let scrollNum = 0;
let documentHeight = 0;
let per = 0;
const coverHeight = window.innerHeight;

coverWrap.style.height = coverHeight+"px";
contWrap.style.marginTop = coverHeight+"px";

window.addEventListener("scroll", ()=>{
    scrollNum = window.scrollY;
    documentHeight = document.body.scrollHeight+coverHeight-window.innerHeight;
    per = percent(scrollNum, documentHeight);
    progressBar.style.width = per+"%";
    if(scrollNum>=coverHeight){
        header.classList.add("fixed");
    }
    else{
        header.classList.remove("fixed");
    }
    coverTitle.style.top=-scrollNum/5+"px";
    coverWrap.style.top = -scrollNum/5+"px";
    dimd.style.backgroundColor = `rgba(0, 0, 0,${0.4+scrollNum/1000})`;
});

const percent = (num, totalNum)=>{
    return((num/totalNum)*100).toFixed(0);
};