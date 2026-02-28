package com.atul.taskapp.controller;

import com.atul.taskapp.dto.PagedResponse;
import com.atul.taskapp.dto.task.TaskResponse;
import com.atul.taskapp.dto.user.UserSummary;
import com.atul.taskapp.service.TaskService;
import com.atul.taskapp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/admin", version = "1+")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only management endpoints")
public class AdminController {

  private final TaskService taskService;
  private final UserService userService;

  public AdminController(
    TaskService taskService,
    UserService userService
  ) {
    this.taskService = taskService;
    this.userService = userService;
  }

  @GetMapping("/tasks")
  @Operation(summary = "Get all tasks (Admin)", description = "Returns paginated list of all tasks across all users")
  public ResponseEntity<PagedResponse<TaskResponse>> getAllTasks(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createdAt") String sortBy,
    @RequestParam(defaultValue = "desc") String sortDir
  ) {
    // step-1: map priority sort parameter
    String effectiveSortBy = "priority".equalsIgnoreCase(sortBy) ? "priorityOrder" : sortBy;

    // step-2: setup spring pageable with sorting
    Sort sort = sortDir.equalsIgnoreCase("asc")
        ? Sort.by(effectiveSortBy).ascending()
        : Sort.by(effectiveSortBy).descending();
    Pageable pageable = PageRequest.of(page, size, sort);

    // step-3: fetch all paginated tasks via service
    PagedResponse<TaskResponse> response = taskService.getAllTasks(pageable);

    // step-4: return payload with ok status
    return ResponseEntity.ok(response);
  }

  @GetMapping("/users")
  @Operation(summary = "Get all users (Admin)", description = "Returns a list of all registered users")
  public ResponseEntity<List<UserSummary>> getAllUsers() {
    // step-1: fetch and return all users from service wrapped in a response entity
    return ResponseEntity.ok(userService.getAllUsers());
  }

  @DeleteMapping("/tasks/{id}")
  @Operation(summary = "Delete any task (Admin)", description = "Deletes any task by ID regardless of ownership")
  public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
    // step-1: invoke admin bypass deletion in service
    taskService.adminDeleteTask(id);

    // step-2: return successful empty response
    return ResponseEntity.noContent().build();
  }
}
