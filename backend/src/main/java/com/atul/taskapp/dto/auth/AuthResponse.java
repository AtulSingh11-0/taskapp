package com.atul.taskapp.dto.auth;

public record AuthResponse(
		String token,
		String email,
		String role,
		String name) {
}
