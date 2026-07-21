package com.leetcodefake.api_service.auth.dto;

public record UserDTO(
        Long id,
        String email,
        String username,
        String role
) {}
