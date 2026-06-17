# JPA Entity Design — Common Annotation Mistakes and Patterns

**Date**: 2026-06-14  
**Project**: LeetCodeFake  
**Tags**: #jpa #spring-boot #hibernate #entity #lombok #dto  
**Difficulty**: medium

---

## The Problem

> Xây dựng 4 JPA Entity classes (User, Problem, TestCase, Submission) với đầy đủ annotations. Gặp nhiều lỗi do hiểu nhầm về chỗ đặt annotations và cardinality của relationships.

---

## What Stuck Me

```
1. Đặt @Enumerated(EnumType.STRING) lên enum class thay vì lên field trong Entity.
2. Đặt @PrePersist lên field thay vì lên method.
3. Dùng @OneToOne cho Submission.user/problem — nhầm cardinality.
4. Field names snake_case trong Java (created_at) thay vì camelCase (createdAt).
```

---

## Approaches Researched

| Approach | Why Considered | Why Rejected / Accepted |
|----------|---------------|------------------------|
| `@Enumerated` trên enum class | Tưởng annotation thuộc về enum | **Rejected**: Annotation này là JPA mapping hint cho field, không phải type declaration |
| `@PrePersist` trên field | Tưởng annotation set giá trị default | **Rejected**: `@PrePersist` là lifecycle callback, phải đặt lên method |
| `@OneToOne` cho Submission↔User | Một submission thuộc một user | **Rejected**: Một user CÓ NHIỀU submissions — cardinality là ManyToOne |
| **`@ManyToOne(fetch = FetchType.LAZY)`** | Đúng cardinality, lazy để tránh N+1 | **Accepted** |

---

## The Solution

### Pattern 1 — `@Enumerated` đặt trên FIELD, không phải enum class

**Name**: JPA field-level mapping annotation  
**Category**: architectural

`@Enumerated(EnumType.STRING)` nói với Hibernate: "khi lưu field này vào DB, lưu dạng String ('ADMIN') thay vì số (1)". Đây là mapping instruction cho field trong Entity — enum class bản thân không cần biết về JPA.

```java
// WRONG — enum class không cần annotation này
@Enumerated(EnumType.STRING)
public enum Role { USER, ADMIN }

// CORRECT — annotation đặt trên field trong Entity
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private Role role;
```

### Pattern 2 — `@PrePersist` là lifecycle callback METHOD

**Name**: JPA Entity Lifecycle Callback  
**Category**: architectural

Hibernate gọi method annotated `@PrePersist` tự động ngay trước khi INSERT. Method này set các server-generated fields để caller không cần nhớ set tay.

```java
@PrePersist
void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
}

@PreUpdate
void onUpdate() {
    this.updatedAt = LocalDateTime.now();
}
```

### Pattern 3 — Cardinality: đọc từ domain logic, không đoán

**Name**: Relationship cardinality analysis  
**Category**: mental model

Câu hỏi: "Một User có BAO NHIÊU Submission?" → Nhiều → `@ManyToOne` phía Submission.  
Không đặt `@OneToOne` trừ khi thực sự 1-1 (ví dụ: User ↔ UserProfile).

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;
```

---

## Before vs After

### Before

```java
// Enum class có annotation sai chỗ
@Enumerated(EnumType.STRING)
public enum Role { USER, ADMIN }

// Field không có annotation
private String role; // String thay vì enum

// @PrePersist sai chỗ
@PrePersist
@Column(nullable = false, name = "created_at")
private LocalDateTime createdAt;

// Cardinality sai
@OneToOne
@JoinColumn(name = "user_id")
private User user;

// Field naming sai convention
private LocalDateTime created_at;
```

**Problems with before:**
- `@Enumerated` trên enum class → compiler error "annotation not applicable"
- `@PrePersist` trên field → không có lifecycle callback nào được gọi, `createdAt` luôn `null`
- `@OneToOne` → DB constraint sai, mỗi user chỉ có 1 submission
- `created_at` snake_case → Hibernate map sai column name nếu không có `@Column(name=...)`

### After

```java
// Enum class clean, không cần annotation
public enum Role { USER, ADMIN }

// Field đúng type + annotation đúng chỗ
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private Role role;

// @PrePersist trên method
@PrePersist
void onCreate() {
    this.createdAt = LocalDateTime.now();
    this.updatedAt = LocalDateTime.now();
}

// Cardinality đúng + LAZY
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;

// camelCase + explicit column mapping
@Column(name = "created_at", nullable = false)
private LocalDateTime createdAt;
```

**Improvements:**
- Compile clean
- `createdAt`/`updatedAt` tự động set — caller không cần nhớ
- FetchType.LAZY tránh N+1 query khi load list submissions
- Column mapping rõ ràng, không phụ thuộc naming convention của Hibernate

### Visual Comparison

```
BEFORE                              AFTER
──────────────────────────────────  ──────────────────────────────────
@Enumerated trên enum class         @Enumerated trên field trong Entity
        ↓                                   ↓
  compiler error                     Hibernate map đúng STRING value

@PrePersist trên field              @PrePersist trên void method()
        ↓                                   ↓
  không được gọi, null                auto-called trước INSERT

@OneToOne User user                 @ManyToOne(LAZY) User user
        ↓                                   ↓
  1 user = max 1 submission          1 user = nhiều submissions
```

---

## Why This Is Better

| Dimension | Before | After |
|-----------|--------|-------|
| Compile | Fail — annotation sai chỗ | Pass clean |
| createdAt | null vì @PrePersist không được gọi | Auto-set trước INSERT |
| Submission cardinality | Max 1 submission/user (sai) | Unlimited submissions/user |
| Query performance | EAGER load (tiềm năng N+1) | LAZY load — fetch khi cần |
| Field naming | snake_case gây nhầm lẫn | camelCase + explicit @Column mapping |

---

## Key Takeaways

1. **Annotation đặt ở đâu thì nó "nói chuyện" với đối tượng đó** — `@Enumerated` nói với field, không phải enum class; `@PrePersist` activate method, không phải field.
2. **Cardinality = đọc domain logic** — "1 User có BAO NHIÊU X?" → từ đó suy ra `@OneToOne` / `@ManyToOne` / `@ManyToMany`.
3. **Default FetchType.LAZY cho mọi `@ManyToOne`** — EAGER là nguy hiểm với list queries (N+1 problem).
4. **Java fields luôn camelCase** — dùng `@Column(name = "snake_case")` để map sang DB convention.

---

## Related Problems / Patterns

- [[jpa-lazy-vs-eager-fetching]]
- [[dto-pattern-entity-mapping]]
- [[spring-data-jpa-repository-naming]]

---

## Next Time Checklist

- [ ] Khi thêm annotation mới: hỏi "annotation này thuộc về class, field, hay method?"
- [ ] Khi thiết kế relationship: viết câu "1 X có bao nhiêu Y?" trước khi chọn annotation
- [ ] Luôn thêm `FetchType.LAZY` vào `@ManyToOne` và `@ManyToMany`
- [ ] Server-generated fields (timestamps, status) → dùng `@PrePersist`, không để caller set
