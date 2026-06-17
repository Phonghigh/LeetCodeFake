# Builder vs Constructor — Tradeoffs và Khi Nào Dùng

**Date**: 2026-06-15  
**Project**: LeetCodeFake  
**Tags**: #java #design-pattern #lombok #jpa #spring-boot  
**Difficulty**: easy

---

## The Problem

> Khi tạo entity trong Service layer, cần biết nên dùng constructor hay Builder pattern. Constructor tưởng đơn giản hơn nhưng gây nhiều vấn đề khi object có nhiều fields.

---

## What Stuck Me

```
Không biết Builder pattern thực sự giải quyết vấn đề gì.
Tưởng constructor là đủ vì "chỉ cần truyền args vào là xong".
Không nhận ra vấn đề order-dependency và brittleness của constructor khi class lớn.
```

---

## Approaches Researched

| Approach | Why Considered | Why Rejected / Accepted |
|----------|---------------|------------------------|
| All-args Constructor | Quen thuộc, compiler enforce types | Rejected: order-dependent, fragile khi thêm field, null args không rõ ý nghĩa |
| No-args + Setters | Linh hoạt | Rejected: object tồn tại ở trạng thái incomplete giữa các setter calls, không thread-safe |
| **Builder (Lombok @Builder)** | Named params, chỉ set fields cần thiết | **Accepted**: readable, safe, không bị break khi thêm field |

---

## The Solution

### Pattern — Builder với Lombok `@Builder`

**Name**: Builder Pattern  
**Category**: architectural / creational design pattern

Builder tách việc "cấu hình object" khỏi "tạo object". Mỗi field được set bằng tên (`title("x")`), không phải vị trí. Kết quả là immutable object sau khi `.build()` được gọi. Lombok `@Builder` generate toàn bộ boilerplate tự động.

### Key Code

```java
// Entity có @Builder
@Builder
@NoArgsConstructor  // JPA cần
@AllArgsConstructor // @Builder cần
public class Problem {
    private Long id;
    private String title;
    private Difficulty difficulty;
    private String description;
    private String constraints;
    // ... createdAt, updatedAt được @PrePersist set tự động
}

// Service tạo entity — chỉ set fields cần thiết, server-generated fields bỏ qua
Problem problem = Problem.builder()
    .title(request.title())
    .difficulty(request.difficulty())
    .description(request.description())
    .constraints(request.constraints())
    .build();  // createdAt/updatedAt được @PrePersist set khi save
```

---

## Before vs After

### Before (Constructor)

```java
// Constructor call — 9 args, toàn null ở cuối
new Problem(null, "Two Sum", Difficulty.EASY, "Find two numbers",
            "1 <= n <= 10^4", null, null, null, null);
```

**Problems with before:**
- Không biết `null` thứ 4 là gì nếu không xem class
- Đổi thứ tự field trong class → constructor gọi compile được nhưng logic sai (nếu cùng type)
- Thêm field mới → phải update mọi nơi gọi constructor
- Không thể skip optional fields mà không truyền `null`

### After (Builder)

```java
Problem.builder()
    .title("Two Sum")
    .difficulty(Difficulty.EASY)
    .description("Find two numbers")
    .constraints("1 <= n <= 10^4")
    .build();
```

**Improvements:**
- Tên field rõ ràng, đọc hiểu ngay
- Optional fields (constraints) có thể bỏ qua — Builder dùng null mặc định
- Thêm field mới vào entity → không break existing builder calls
- Server-generated fields (id, createdAt) không cần mention

### Visual Comparison

```
CONSTRUCTOR                         BUILDER
─────────────────────────────────   ─────────────────────────────────
new Problem(                        Problem.builder()
  null,          ← id?                  .title("Two Sum")
  "Two Sum",     ← title                .difficulty(EASY)
  EASY,          ← difficulty           .description("Find...")
  "Find...",     ← description          .constraints("1<=n")
  "1<=n",        ← constraints          .build();
  null,          ← createdBy?
  null,          ← updatedBy?      Server-generated fields: IGNORED
  null,          ← createdAt?      @PrePersist sets them automatically
  null           ← updatedAt?
);

Thêm field "tags":
  → BREAK mọi constructor call     → Existing builder calls unaffected
```

---

## Khi Nào Dùng Cái Nào

| Tình huống | Dùng | Lý do |
|------------|------|-------|
| JPA Entity (>3 fields) | `@Builder` | Nhiều optional/server-generated fields |
| Simple Value Object (2-3 fields) | Constructor | Overhead của Builder không cần thiết |
| DTO (record) | record constructor | `record` tự generate immutable constructor |
| Test data setup | `@Builder` | Linh hoạt, chỉ set fields relevant cho test |
| Config object | `@Builder` | Thường có nhiều optional settings |

### Rule ngón tay cái

```
≤ 3 fields, tất cả required  →  Constructor
≥ 4 fields hoặc có optional  →  Builder
JPA Entity (bao giờ cũng)    →  Builder
```

---

## Gotcha: `@Builder` + `@NoArgsConstructor` + `@AllArgsConstructor`

JPA yêu cầu no-args constructor. Lombok `@Builder` generate all-args constructor riêng. Cần cả 3 annotations cùng nhau:

```java
@Builder
@NoArgsConstructor   // JPA dùng khi load từ DB
@AllArgsConstructor  // @Builder dùng internally
public class Problem { ... }
```

Thiếu `@NoArgsConstructor` → JPA throw exception lúc runtime khi query.

---

## Key Takeaways

1. **Constructor tốt khi ít fields, Builder tốt khi nhiều fields hoặc optional fields** — threshold thực tế: 4+ fields → dùng Builder.
2. **Builder không phải về immutability, mà về readability và resilience** — code không break khi schema thêm field.
3. **Server-generated fields không cần appear trong Builder call** — `@PrePersist` lo phần đó, Builder chỉ cần set những gì client cung cấp.
4. **`record` là Builder built-in cho DTOs** — dùng record cho DTO, `@Builder` cho Entity.

---

## Related Problems / Patterns

- [[jpa-entity-design-patterns]]
- [[dto-pattern-entity-mapping]]

---

## Next Time Checklist

- [ ] Entity có ≥ 4 fields → thêm `@Builder` + `@NoArgsConstructor` + `@AllArgsConstructor`
- [ ] Các fields được `@PrePersist` set → không cần trong Builder call
- [ ] DTO → dùng `record` thay vì class + Builder
- [ ] Viết test → Builder đặc biệt hữu ích để tạo test objects với chỉ relevant fields
