package com.leetcodefake.api_service.auth;

import com.leetcodefake.api_service.auth.dto.AuthResponse;
import com.leetcodefake.api_service.auth.dto.LoginRequest;
import com.leetcodefake.api_service.auth.dto.RegisterRequest;
import com.leetcodefake.api_service.auth.dto.UserDTO;
import com.leetcodefake.api_service.common.enums.Role;
import com.leetcodefake.api_service.common.exception.ResourceNotFoundException;
import com.leetcodefake.api_service.security.JwtService;
import com.leetcodefake.api_service.user.User;
import com.leetcodefake.api_service.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("Username already taken");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .createdBy("system")
                .updatedBy("system")
                .build();
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getRole().name());
    }

    public UserDTO me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return new UserDTO(user.getId(), user.getEmail(), user.getUsername(), user.getRole().name());
    }
}
