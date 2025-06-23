const e = require("express");
const express = require("express"); // express 라이브러리 쓰겠다
const app = express();
const mongoose = require("mongoose"); // 게시글수정의 ID유효성검사에 필요
const methodOverride = require("method-override"); // form태그 method-override 용도

// 이 런 방식들은 express 사용법임(라이브러리 사용법)
// 라이브러리 사용법 왜워서 사용
// => 은, function() 대신에 씀. 콜백함수라고 불림

// form태그 method-override 용도
// form 태그에서 PUT DELETE요청 사용하기 위함
app.use(methodOverride("_method"));

//  public 파일등록. 현재경로 + 폴더
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs"); // ejs라이브러 리 세팅

// 요청.body 세팅. 유저가 데이터 보내면,
//  요청.body에 쉽게 데이터 바인딩 시켜주는 역할. 요청.body사용에 필요
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// html 파일에 데이터넣고싶다면, .ejs파일 만들기

// 몽고DB라이브러리 사용법이라고 함
// 몽고DB 데이터의 ID 사용목적 ObjectId
const { MongoClient, ObjectId } = require("mongodb");

let db;
const url =
  "mongodb+srv://ID:PW@cluster0.ebpoh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0 url";
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

app.get("/write", (요청, 응답) => {
  응답.render("write.ejs");
});

// 2. 서버는 글을 출력해보고 검사
app.post("/add", async (요청, 응답) => {
  // 유저가 보낸값 확인가능. 사용하려면 세팅필요.
  console.log(요청.body);

  // db에 문제가 생길경우에 대비해.
  try {
    //요소가 비어있다면, 예외처리
    if (요청.body.title == "" || 요청.body.content == "") {
      응답.send("제목, 요소 입력 하센");
    } else {
      // 3. 몽고DB에 요청데이터 저장
      await db
        .collection("post")
        .insertOne({ 제목: 요청.body.title, 내용: 요청.body.content });
      응답.redirect("/list"); //처리 후, 응답. 페이지이동
    }
  } catch (error) {
    console.log(error);
    응답.status(500).send("서버에 에러났음");
  }
});

// 유저가, detail/아무문자 입력시 라는뜻.
// /detail/? 로 접속하든, 다 실행됨
// /:?? 는 URL파라미터

// 상세페이지 기능
// 1. 유저가 /detail/? 에 접속하면 요청.params
// 2. {_id:??} 글을 DB에서 조회해서,(링크 만들기.)
// 3. ejs 파일에 삽입해 보여줌

app.get("/detail/:id", async (요청, 응답) => {
  // 잘못된 응답이 들어왔을때(에러상황)
  // 에러가 나면 try코드 중지, catch 내용 실행
  try {
    // 몽고DB의 게시글ID를 변수에 저장(URL 파라미터)

    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(요청.params.id) });
    console.log(result);
    // result 가 null 일경우(유효하지 않은 URL)
    // 예외처리
    if (result == null) {
      응답.status(400).send("URL이 유효하지 않습니다");
    }

    응답.render("detail.ejs", { 글목록: result });
  } catch (e) {
    // 5XX 서버문제, 4XX 유저문제
    console.log(e);
    응답.status(404).send("URL이 올바르지 않습니다.");
  }
});

// 수정기능.
// 1. 수정 버튼누르면 수정페이지로.
// 2. 수정페이지엔 기존글이 있음.
// 3. 전송 누르면 입력한내용으로 DB글 수정
app.get("/edit/:id", async (요청, 응답) => {
  // 유저가 URL 파라미터에 입력한 값으로, 글을 불러옴
  let result = await db
    .collection("post")
    .findOne({ _id: new ObjectId(요청.params.id) });
  console.log(result);
  응답.render("edit.ejs", { result: result });
});

// 예외처리
// 1. 유저가 _id이상하게보내면
// 2. 유저가 title,content말고 다른내용으로 보내면?
// 3. 이상한 에러로 수정이 실패하면?
app.put("/edit", async (요청, 응답) => {
  try {
    // 게시글 유효성 검사에 필요( 유저가 title, content말고 다른내용으로 보내면?)
    const allowedKeys = ["id", "title", "content"];
    const keys = Object.keys(요청.body);
    const invalidKeys = keys.filter((key) => !allowedKeys.includes(key));

    // 좋아요 기능
    // await db.collection("post").updateOne(
    //     // 요청.body에 유저가 쓴 내용이 들어있음
    //     { _id: 1 },
    //     { $set: {like : 1 } }
    //   );

    // 1. 수정할 글내용이 없으면?
    if (요청.body.title == "" || 요청.body.content == "") {
      응답.send("수정할 내용을 입력해 주세요");
    } else if (!mongoose.Types.ObjectId.isValid(요청.body.id)) {
      // 유저가 _id 이상하게 보내면?
      return 요청.status(400).send("유효한 게시글 ID가 아닙니다.");
    } else if (invalidKeys.length > 0) {
      // 유저가 title, content말고 다른내용으로 보내면?
      return 응답.status(400).send("올바르지 못한 응답입니다.");
    } else {
      let result = await db.collection("post").updateOne(
        // 요청.body에 유저가 쓴 내용이 들어있음
        { _id: new ObjectId(요청.body.id) },
        { $set: { title: 요청.body.title, content: 요청.body.content } }
      );
      console.log(result); // 수정결과 확인
      응답.redirect("/list");
    }
  } catch (error) {
    // 이상한 에러로 수정이 실패하면?
    console.log(error);
    응답.status(500).send("예상치 못한 에러 발생");
  }
});

// 글 삭제기능
// 1. 글삭제 버튼누르면 서버로 요청
// 2. 서버는 확인후 해당글 DB에서 삭제(AJAX 사용)
app.post("/abc", async (요청, 응답) => {
  console.log("안녕");
  console.log(요청.body);
});
