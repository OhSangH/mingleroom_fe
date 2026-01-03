# MingleRoom Auth 기록 정리 (Join / Login / JWT / Refresh / Logout)

> 범위: 회원가입/로그인 + JWT Access 인증 + Refresh(쿠키+DB) + Logout + 에러 응답(ErrorRes) 통일  
> 목표: 운영 배포까지 안정적으로 동작하는 인증 구조 확립

---

## 0. 전체 흐름 요약

- **회원가입**: `/auth/join`
- **로그인**: `/auth/login`
  - Access Token(JWT) 발급 → 응답 바디
  - Refresh Token(랜덤) 발급 → DB에 **sha256 hash** 저장 → HttpOnly 쿠키로 전달
- **인증**: 요청 시 `Authorization: Bearer <accessToken>` 헤더로 JWT 인증
- **재발급**: `/auth/refresh`
  - 쿠키 refresh 검증(만료/폐기 체크) → rotation(기존 폐기 + 새 refresh 저장/쿠키 갱신) → 새 access 발급
- **로그아웃**: `/auth/logout`
  - refresh 폐기(revoked) + 쿠키 삭제
- **에러 응답 통일**: `ErrorRes` 포맷으로 Security(401/403)와 GlobalExceptionHandler 응답 형태를 통일

---

## 1. 구현에 필요한 정보

### 1.1 토큰 전략

#### Access Token (JWT)

- 전달: `Authorization: Bearer <accessToken>`
- 서버 저장: 없음(stateless)
- 만료: 짧게 권장(운영 10~15분, 테스트는 더 짧게 가능)
- 클레임
  - `sub`: email
  - `uid`: userId
  - `role`: roleGlobal
  - `iat`, `exp`

#### Refresh Token (랜덤 문자열)

- 클라이언트 저장: HttpOnly Cookie `refreshToken`
- 서버 저장: DB에 `sha256(refreshRaw)` 저장 (원문 저장 X)
- 검증
  - 쿠키 raw → sha256Hex → DB 조회
  - `expiresAt` 만료 체크
  - `revokedAt` 폐기 체크
- rotation(회전)
  - refresh 사용 시 기존 refresh는 `revokedAt` 처리
  - 새 refresh 발급/저장/쿠키 갱신

---

### 1.2 application.yml (핵심)

```yml
app:
  jwt:
    secret: ${JWT_SECRET:...}
    expirationMs: 3600000
    refreshExpirationMs: 1209600000
```

- 운영 안정성 목표로 랜덤 키(재시작마다 변경) 사용 X
- secret이 고정이면 서버 재시작/배포 후에도 기존 토큰은 exp까지 유효(정상 동작)

### 1.3 Security 필터(요약)

- `Authorization` 헤더에서 JWT 추출
- `jwtProvider.parse(token)`로 검증/파싱
- `claims.getSubject()`로 `email` 추출
- `UserDetailsService.loadUserByUsername(email)`로 `Principal` 생성
- `SecurityContextHolder`에 `Authentication` 세팅

### 1.4 공통 에러 응답 DTO (ErrorRes)

- 응답 포맷:

```json
{
  "timestamp": "2026-01-02T22:10:00+09:00",
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "액세스 토큰이 만료되었습니다.",
  "path": "/api/xxx",
  "code": "TOKEN_EXPIRED",
  "details": { "exception": "ExpiredJwtException" }
}
```

- `Security(EntryPoint/DeniedHandler)`도 동일 포맷으로 맞춤

## 2. 엔드포인트별 동작

### 2.1 회원가입 /auth/join

- 입력 검증(빈 값)
- 이메일 중복 체크
- 비밀번호 해싱 저장: `passwordEncoder.encode(...)`
- 기본 권한: `RoleGlobal.USER`

### 2.2 로그인 /auth/login

- `email`로 사용자 조회
- `password` 검증: passwordEncoder.matches(...)
- `Access` 발급: jwtProvider.createAccessToken(...)
- `Refresh` 발급 + 저장
  - `refreshRaw` 생성
  - `refreshHash` = `sha256Hex(refreshRaw)`
  - DB 저장(RefreshToken)
  - `Set-Cookie`로 `refreshToken` 전달(`HttpOnly`)
- 응답: TokenRes(accessToken)

### 2.3 Principal 확인(테스트) /auth/principal

- `@AuthenticationPrincipal UserPrincipal` 확인용
- 운영에서는 `UserDetails`를 그대로 노출하지 말고 `/auth/principal DTO` 형태 권장

### 2.4 Refresh /auth/refresh

- 쿠키 `refreshToken` 읽기
- `refreshRaw → sha256Hex` → DB 조회
- 만료/폐기 체크
- `rotation`
  - 기존 `refresh revoked` 처리
  - 새 `refresh` 생성/저장/쿠키 갱신
