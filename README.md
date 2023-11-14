# TIL API Server

## API Endpoints

- [x] GET / : API 서버의 상태를 확인합니다.

### Auth

- [x] POST /auth/sign-in : 사용자를 인증합니다.

### My

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/profile | 사용자 정보를 불러옵니다. |
|x| PATCH | /my/profile | 사용자 정보를 수정합니다. |
|x| DELETE | /my/profile | 사용자 정보를 삭제합니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/blogs | 나의 블로그 목록을 불러옵니다. |
|x| GET | /my/blogs/:blogId | 나의 블로그를 불러옵니다. |
|x| GET | /my/blogs/main | 나의 메인 블로그를 불러옵니다. |
|x| POST | /my/blogs | 나의 블로그를 생성합니다. |
|x| PATCH | /my/blogs/:blogId | 나의 블로그를 수정합니다. |
|x| DELETE | /my/blogs/:blogId | 나의 블로그를 삭제합니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/blogs/:blogId/posts | 나의 게시글 목록을 불러옵니다. |
|x| GET | /my/blogs/:blogId/posts/:postId | 나의 게시글을 불러옵니다. |
|x| POST | /my/blogs/:blogId/posts | 나의 게시글을 생성합니다. |
|x| PATCH | /my/blogs/:blogId/posts/:postId | 나의 게시글을 수정합니다. |
|x| DELETE | /my/blogs/:blogId/posts/:postId | 나의 게시글을 삭제합니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/posts | 나의 게시글 목록을 불러옵니다. |
|x| GET | /my/posts/:postId | 나의 게시글을 불러옵니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/liked-posts | 나의 좋아요한 게시글 목록을 불러옵니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/followers | 나의 팔로워 목록을 불러옵니다. |
|x| GET | /my/followings | 나의 팔로잉 목록을 불러옵니다. |
|x| POST | /my/followings/:userId | 다른 사용자를 팔로잉합니다. |
|x| DELETE | /my/followings/:userId | 다른 사용자를 언팔로잉합니다. |
|x| DELETE | /my/followers/:userId | 나의 팔로워를 삭제합니다. |

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /my/blocked-users | 나의 차단한 사용자 목록을 불러옵니다. |

### Users

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /users/:userId | 사용자 정보를 불러옵니다. |
|x| GET | /users/:userId/blogs | 사용자의 블로그 목록을 불러옵니다. |
|x| GET | /users/:userId/blogs/main | 사용자의 메인 블로그를 불러옵니다. |
|x| GET | /users/:userId/posts | 사용자의 게시글 목록을 불러옵니다. |
|x| GET | /users/:userId/liked-posts | 사용자의 좋아요한 게시글 목록을 불러옵니다. |
|x| GET | /users/:userId/followers | 사용자의 팔로워 목록을 불러옵니다. |
|x| GET | /users/:userId/followings | 사용자의 팔로잉 목록을 불러옵니다. |
|x| POST | /users/:userId/block | 사용자를 차단합니다. |
|x| DELETE | /users/:userId/block | 사용자의 차단을 해제합니다. |
|x| POST | /users/:userId/report | 사용자를 신고합니다. |

### Community

| | Method | Path | Description |
|-|:---|:---|:---|
|x| GET | /community/posts | 커뮤니티의 게시글 목록을 불러옵니다. |
|x| GET | /community/posts/:postId | 커뮤니티의 게시글을 불러옵니다. |
|x| POST | /community/posts/:postId/likes | 커뮤니티의 게시글을 좋아요합니다. |
|x| DELETE | /community/posts/:postId/likes | 커뮤니티의 게시글을 좋아요를 취소합니다. |
