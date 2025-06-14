const express = require("express"); // express 라이브러리 쓰겠다
const app = express();

// 이 런 방식들은 express 사용법임(라이브러리 사용법)
// 라이브러리 사용법 왜워서 사용
// => 은, function() 대신에 씀. 콜백함수라고 불림

// 서버띄우는 코드, 포트번호입력
app.listen(8080, () => {
  console.log("http://localhost:8080 에서 서버실행중");
});

// 서버기능. 메인페이지에 접속시, 반갑다 표시
// __dirname 는 현재프로젝트 절대경로
app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

// 서버기능. 뉴스페이지 접속시, 해당응답 표시
app.get("/news", (요청, 응답) => {
  응답.send("오늘 최윤석 햄버거먹음");
});

// 서버기능. 뉴스페이지 접속시, 해당응답 표시
// 누가 url로 접속시, app.get 실행. 그다음 콜백함수 실행됨
app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑페이지 입니다");
});

app.get("/about", (요청, 응답) => {
  응답.sendFile(__dirname + "/introduce.html");
});
