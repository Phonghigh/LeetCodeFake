# Backend Spring Boot — Kế hoạch chi tiết từng bước

> Dành cho người mới. Mỗi phase có: kiến thức cần học, tài liệu chính thức, bài tập thực hành, và hướng dẫn implement thực tế.

---

## Tổng quan các phase

| Phase | Nội dung                        | Tuần  |
|-------|---------------------------------|-------|
| 0     | Setup & Tooling                 | 1     |
| 1     | Database Layer (JPA + Flyway)   | 1     |
| 2     | REST API Layer (CRUD)           | 2     |
| 3     | Auth (Spring Security + JWT)    | 2     |
| 4     | Submission API + Redis Producer | 4     |
| 5     | Judge Worker + Docker Sandbox   | 5–6   |
| 6     | WebSocket Real-time             | 7     |

---

# Phase 0 — Setup & Tooling

## Kiến thức cần học

### Maven là gì?

Maven là build tool của Java. Nó làm 3 việc:
- Quản lý dependencies (tự tải thư viện về máy)
- Build project thành file `.jar`
- Chạy tests

File cấu hình là `pom.xml`. Khi bạn thêm một dependency vào đây, Maven tự tải về.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### Spring Boot là gì?

Spring Boot là framework để xây dựng Java backend nhanh hơn Spring thuần. Điểm mấu chốt là **Auto-configuration**: bạn thêm dependency, Spring Boot tự cấu hình mọi thứ.

Ví dụ: thêm `spring-boot-starter-data-jpa` + PostgreSQL driver → Spring Boot tự tạo connection pool, entity manager, transaction manager — bạn không cần viết một dòng config nào.

### Spring Starters

`spring-boot-starter-*` là các bundle dependencies được đóng gói sẵn.

| Starter                        | Dùng để                    |
|--------------------------------|----------------------------|
| spring-boot-starter-web        | REST API (HTTP)            |
| spring-boot-starter-data-jpa   | Database (JPA/Hibernate)   |
| spring-boot-starter-security   | Authentication             |
| spring-boot-starter-data-redis | Redis                      |
| spring-boot-starter-websocket  | WebSocket                  |
| spring-boot-starter-validation | Bean validation (@Valid)   |

---

## Tài liệu chính thức

- Maven Getting Started: https://maven.apache.org/guides/getting-started/index.html
- Spring Initializr: https://start.spring.io
- Spring Boot Getting Started: https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html

---

## Bài tập (HW-0)

Vào https://start.spring.io, tạo project với:
- Project: **Maven**, Language: **Java 21**, Spring Boot: **3.3.x**
- Group: `com.leetcodefake`, Artifact: `api-service`
- Dependencies: `Spring Web`, `Spring Data JPA`, `PostgreSQL Driver`, `Flyway Migration`, `Lombok`, `Spring Security`, `Spring Data Redis`, `WebSocket`, `Validation`

Download, giải nén, mở IntelliJ IDEA. Chạy `./mvnw package` — phải build thành công.

---

## Cấu trúc thư mục

```
api-service/
├── src/main/java/com/leetcodefake/
│   ├── ApiServiceApplication.java
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   └── dto/
│   ├── user/
│   │   ├── User.java
│   │   ├── UserRepository.java
│   │   └── UserService.java
│   ├── problem/
│   │   ├── Problem.java
│   │   ├── ProblemRepository.java
│   │   ├── ProblemService.java
│   │   ├── ProblemController.java
│   │   └── dto/
│   ├── testcase/
│   ├── submission/
│   ├── judge/
│   └── common/
│       ├── enums/
│       ├── exception/
│       └── config/
└── src/main/resources/
    ├── application.yml
    └── db/migration/
        ├── V1__create_users_table.sql
        ├── V2__create_problems_table.sql
        ├── V3__create_test_cases_table.sql
        └── V4__create_submissions_table.sql
```

---

# Phase 1 — Database Layer (JPA + Flyway)

## Kiến thức cần học

### JPA và Hibernate

**JPA** (Jakarta Persistence API) là tập hợp annotation và interface chuẩn để làm việc với database trong Java. **Hibernate** là thư viện thực sự thực thi JPA — nó dịch annotation của bạn thành câu SQL.

Bạn viết Java + annotation → Hibernate sinh SQL → chạy trên PostgreSQL.

### @Entity — Map class Java với table

```java
@Entity
@Table(name = "users")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
```

