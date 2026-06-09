package com.leetcodefake.api_service.submission;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Table;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import com.leetcodefake.api_service.user.User;
import com.leetcodefake.api_service.problem.Problem;

import java.time.LocalDateTime;

import com.leetcodefake.api_service.common.enums.Language;
import com.leetcodefake.api_service.common.enums.SubmissionStatus;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Table(name = "submissions")
public class Submission {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", referencedColumnName = "id")
    private Problem problem;

    @Column(nullable = false, name = "source_code", columnDefinition = "TEXT")
    private String sourceCode;
    
    @Column(nullable = false)
    private Language language;

    private int runtime;
    private int memory;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    @Column(nullable = false, name = "created_by")
    private String createdBy;
    @Column(nullable = false, name = "updated_by")
    private String updatedBy;
    @Column(nullable = false, name = "created_at")
    private LocalDateTime createdAt;
    @Column(nullable = false, name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
