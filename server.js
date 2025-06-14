const express = require("express"); // express 라이브러리 쓰겠다
const app = express();

// 서버띄우는 코드, 포트번호입력
app.listen(8080, () => {
  console.log("http://localhost:8080 에서 서버실행중");
});

// 서버기능. 메인페이지에 접속시, 반갑다 표시
app.get("/", (요청, 응답) => {
  응답.send("반갑다");
});