| Annotation                      | Ý nghĩa                                        |
|---------------------------------|------------------------------------------------|
| `@Entity`                       | Class này map tới 1 table trong DB             |
| `@Table(name = "users")`        | Tên table                                      |
| `@Id`                           | Primary key                                    |
| `@GeneratedValue(IDENTITY)`     | DB tự tăng ID (SERIAL / BIGSERIAL)             |
| `@Column(nullable = false)`     | NOT NULL constraint                            |
| `@Column(unique = true)`        | UNIQUE constraint                              |
| `@Enumerated(EnumType.STRING)`  | Lưu enum dạng string ("ADMIN") thay vì số (0) |
| `@PrePersist`                   | Method chạy tự động trước khi INSERT           |

### Lombok — giảm boilerplate

```java
@Getter        // sinh getter cho mọi field
@Setter        // sinh setter cho mọi field
@Builder       // cho phép: User.builder().username("x").email("y").build()
@NoArgsConstructor   // constructor không tham số (JPA cần cái này)
@AllArgsConstructor  // constructor với tất cả tham số
```

### Spring Data JPA Repository

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Data tự generate SQL từ tên method:
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}
```

`JpaRepository<User, Long>` có sẵn: `save()`, `findById()`, `findAll()`, `deleteById()`, `count()`.

### Flyway — versioned database migrations

**Vấn đề:** Dev tạo column mới trong entity, nhưng table trong PostgreSQL chưa có column đó → app crash.

**Giải pháp:** Flyway — mỗi thay đổi schema viết thành 1 file SQL có version. Flyway chạy file chưa chạy theo thứ tự khi app khởi động.

Quy tắc đặt tên file: `V{version}__{mô_tả}.sql`

```
V1__create_users_table.sql        ← chạy đầu tiên
V2__create_problems_table.sql     ← chạy thứ hai
V3__create_test_cases_table.sql
V4__create_submissions_table.sql
```

File đã chạy thì **không bao giờ chạy lại**. Không sửa file cũ, chỉ tạo file mới.

---

## Flyway SQL files

```sql
-- V1__create_users_table.sql
CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- V2__create_problems_table.sql
CREATE TABLE problems (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    difficulty  VARCHAR(10)  NOT NULL,
    description TEXT,
    constraints TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- V3__create_test_cases_table.sql
CREATE TABLE test_cases (
    id              BIGSERIAL PRIMARY KEY,
    problem_id      BIGINT    NOT NULL REFERENCES problems(id),
    input           TEXT,
    expected_output TEXT,
    is_hidden       BOOLEAN   NOT NULL DEFAULT FALSE
);

-- V4__create_submissions_table.sql
CREATE TABLE submissions (
    id          BIGSERIAL    PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id),
    problem_id  BIGINT       NOT NULL REFERENCES problems(id),
    language    VARCHAR(10)  NOT NULL,
    source_code TEXT         NOT NULL,
    status      VARCHAR(30)  NOT NULL DEFAULT 'PENDING',
    runtime     INTEGER,
    memory      INTEGER,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

## application.yml

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/leetcodefake
    username: postgres
    password: postgres
    driver-class-name: org.postgresql.Driver

  jpa:
    hibernate:
      ddl-auto: validate       # Hibernate CHỈ kiểm tra schema, không tự tạo/xóa table
    show-sql: true
    properties:
      hibernate:
        format_sql: true

  flyway:
    enabled: true
    locations: classpath:db/migration
```

> `ddl-auto: validate` — quan trọng. Nếu để `create` hoặc `update`, Hibernate sẽ tự sửa schema và xung đột với Flyway.

## Docker Compose (infrastructure/)

```yaml
# infrastructure/docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: leetcodefake
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
cd infrastructure && docker compose up -d
```

---

## Tài liệu chính thức

- Spring Data JPA: https://docs.spring.io/spring-data/jpa/docs/current/reference/html/
- Flyway versioned migrations: https://documentation.red-gate.com/flyway/flyway-cli-and-api/concepts/migrations#Migrations-VersionedMigrations
- Lombok features: https://projectlombok.org/features/

---

## Bài tập (HW-1)

**HW-1A:** Viết 4 Flyway migration files, chạy `docker compose up -d`, start app. Kiểm tra Flyway đã tạo tables bằng `psql -U postgres -d leetcodefake -c "\dt"` hoặc DBeaver.

**HW-1B:** Tạo 4 Entity classes và 4 Repository interfaces. Viết một test:
```java
@SpringBootTest
class UserRepositoryTest {
    @Autowired UserRepository userRepository;

    @Test
    void shouldSaveAndFindByEmail() {
        User user = User.builder().username("test").email("test@test.com")
            .password("hashed").role(Role.USER).build();
        userRepository.save(user);
        assertTrue(userRepository.findByEmail("test@test.com").isPresent());
    }
}
```

---

## Tất cả Entities

```java
// problem/Problem.java
@Entity @Table(name = "problems")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Problem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Difficulty difficulty;
    @Column(columnDefinition = "TEXT") private String description;
    @Column(columnDefinition = "TEXT") private String constraints;
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() { createdAt = LocalDateTime.now(); }
}

