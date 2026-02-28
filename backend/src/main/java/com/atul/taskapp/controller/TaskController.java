package com.atul.taskapp.controller;

import com.atul.taskapp.dto.PagedResponse;
import com.atul.taskapp.dto.task.CreateTaskRequest;
import com.atul.taskapp.dto.task.TaskResponse;
import com.atul.taskapp.dto.task.UpdateTaskRequest;
import com.atul.taskapp.model.User;
import com.atul.taskapp.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/tasks", version = "1+")
@Tag(name = "Tasks", description = "Task CRUD operations for authenticated users")
public class TaskController {

  private final TaskService taskService;

  public TaskController(TaskService taskService) {
    this.taskService = taskService;
  }

  @PostMapping
  @Operation(summary = "Create a task", description = "Creates a new task for the authenticated user")
  public ResponseEntity<TaskResponse> createTask(
    @Valid @RequestBody CreateTaskRequest request,
    @AuthenticationPrincipal User currentUser
  ) {
    // step-1: process the creation request through the task service
    TaskResponse response = taskService.createTask(request, currentUser);

    // step-2: return standard ok created response
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @GetMapping
  @Operation(summary = "Get my tasks", description = "Returns paginated list of the authenticated user's tasks")
  public ResponseEntity<PagedResponse<TaskResponse>> getMyTasks(
    @AuthenticationPrincipal User currentUser,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy,
    @RequestParam(defaultValue = "desc") String sortDir
  ) {

    // step-1: determine effective sort field mapping
    String effectiveSortBy = "priority".equalsIgnoreCase(sortBy) ? "priorityOrder" : sortBy;

    // step-2: build spring data pagination and sorting objects
    Sort sort = sortDir.equalsIgnoreCase("asc")
        ? Sort.by(effectiveSortBy).ascending()
        : Sort.by(effectiveSortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);

    // step-3: retrieve paginated tasks for the current user
    PagedResponse<TaskResponse> response = taskService.getMyTasks(currentUser, pageable);

    // step-4: return the response encapsulated in a response entity
    return ResponseEntity.ok(response);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Get a task by ID", description = "Returns a specific task (owned by user or admin)")
  public ResponseEntity<TaskResponse> getTaskById(
    @PathVariable Long id,
    @AuthenticationPrincipal User currentUser
  ) {
    // step-1: retrieve the specific task ensuring ownership permissions
    TaskResponse response = taskService.getTaskById(id, currentUser);

    // step-2: return standard ok response
    return ResponseEntity.ok(response);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update a task", description = "Updates a task (partial update supported)")
  public ResponseEntity<TaskResponse> updateTask(
    @PathVariable Long id,
    @Valid @RequestBody UpdateTaskRequest request,
    @AuthenticationPrincipal User currentUser
  ) {
    // step-1: apply the valid update request through the task service
    TaskResponse response = taskService.updateTask(id, request, currentUser);

    // step-2: return the newly updated task object
    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a task", description = "Deletes a task owned by the authenticated user")
  public ResponseEntity<Void> deleteTask(
    @PathVariable Long id,
    @AuthenticationPrincipal User currentUser
  ) {
    // step-1: invoke deletion in the task service with proper authorization constraints
    taskService.deleteTask(id, currentUser);

    // step-2: return standard no content response upon successful clean deletion
    return ResponseEntity.noContent().build();
  }
}
