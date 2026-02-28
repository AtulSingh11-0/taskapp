package com.atul.taskapp.service;

import com.atul.taskapp.dto.PagedResponse;
import com.atul.taskapp.dto.task.CreateTaskRequest;
import com.atul.taskapp.dto.task.TaskResponse;
import com.atul.taskapp.dto.task.UpdateTaskRequest;
import com.atul.taskapp.exception.ResourceNotFoundException;
import com.atul.taskapp.model.Task;
import com.atul.taskapp.model.TaskStatus;
import com.atul.taskapp.model.User;
import com.atul.taskapp.repository.TaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class TaskService {

  private static final Logger log = LoggerFactory.getLogger(TaskService.class);

  private final TaskRepository taskRepository;

  public TaskService(TaskRepository taskRepository) {
    this.taskRepository = taskRepository;
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "user_tasks", allEntries = true),
      @CacheEvict(value = "all_tasks", allEntries = true)
  })
  public TaskResponse createTask(CreateTaskRequest request, User currentUser) {
    // step-1: build the task entity from the request
    Task task = Task.builder()
        .title(request.title())
        .description(request.description())
        .status(request.status() != null ? request.status() : TaskStatus.TODO)
        .priority(request.priority())
        .dueDate(request.dueDate())
        .user(currentUser)
        .build();

    // step-2: save the task to the database
    Task saved = taskRepository.save(task);
    log.info("Task created: id={}, user={}", saved.getId(), currentUser.getEmail());

    // step-3: map the saved entity to a response dto and return
    return mapToResponse(saved);
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "tasks", key = "#taskId")
  public TaskResponse getTaskById(Long taskId, User currentUser) {
    log.debug("Cache miss — loading task id={} from DB", taskId);

    // step-1: fetch the task by id and check access
    Task task = findTaskByIdAndCheckAccess(taskId, currentUser);

    // step-2: map and return response
    return mapToResponse(task);
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "user_tasks", key = "#currentUser.id + ':page:' + #pageable.pageNumber + ':size:' + #pageable.pageSize + ':sort:' + #pageable.sort.toString()")
  public PagedResponse<TaskResponse> getMyTasks(User currentUser, Pageable pageable) {
    log.debug("Cache miss — loading tasks for user={} from DB", currentUser.getEmail());
    Page<Task> page = taskRepository.findByUserId(currentUser.getId(), pageable);
    return toPagedResponse(page);
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "all_tasks", key = "'page:' + #pageable.pageNumber + ':size:' + #pageable.pageSize + ':sort:' + #pageable.sort.toString()")
  public PagedResponse<TaskResponse> getAllTasks(Pageable pageable) {
    log.debug("Cache miss — loading all tasks from DB");
    Page<Task> page = taskRepository.findAll(pageable);
    return toPagedResponse(page);
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "tasks", key = "#taskId"),
      @CacheEvict(value = "user_tasks", allEntries = true),
      @CacheEvict(value = "all_tasks", allEntries = true)
  })
  public TaskResponse updateTask(Long taskId, UpdateTaskRequest request, User currentUser) {
    Task task = findTaskByIdAndCheckAccess(taskId, currentUser);

    if (request.title() != null) {
      task.setTitle(request.title());
    }
    if (request.description() != null) {
      task.setDescription(request.description());
    }
    if (request.status() != null) {
      task.setStatus(request.status());
    }
    if (request.priority() != null) {
      task.setPriority(request.priority());
    }
    if (request.dueDate() != null) {
      task.setDueDate(request.dueDate());
    }

    Task updated = taskRepository.save(task);
    log.info("Task updated: id={}, user={}", updated.getId(), currentUser.getEmail());
    return mapToResponse(updated);
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "tasks", key = "#taskId"),
      @CacheEvict(value = "user_tasks", allEntries = true),
      @CacheEvict(value = "all_tasks", allEntries = true)
  })
  public void deleteTask(Long taskId, User currentUser) {
    // step-1: fetch the task by id and check access
    Task task = findTaskByIdAndCheckAccess(taskId, currentUser);

    // step-3: delete the task and log the action
    taskRepository.delete(task);
    log.info("Task deleted: id={}, user={}", taskId, currentUser.getEmail());
  }

  @Transactional
  @Caching(evict = {
      @CacheEvict(value = "tasks", key = "#taskId"),
      @CacheEvict(value = "all_tasks", allEntries = true)
  })
  public void adminDeleteTask(Long taskId) {
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
    taskRepository.delete(task);
    log.info("Task deleted by admin: id={}", taskId);
  }

  private Task findTaskByIdAndCheckAccess(Long taskId, User currentUser) {
    // step-1: fetch the task by id or throw exception
    Task task = taskRepository.findById(taskId)
        .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

    // step-2: check if the current user is the owner of the task or has admin role
    if (!task.getUser().getId().equals(currentUser.getId()) &&
        currentUser.getAuthorities().stream()
            .noneMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"))) {
      throw new AccessDeniedException("You do not have access to this task");
    }
    return task;
  }

  private TaskResponse mapToResponse(Task task) {
    return new TaskResponse(
        task.getId(),
        task.getTitle(),
        task.getDescription(),
        task.getStatus(),
        task.getPriority(),
        task.getDueDate(),
        task.getUser().getEmail(),
        task.getUser().getName(),
        task.getCreatedAt(),
        task.getUpdatedAt());
  }

  private PagedResponse<TaskResponse> toPagedResponse(Page<Task> page) {
    return new PagedResponse<>(
        page.getContent().stream().map(this::mapToResponse).toList(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }
}