// testcase/TestCase.java
@Entity @Table(name = "test_cases")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class TestCase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;
    @Column(columnDefinition = "TEXT") private String input;
    @Column(name = "expected_output", columnDefinition = "TEXT") private String expectedOutput;
    @Column(name = "is_hidden") private boolean hidden;
}

// submission/Submission.java
@Entity @Table(name = "submissions")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Submission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false) private Problem problem;
    @Enumerated(EnumType.STRING) private Language language;
    @Column(name = "source_code", columnDefinition = "TEXT") private String sourceCode;
    @Enumerated(EnumType.STRING) private SubmissionStatus status;
    private Integer runtime;   // milliseconds
    private Integer memory;    // KB
    @Column(name = "created_at") private LocalDateTime createdAt;
    @PrePersist void prePersist() {
        createdAt = LocalDateTime.now();
        status = SubmissionStatus.PENDING;
    }
}
```

```java
// common/enums/Role.java
public enum Role { USER, ADMIN }

// common/enums/Difficulty.java
public enum Difficulty { EASY, MEDIUM, HARD }

// common/enums/Language.java
public enum Language { JAVA, PYTHON, CPP }

// common/enums/SubmissionStatus.java
public enum SubmissionStatus {
    PENDING, RUNNING,
    ACCEPTED, WRONG_ANSWER,
    TIME_LIMIT_EXCEEDED, MEMORY_LIMIT_EXCEEDED,
    COMPILATION_ERROR, RUNTIME_ERROR
}
```

---

# Phase 2 — REST API Layer

## Kiến thức cần học

### Luồng request trong Spring MVC

```
HTTP Request
    │
    ▼
DispatcherServlet        ← Spring MVC front controller, nhận mọi request
    │
    ▼
@RestController          ← Nhận request, trả JSON response
    │
    ▼
@Service                 ← Business logic
    │
    ▼
@Repository              ← Database access
```

### Annotations

```java
@RestController                    // = @Controller + tự serialize response thành JSON
@RequestMapping("/problems")       // Base path

@GetMapping                        // GET /problems
@GetMapping("/{id}")               // GET /problems/123
@PostMapping                       // POST /problems
@PutMapping("/{id}")               // PUT /problems/123
@DeleteMapping("/{id}")            // DELETE /problems/123

@PathVariable Long id              // Lấy {id} từ URL
@RequestBody CreateProblemRequest  // Parse JSON body
@Valid                             // Kích hoạt validation trên DTO
```

### DTO (Data Transfer Object)

**Không bao giờ** trả Entity trực tiếp ra API. Lý do:
1. Entity có thể có field nhạy cảm (password hash)
2. Response và Request thường có shape khác entity
3. Dễ thay đổi API contract mà không ảnh hưởng DB schema

```java
// Request DTO — dữ liệu client gửi lên
public record CreateProblemRequest(
    @NotBlank(message = "Title is required") String title,
    @NotNull Difficulty difficulty,
    @NotBlank String description,
    String constraints          // optional
) {}

// Response DTO — dữ liệu server trả về
public record ProblemResponse(
    Long id, String title, Difficulty difficulty,
    String description, String constraints, LocalDateTime createdAt
) {}

// List response — chỉ trả fields cần thiết
public record ProblemSummaryResponse(Long id, String title, Difficulty difficulty) {}
```

### ResponseEntity

```java
ResponseEntity.ok(body)                                    // 200
ResponseEntity.status(HttpStatus.CREATED).body(body)       // 201
ResponseEntity.notFound().build()                          // 404
ResponseEntity.noContent().build()                         // 204
ResponseEntity.badRequest().body(error)                    // 400
```

### Global Exception Handler

```java
// common/exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(new ErrorResponse(message));
    }
}

