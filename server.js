const express = require("express"); // express 라이브러리 쓰겠다
const app = express();

// 이 런 방식들은 express 사용법임(라이브러리 사용법)
// 라이브러리 사용법 왜워서 사용
// => 은, function() 대신에 씀. 콜백함수라고 불림

//  public 파일등록. 현재경로 + 폴더
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs"); // ejs라이브러리 세팅

// html 파일에 데이터넣고싶다면, .ejs파일 만들기

// 몽고DB라이브러리 사용법이라고 함
const { MongoClient } = require("mongodb");

let db;
const url = "몽고db url";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    // DB연결 성공시, 서버띄우는 코드, 포트번호입력
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });

// 서버기능. 메인페이지에 접속시, 반갑다 표시
// __dirname 는 현재프로젝트 절대경로
app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

// 서버기능. 뉴스페이지 접속시, 해당응답 표시
app.get("/news", (요청, 응답) => {
  // DB에 데이터 입력 하는 코드. 실행시, MOGODB에 저장됨
  db.collection("post").insertOne({ title: "노드js 스터디중" });
  // 응답.send("오늘 최윤석 햄버거먹음");
});

// 서버기능. 뉴스페이지 접속시, 해당응답 표시
// 누가 url로 접속시, app.get 실행. 그다음 콜백함수 실행됨
app.get("/shop", (요청, 응답) => {
  응답.send("쇼핑페이지 입니다");
});

app.get("/about", (요청, 응답) => {
  응답.sendFile(__dirname + "/introduce.html");
});

// await 쓸려면 async를 써야한다고함.
// await : 바로 다음줄 실행하지말고 잠깐기다려
// 없으면, 실행이 오래걸리는 db접속코드가 완료되기전에, 다른코드들이 실행됨
// await은 정해진곳에만 붙일수 있다고함.
app.get("/list", async (요청, 응답) => {
  //컬렉션의 모든 document 출력하는 코드.
  let result = await db.collection("post").find().toArray();
  //응답.send(result[0].title);
  // 응답은 1번에 1번만 됨

  // 파일이랑, 이름:데이터변수
  응답.render("list.ejs", { 글목록: result }); // views 폴더에 있으면, 파일명만 써도됨
});