- 새 access 발급 반환: `TokenRes(newAccessToken)`

### 2.5 Logout /auth/logout

- 쿠키 `refreshToken` 읽기
- DB에서 해당 refresh revoked 처리(있으면)
- `refreshToken` 쿠키 삭제(maxAge=0)

---

# 3. 진행 중 발생했던 주요 에러와 원인/해결

## 3.1 앱 시작 실패: `app.jwt.expirationMs` placeholder 미해결

- **원인**: yml에 해당 키 없음 또는 키 이름 불일치
- **해결**: yml에 `app.jwt.expirationMs` 추가(또는 코드의 @Value 키와 일치)

---

## 3.2 Postgres 타입 에러: `role_global` enum vs varchar

- **에러**: `role_global은 role_global_t인데 표현식은 character varying`
- **원인**: DB는 Postgres enum인데 JPA가 문자열로 insert
- **해결 선택**

  - enum 유지 및 Hibernate `NAMED_ENUM` 매핑

---

## 3.3 principal이 null (인증이 안 먹는 듯 보임)

- **로그 결과**

  - Authorization 헤더는 들어오는데 parse에서
  - `JWT signature does not match locally computed signature`
  - SecurityContext clear → principal null

- **실제 원인**

  - Postman에서 “JWT Bearer Token” 기능으로 보낼 때
  - 서버가 기대하는 `Authorization: Bearer ...` 형태로 제대로 전달이 안 됨

- **해결**

  - Postman Headers에 직접:

    - `Authorization: Bearer <token>`

  - 이후 정상 작동 확인

---

## 3.4 서버 시작 실패: PasswordEncoder bean 없음

- **에러**: `PasswordEncoder` 빈을 찾을 수 없음
- **원인**: `@Bean PasswordEncoder` 미등록
- **해결**

  - SecurityConfig에:

    - `@Bean public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }`

---

## 3.5 만료 토큰 테스트 시 403만 떨어짐 (GlobalExceptionHandler로 못 감)

- **원인**

  - JWT 인증 실패/인가 실패는 컨트롤러 전에(Spring Security) 발생
  - 그래서 `@ControllerAdvice`가 직접 못 잡는 경우가 많음

- **해결(선택 1번 채택)**

  - `AuthenticationEntryPoint` (401)
  - `AccessDeniedHandler` (403)
  - 둘 다 `ErrorRes` 포맷으로 응답

---

## 3.6 Security 에러 응답 통일 중 “ex 지역변수 없음”

- **원인**: 메서드 파라미터 이름 불일치
- **해결**: 파라미터명을 `ex`로 맞추거나 참조 변수명을 일치시켜 해결

---

# 4. 구현하면서 변경/결정했던 사항(수정 히스토리)

## 4.1 JWT secret 운영 정책 결정

- 랜덤 키로 만들면 재시작 시 토큰이 모두 무효화되지만 운영에서 불안정
- 운영 배포 안정 목표 → **고정 secret(env/secret manager)** 채택

## 4.2 Principal(UserDetails) 설계 결정

- 엔티티 래핑 방식(UserPrincipal) 유지
- password는 `@JsonIgnore`
- 테스트용 principal 응답은 동작하지만 운영에서는 DTO 응답 권장

## 4.3 Refresh 구현에서 응답 타입

- 예시로 사용된 `AuthResponse`는 프로젝트에 없었음
- 기존 사용 중인 `TokenRes`로 login/refresh 응답을 통일하기로 결정

## 4.4 인증/인가 에러 처리 정책

- GlobalExceptionHandler 단독 처리 대신
- Security의 EntryPoint/DeniedHandler에서 `ErrorRes`로 통일하는 방식 채택

---

# 5. 테스트 체크리스트 (Postman 기준)

## 5.1 로그인

- `/auth/login` 호출
- 응답 바디에 accessToken 확인
- response headers에 `Set-Cookie: refreshToken=...` 확인

## 5.2 보호 API 호출

- `Authorization: Bearer <accessToken>` 헤더 필수
- principal 확인은 `/auth/principal`로 가능

## 5.3 access 만료 후 refresh

- `/auth/refresh` 호출 (쿠키 자동 첨부되어야 함)
- 새 accessToken 응답
- refresh rotation으로 cookie 값이 갱신되는지 확인

## 5.4 로그아웃

- `/auth/logout` 호출
- refreshToken 쿠키 삭제(Set-Cookie maxAge=0)
- 이후 `/auth/refresh` 호출 시 401(ErrorRes) 떠야 정상

## 5.5 만료/위조 테스트

- 만료 토큰 → 401 + ErrorRes(`code=TOKEN_EXPIRED`)
- 위조 토큰 → 401 + ErrorRes(`code=TOKEN_INVALID`)
- 권한 부족 → 403 + ErrorRes
