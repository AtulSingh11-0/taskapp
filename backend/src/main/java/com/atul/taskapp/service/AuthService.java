package com.atul.taskapp.service;

import com.atul.taskapp.dto.auth.AuthResponse;
import com.atul.taskapp.dto.auth.LoginRequest;
import com.atul.taskapp.dto.auth.RegisterRequest;
import com.atul.taskapp.exception.DuplicateResourceException;
import com.atul.taskapp.model.Role;
import com.atul.taskapp.model.User;
import com.atul.taskapp.repository.UserRepository;
import com.atul.taskapp.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

  private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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

  public record AuthResult(String token, AuthResponse response) {
  }

  @Transactional
  public AuthResult register(RegisterRequest request) {
    // step-1: check if user with given email already exists
    if (userRepository.existsByEmail(request.email())) {
      throw new DuplicateResourceException("User", "email", request.email());
    }

    // step-2: create a new user entity and save it
    User user = User.builder()
        .name(request.name())
        .email(request.email())
        .password(passwordEncoder.encode(request.password()))
        .role(Role.USER)
        .build();

    userRepository.save(user);
    log.info("User registered successfully: {}", user.getEmail());

    // step-3: generate jwt token for the new user
    String token = jwtService.generateToken(
        Map.of("role", user.getRole().name()),
        user);

    // step-4: prepare and return auth result
    AuthResponse response = new AuthResponse(user.getEmail(), user.getRole().name(), user.getName());
    return new AuthResult(token, response);
  }

  public AuthResult login(LoginRequest request) {
    // step-1: authenticate user credentials
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email(), request.password()));

    // step-2: fetch user by email
    User user = userRepository.findByEmail(request.email())
        .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

    // step-3: generate jwt token
    String token = jwtService.generateToken(
        Map.of("role", user.getRole().name()),
        user);

    log.info("User logged in successfully: {}", user.getEmail());

    // step-4: prepare and return auth result
    AuthResponse response = new AuthResponse(user.getEmail(), user.getRole().name(), user.getName());
    return new AuthResult(token, response);
  }
}
