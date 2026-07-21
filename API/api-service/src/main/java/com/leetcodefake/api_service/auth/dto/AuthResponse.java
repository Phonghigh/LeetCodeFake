package com.leetcodefake.api_service.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String email,
        String role
) {}
