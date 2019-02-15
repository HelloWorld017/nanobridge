# nano[bridge]
> 단정하고 간결한 글나눔터

Nuxt.js 기반의 심플한 마이크로블로깅 어플리케이션

## 구현 체크리스트
### API
  * `/auth`  
    - [x] 유저 인증  
    - [x] 인증정보 얻어오기  

  * `/user`  
    - [x] 유저 얻어오기  
    - [x] 회원가입  
    - [x] 회원정보 변경  
    - [x] 부계정 생성  
    - [x] ACL 설정 (관리자)  

  * `/post`  
    - [x] 포스트 얻어오기 (전체, 유저별, 답장)  
    - [x] 포스트 작성  
    - [x] 포스트 삭제  
    - [x] 포스트 업데이트  

  * `/site`  
    - [x] 사이트 정보 얻어오기  
    - [x] 사이트 정보 설정  


### App
  * 공통  
    * 네비게이션  
      - [x] 유저 정보  
    - [x] 포스트 목록  
    - [x] 포스트 쓰기  
    * 포스트 보여주기  
      - [ ] 이미지 갤러리  
      - [ ] 답글 리스팅  

  * `/`  
    - [x] 포스트 목록  

  * `/user`  
    - [ ] 유저 정보 수정  

  * `/user/:user`  
    - [ ] 유저 정보 표시  
    - [x] 포스트 목록  

  * `/user/:user/:post`  
    - [ ] 포스트 보여주기  

  * `/admin`  
    - [ ] ACL 관리  
    - [ ] 사이트 정보 관리  

  * `/register`  
    - [ ] 회원가입 (사이트가 허용한 경우에만)
