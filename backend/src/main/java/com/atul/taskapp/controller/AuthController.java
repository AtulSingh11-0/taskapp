package com.atul.taskapp.controller;

import com.atul.taskapp.dto.auth.AuthResponse;
import com.atul.taskapp.dto.auth.LoginRequest;
import com.atul.taskapp.dto.auth.RegisterRequest;
import com.atul.taskapp.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/auth", version = "1+")
@Tag(name = "Authentication", description = "User registration and login")
public class AuthController {

  private final AuthService authService;

  @Value("${app.jwt.cookie.secure:false}")
  private boolean secureCookie;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @Operation(summary = "Register a new user", description = "Creates a new user account and returns a JWT token in an HttpOnly cookie")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    // step-1: register the user using the auth service
    AuthService.AuthResult result = authService.register(request);

    // step-2: create a httponly cookie containing the jwt
    ResponseCookie cookie = createJwtCookie(result.token());

    // step-3: return the response entity with the set-cookie header
    return ResponseEntity.status(HttpStatus.CREATED)
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(result.response());
  }

  @PostMapping("/login")
  @Operation(summary = "Login", description = "Authenticates user credentials and returns a JWT token in an HttpOnly cookie")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    // step-1: verify credentials and fetch user data via auth service
    AuthService.AuthResult result = authService.login(request);

    // step-2: create a httponly cookie containing the jwt
    ResponseCookie cookie = createJwtCookie(result.token());

    // step-3: return the response entity with the set-cookie header
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .body(result.response());
  }

  @PostMapping("/logout")
  @Operation(summary = "Logout", description = "Clears the JWT HttpOnly cookie")
  public ResponseEntity<Void> logout() {
    // step-1: construct an expired httponly cookie to clear the session
    ResponseCookie cookie = ResponseCookie.from("jwt", "")
        .httpOnly(true)
        .secure(secureCookie)
        .path("/")
        .maxAge(0) // expire immediately
        .sameSite("Strict")
        .build();

    // step-2: return response entity with the expired cookie
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, cookie.toString())
        .build();
  }

  private ResponseCookie createJwtCookie(String token) {
    // step-1: encapsulate the raw token into a secure httponly cookie
    return ResponseCookie.from("jwt", token)
        .httpOnly(true)
        .secure(secureCookie)
        .path("/")
        .maxAge(24 * 60 * 60)
        .sameSite("Strict")
        .build();
  }
}