// common/exception/ResourceNotFoundException.java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}

// common/exception/ErrorResponse.java
public record ErrorResponse(String message) {}
```

---

## Tài liệu chính thức

- Spring MVC Controllers: https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#mvc-controller
- Bean Validation: https://jakarta.ee/specifications/bean-validation/3.0/

---

## Bài tập (HW-2)

**HW-2A:** Implement đầy đủ CRUD cho `Problem`. Test bằng Postman:
- `GET /problems` → danh sách (chỉ `id`, `title`, `difficulty`)
- `GET /problems/1` → đầy đủ
- `GET /problems/9999` → 404 với message rõ ràng
- `POST /problems` với body thiếu `title` → 400 với validation message

**HW-2B:** Implement CRUD cho `TestCase` (nested under problem): `POST /problems/{id}/test-cases`, `GET /problems/{id}/test-cases`.

---

## Implement thực tế

```java
// problem/ProblemService.java
@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;

    public List<ProblemSummaryResponse> findAll() {
        return problemRepository.findAll().stream()
            .map(p -> new ProblemSummaryResponse(p.getId(), p.getTitle(), p.getDifficulty()))
            .toList();
    }

    public ProblemResponse findById(Long id) {
        return toResponse(problemRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found: " + id)));
    }

    public ProblemResponse create(CreateProblemRequest req) {
        Problem problem = Problem.builder()
            .title(req.title()).difficulty(req.difficulty())
            .description(req.description()).constraints(req.constraints())
            .build();
        return toResponse(problemRepository.save(problem));
    }

    private ProblemResponse toResponse(Problem p) {
        return new ProblemResponse(p.getId(), p.getTitle(), p.getDifficulty(),
            p.getDescription(), p.getConstraints(), p.getCreatedAt());
    }
}

// problem/ProblemController.java
@RestController
@RequestMapping("/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<ProblemSummaryResponse>> getAll() {
        return ResponseEntity.ok(problemService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ProblemResponse> create(@Valid @RequestBody CreateProblemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.create(req));
    }
}
```

---

# Phase 3 — Authentication (Spring Security + JWT)

## Kiến thức cần học

### JWT là gì?

JWT (JSON Web Token) là một string gồm 3 phần ngăn bởi dấu `.`:

```
eyJhbGciOiJIUzI1NiJ9  .  eyJzdWIiOiJ1c2VyQGUuY29tIn0  .  HMAC_SIGNATURE
      HEADER                        PAYLOAD                    SIGNATURE
```

- **Header:** thuật toán ký (HS256)
- **Payload:** data bạn muốn mang (email, role, expiry) — base64 encoded, **không phải encrypted**
- **Signature:** `HMAC(header + payload, secret_key)` — để verify token không bị giả mạo

**Flow:**
```
1. Client POST /auth/login { email, password }
2. Server verify password → tạo JWT → trả về
3. Client lưu JWT
4. Mọi request sau: gửi header "Authorization: Bearer <token>"
5. Server verify signature → đọc email từ payload → biết user là ai
```

JWT **không cần lưu vào DB**. Server chỉ cần `secret_key` để verify.

### Spring Security — cách hoạt động

Spring Security là một chuỗi Filters chặn request TRƯỚC KHI đến Controller:

```
HTTP Request
    │
    ▼
[JwtAuthFilter]      ← Filter bạn tự viết: đọc JWT, set authentication
    │
    ▼
[AuthorizationFilter] ← Spring built-in: kiểm tra role
    │
    ▼
Controller
```

### SecurityContext

Sau khi JWT được verify, Spring lưu thông tin user vào `SecurityContext`. Từ bất kỳ đâu trong app bạn có thể lấy:

```java
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
User user = (User) auth.getPrincipal();
```

---

## Dependencies cần thêm (pom.xml)

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.5</version>
    <scope>runtime</scope>
</dependency>
```

---

## Tài liệu chính thức

- Spring Security Architecture: https://docs.spring.io/spring-security/reference/servlet/architecture.html
- JJWT library: https://github.com/jwtk/jjwt#readme
- BCryptPasswordEncoder: https://docs.spring.io/spring-security/reference/features/authentication/password-storage.html

---

## Bài tập (HW-3)

