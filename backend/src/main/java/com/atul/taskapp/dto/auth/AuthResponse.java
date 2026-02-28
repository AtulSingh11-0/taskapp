package com.atul.taskapp.dto.auth;

public record AuthResponse(
	String email,
	String role,
	String name
) {
}
