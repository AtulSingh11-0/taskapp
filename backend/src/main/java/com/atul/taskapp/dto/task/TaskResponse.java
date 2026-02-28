package com.atul.taskapp.dto.task;

import com.atul.taskapp.model.TaskPriority;
import com.atul.taskapp.model.TaskStatus;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

public record TaskResponse(
	Long id,
	String title,
	String description,
	TaskStatus status,
	TaskPriority priority,
	LocalDate dueDate,
	String ownerEmail,
	String ownerName,
	Instant createdAt,
	Instant updatedAt
) implements Serializable {
}
