package com.atul.taskapp.dto.user;

import java.io.Serializable;

public record UserSummary(
	Long id,
	String name,
	String email,
	String role,
	String createdAt
) implements Serializable {}
