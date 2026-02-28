package com.atul.taskapp.dto.task;

import com.atul.taskapp.model.TaskPriority;
import com.atul.taskapp.model.TaskStatus;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UpdateTaskRequest(
	@Size(min = 1, max = 200, message = "Title must be between 1 and 200 characters")
	String title,

	@Size(max = 5000, message = "Description must not exceed 5000 characters")
	String description,

	TaskStatus status,
	TaskPriority priority,

	@FutureOrPresent(message = "Due date must be today or in the future")
	LocalDate dueDate
) {
}