**HW-3A:** Implement register + login. Test bằng Postman:
1. `POST /auth/register` → nhận token
2. `GET /auth/me` với `Authorization: Bearer <token>` → nhận thông tin user
3. `GET /auth/me` không có token → nhận `403`
4. `POST /auth/login` sai password → nhận `401`

**HW-3B:** Thêm `@PreAuthorize("hasRole('ADMIN')")` vào `POST /problems`. Insert admin user bằng tay:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
```
Login bằng admin → tạo problem thành công. Login bằng user thường → `403`.

---

## Implement thực tế

### User implements UserDetails

```java
// user/User.java — thêm implements UserDetails
public class User implements UserDetails {

    // ... fields như Phase 1 ...

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
```

### JwtService

```java
// common/security/JwtService.java
@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String generateToken(UserDetails user) {
        return Jwts.builder()
            .subject(user.getUsername())
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(signingKey())
            .compact();
    }

    public String extractUsername(String token) {
        return Jwts.parser().verifyWith(signingKey()).build()
            .parseSignedClaims(token).getPayload().getSubject();
    }

    public boolean isValid(String token, UserDetails user) {
        String username = extractUsername(token);
        Date expiry = Jwts.parser().verifyWith(signingKey()).build()
            .parseSignedClaims(token).getPayload().getExpiration();
        return username.equals(user.getUsername()) && expiry.after(new Date());
    }
}
```

### JWT Filter

```java
// common/security/JwtAuthFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(req, res);
            return;
        }

        String token = header.substring(7);
        String username = jwtService.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails user = userDetailsService.loadUserByUsername(username);
            if (jwtService.isValid(token, user)) {
                var auth = new UsernamePasswordAuthenticationToken(
                    user, null, user.getAuthorities());
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
```

### Security Config

```java
// common/config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### Auth Service + Controller

```java
// auth/AuthService.java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email()))
            throw new ConflictException("Email already in use");
        User user = User.builder()
            .username(req.username()).email(req.email())
            .password(passwordEncoder.encode(req.password()))
            .role(Role.USER).build();
        userRepository.save(user);
        return new AuthResponse(jwtService.generateToken(user));
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        return new AuthResponse(jwtService.generateToken(user));
    }
}

// auth/AuthController.java
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getRole()));
    }
}
```

### application.yml — thêm JWT config

```yaml
app:
  jwt:
    secret: dGhpcy1pcy1hLXZlcnktbG9uZy1zZWNyZXQta2V5LWZvci1sZWV0Y29kZS1jbG9uZQ==
    expiration-ms: 86400000    # 24 giờ
```

> Secret phải là Base64-encoded string dài ít nhất 256-bit (32 bytes).

---

# Phase 4 — Submission API + Redis Queue

## Kiến thức cần học

### Redis List như một Queue

Redis có kiểu dữ liệu `LIST`. Dùng như queue:

```
API Service (Producer)                Judge Worker (Consumer)
       │                                      │
       │  LPUSH submissions_queue <job>       │
       │ ─────────────────────────────────▶  │
       │                                      │
       │                       BRPOP submissions_queue 0
       │                       ◀──────────────────────
       │                            nhận job, xử lý
```

- `LPUSH key value` — đẩy vào đầu list (trái)
- `BRPOP key timeout` — lấy ra từ cuối list (phải), blocking đến khi có item

### Spring Data Redis

```java
@Configuration
public class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        return template;
    }
}
```

```java
// Push job vào queue
redisTemplate.opsForList().leftPush("submissions_queue", Map.of("submissionId", 123));

// Pop từ queue (dùng trong Worker)
Object job = redisTemplate.opsForList().rightPop("submissions_queue", Duration.ofSeconds(5));
```

---

## Tài liệu chính thức

- Spring Data Redis: https://docs.spring.io/spring-data/redis/docs/current/reference/html/
- Redis Lists: https://redis.io/docs/data-types/lists/

---

## Bài tập (HW-4)

Sau khi implement Submission API, test:
```bash
# Kiểm tra queue có job chưa
redis-cli LLEN submissions_queue      # phải > 0 sau khi submit

# Xem nội dung queue
redis-cli LRANGE submissions_queue 0 -1

# GET submission vừa tạo → phải thấy status: PENDING
curl -H "Authorization: Bearer <token>" http://localhost:8080/submissions/1
```

---

## Implement thực tế

```java
// submission/dto/SubmitRequest.java
public record SubmitRequest(
    @NotNull Long problemId,
    @NotNull Language language,
    @NotBlank String sourceCode
) {}

// submission/SubmissionService.java
@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String QUEUE_KEY = "submissions_queue";

    public SubmissionResponse submit(SubmitRequest req, User currentUser) {
        Problem problem = problemRepository.findById(req.problemId())
            .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        Submission submission = Submission.builder()
            .user(currentUser).problem(problem)
            .language(req.language()).sourceCode(req.sourceCode())
            .build();
        submission = submissionRepository.save(submission);

        redisTemplate.opsForList().leftPush(QUEUE_KEY,
            Map.of("submissionId", submission.getId()));

        return new SubmissionResponse(submission.getId(), submission.getStatus());
    }

    public SubmissionDetailResponse findById(Long id) {
        Submission s = submissionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        return new SubmissionDetailResponse(s.getId(), s.getStatus(),
            s.getLanguage(), s.getRuntime(), s.getMemory(), s.getCreatedAt());
    }
}

// submission/SubmissionController.java
@RestController
@RequestMapping("/submissions")
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping
    public ResponseEntity<SubmissionResponse> submit(
            @Valid @RequestBody SubmitRequest req,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(submissionService.submit(req, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDetailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.findById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(submissionService.findByUser(user));
    }
}
```

### application.yml — thêm Redis

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

---

# Phase 5 — Judge Worker + Docker Sandbox

## Kiến thức cần học

### Sandbox Dockerfile

```dockerfile
# docker-images/java/Dockerfile
FROM eclipse-temurin:21-jdk-alpine

# Tạo user không có quyền root — security best practice
RUN adduser -D -u 1001 judge
USER judge

WORKDIR /app
CMD ["bash"]
```

Build image:
```bash
docker build -t judge-java ./docker-images/java/
```

### Chạy Docker từ Java bằng ProcessBuilder

```java
ProcessBuilder pb = new ProcessBuilder(
    "docker", "run", "--rm",
    "--memory=128m",      // giới hạn RAM
    "--cpus=1",           // giới hạn CPU
    "--network=none",     // chặn network hoàn toàn
    "-v", hostDir + ":/app",
    "judge-java",
    "bash", "-c", "cd /app && javac Main.java"
);
pb.redirectErrorStream(true);  // merge stderr vào stdout
Process process = pb.start();
String output = new String(process.getInputStream().readAllBytes());
int exitCode = process.waitFor();
```

### Timeout và các exit codes

| Exit code | Ý nghĩa                         |
|-----------|---------------------------------|
| 0         | Thành công                      |
| 1         | Lỗi chung (compile error, etc.) |
| 124       | Timeout (`timeout` command)     |
| 137       | Bị kill do OOM                  |

```bash
# Bên trong container:
timeout 2s java Main < input.txt
# Nếu quá 2 giây → exit code 124 (TLE)
```

### Luồng Judge đầy đủ

```
1. Worker poll Redis queue → nhận { submissionId: 123 }
2. Load Submission từ DB → set status = RUNNING
3. Load tất cả TestCase của problem
4. Tạo temp dir: /tmp/judge/123/
5. Ghi sourceCode → /tmp/judge/123/Main.java
6. docker run judge-java "javac Main.java"
   → exitCode != 0 → COMPILATION_ERROR, dừng
7. Với mỗi TestCase:
   a. Ghi input → /tmp/judge/123/input.txt
   b. docker run "timeout 2s java Main < input.txt"
   c. exitCode == 124 → TIME_LIMIT_EXCEEDED, dừng
   d. so sánh stdout với expectedOutput
   e. khác → WRONG_ANSWER, dừng
8. Tất cả pass → ACCEPTED
9. Update DB, push WebSocket
10. Xóa /tmp/judge/123/
```

---

## Tài liệu chính thức

- Docker run: https://docs.docker.com/engine/reference/run/
- Docker resource constraints: https://docs.docker.com/config/containers/resource_constraints/
- Java ProcessBuilder: https://docs.oracle.com/en/java/docs/api/java.base/java/lang/ProcessBuilder.html

---

## Bài tập (HW-5)

**HW-5A:** Build judge-java image. Test thủ công:
```bash
mkdir /tmp/judge-test
cat > /tmp/judge-test/Main.java << 'EOF'
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello Judge");
    }
}
EOF

docker run --rm -v /tmp/judge-test:/app judge-java \
  bash -c "cd /app && javac Main.java && java Main"
# Output: Hello Judge
```

**HW-5B:** Test TLE (infinite loop):
```bash
cat > /tmp/judge-test/Main.java << 'EOF'
public class Main {
    public static void main(String[] args) { while(true){} }
}
EOF

docker run --rm -v /tmp/judge-test:/app judge-java \
  bash -c "cd /app && javac Main.java && timeout 2s java Main"
echo "Exit code: $?"   # phải là 124
```

**HW-5C:** Test no-network:
```bash
cat > /tmp/judge-test/Main.java << 'EOF'
import java.net.*;
public class Main {
    public static void main(String[] args) throws Exception {
        new URL("http://google.com").openConnection().connect();
        System.out.println("Connected");  // không bao giờ in ra được
    }
}
EOF

docker run --rm --network=none -v /tmp/judge-test:/app judge-java \
  bash -c "cd /app && javac Main.java && java Main"
# Exit với exception (network unreachable)
```

---

## Implement thực tế

```java
// judge/JudgeWorker.java
@Component
@RequiredArgsConstructor
@Slf4j
public class JudgeWorker {

    private final RedisTemplate<String, Object> redisTemplate;
    private final SubmissionRepository submissionRepository;
    private final TestCaseRepository testCaseRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final String QUEUE_KEY = "submissions_queue";

    @Scheduled(fixedDelay = 100)
    public void poll() {
        Object raw = redisTemplate.opsForList()
            .rightPop(QUEUE_KEY, Duration.ofSeconds(5));
        if (raw == null) return;

        Long submissionId = Long.valueOf(((Map<?, ?>) raw).get("submissionId").toString());
        judge(submissionId);
    }

    private void judge(Long submissionId) {
        Submission sub = submissionRepository.findById(submissionId).orElseThrow();
        sub.setStatus(SubmissionStatus.RUNNING);
        submissionRepository.save(sub);

        try {
            Path workDir = Files.createTempDirectory("judge-" + submissionId + "-");
            Files.writeString(workDir.resolve("Main.java"), sub.getSourceCode());

            // Compile
            RunResult compile = runInSandbox(workDir, "javac Main.java", 30);
            if (compile.exitCode() != 0) {
                finish(sub, SubmissionStatus.COMPILATION_ERROR, null);
                return;
            }

            // Run each test case
            List<TestCase> cases = testCaseRepository.findByProblemId(sub.getProblem().getId());
            long totalRuntime = 0;

            for (TestCase tc : cases) {
                Files.writeString(workDir.resolve("input.txt"),
                    tc.getInput() != null ? tc.getInput() : "");

                RunResult run = runInSandbox(workDir,
                    "timeout 2s java -Xmx100m Main < input.txt", 10);

                totalRuntime += run.durationMs();

                if (run.exitCode() == 124) {
                    finish(sub, SubmissionStatus.TIME_LIMIT_EXCEEDED, null);
                    return;
                }
                if (run.exitCode() != 0) {
                    finish(sub, SubmissionStatus.RUNTIME_ERROR, null);
                    return;
                }
                if (!normalize(run.output()).equals(normalize(tc.getExpectedOutput()))) {
                    finish(sub, SubmissionStatus.WRONG_ANSWER, null);
                    return;
                }
            }

            finish(sub, SubmissionStatus.ACCEPTED, (int) totalRuntime);

        } catch (Exception e) {
            log.error("Judge error for submission {}", submissionId, e);
            finish(sub, SubmissionStatus.RUNTIME_ERROR, null);
        }
    }

    private RunResult runInSandbox(Path workDir, String cmd, int timeoutSec) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(
            "docker", "run", "--rm",
            "--memory=128m", "--cpus=1", "--network=none",
            "-v", workDir.toAbsolutePath() + ":/app",
            "judge-java",
            "bash", "-c", "cd /app && " + cmd
        );
        pb.redirectErrorStream(true);

        long start = System.currentTimeMillis();
        Process process = pb.start();
        String output = new String(process.getInputStream().readAllBytes());
        boolean done = process.waitFor(timeoutSec, TimeUnit.SECONDS);
        long duration = System.currentTimeMillis() - start;

        if (!done) {
            process.destroyForcibly();
            return new RunResult(124, "", duration);
        }
        return new RunResult(process.exitValue(), output, duration);
    }

    private String normalize(String s) {
        return s == null ? "" : s.trim();
    }

    private void finish(Submission sub, SubmissionStatus status, Integer runtimeMs) {
        sub.setStatus(status);
        if (runtimeMs != null) sub.setRuntime(runtimeMs);
        submissionRepository.save(sub);

        // Push WebSocket notification (Phase 6)
        messagingTemplate.convertAndSendToUser(
            sub.getUser().getId().toString(),
            "/queue/submissions",
            Map.of("submissionId", sub.getId(), "status", status.name())
        );
    }

    public record RunResult(int exitCode, String output, long durationMs) {}
}
```

Thêm `@EnableScheduling` vào main class:
```java
@SpringBootApplication
@EnableScheduling
public class ApiServiceApplication { ... }
```

---

# Phase 6 — WebSocket Real-time

## Kiến thức cần học

### WebSocket vs HTTP polling

| HTTP Polling                      | WebSocket                        |
|-----------------------------------|----------------------------------|
| Client hỏi mỗi 1-2s: "Xong chưa?"| Server push ngay khi có kết quả  |
| Tốn băng thông, tăng latency      | Một connection duy nhất          |
| Dễ implement                      | Cần setup thêm                   |

### STOMP over WebSocket

STOMP là text protocol chạy trên WebSocket, cho phép:
- Client **subscribe** tới một channel
- Server **push** message tới channel đó

```
Client subscribe: /user/queue/submissions
                         │
Server push:      messagingTemplate.convertAndSendToUser(userId, "/queue/submissions", data)
                         │
                  → chỉ client của userId đó nhận được
```

---

## Tài liệu chính thức

- Spring WebSocket + STOMP: https://docs.spring.io/spring-framework/docs/current/reference/html/web.html#websocket-stomp
- STOMP JS (frontend): https://stomp-js.github.io/stomp-websocket/

---

## Bài tập (HW-6)

Test WebSocket bằng Postman (tab WebSocket) hoặc extension Simple WebSocket Client:
1. Connect tới `ws://localhost:8080/ws/websocket`
2. Subscribe `/user/queue/submissions`
3. Submit một bài → phải nhận message trong vài giây

---

## Implement thực tế

```java
// common/config/WebSocketConfig.java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }
}
```

Frontend (Next.js) sử dụng như sau:
```typescript
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  connectHeaders: { Authorization: `Bearer ${token}` }
});

client.onConnect = () => {
  client.subscribe('/user/queue/submissions', (msg) => {
    const result = JSON.parse(msg.body);
    // { submissionId: 123, status: "ACCEPTED" }
    updateUI(result);
  });
};

client.activate();
```

---

# Tổng hợp pom.xml

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

# Checklist tổng thể

## Phase 0 — Setup
- [ ] Tạo project từ start.spring.io với đúng dependencies
- [ ] `./mvnw package` build thành công
- [ ] `docker compose up -d` chạy PostgreSQL + Redis

## Phase 1 — Database
- [ ] 4 Flyway migration SQL files
- [ ] 4 Entity classes với đúng annotations
- [ ] 4 Repository interfaces
- [ ] App start → Flyway tự tạo tables (kiểm tra bằng `psql`)

## Phase 2 — REST API
- [ ] `GET /problems` trả danh sách
- [ ] `GET /problems/9999` trả 404 với message
- [ ] `POST /problems` với body thiếu field trả 400 + validation message
- [ ] GlobalExceptionHandler hoạt động

## Phase 3 — Auth
- [ ] `POST /auth/register` trả JWT
- [ ] `POST /auth/login` sai password → 401
- [ ] `GET /auth/me` không có token → 403
- [ ] `GET /auth/me` có token → trả user info
- [ ] `POST /problems` với USER role → 403

## Phase 4 — Submission
- [ ] `POST /submissions` lưu DB với status PENDING
- [ ] `redis-cli LLEN submissions_queue` tăng sau mỗi submit
- [ ] `GET /submissions/1` trả đúng data

## Phase 5 — Judge
- [ ] `docker build -t judge-java` thành công
- [ ] Java code biên dịch và chạy trong sandbox
- [ ] Infinite loop bị kill sau 2s (exit code 124)
- [ ] Network bị chặn trong sandbox
- [ ] Status cập nhật đúng sau judge (ACCEPTED / WRONG_ANSWER / TLE)

## Phase 6 — WebSocket
- [ ] Frontend nhận result ngay sau khi judge xong
- [ ] Không cần polling
