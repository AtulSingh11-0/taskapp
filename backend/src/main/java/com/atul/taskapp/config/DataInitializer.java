package com.atul.taskapp.config;

import com.atul.taskapp.model.*;
import com.atul.taskapp.repository.TaskRepository;
import com.atul.taskapp.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

  private final UserRepository userRepository;
  private final TaskRepository taskRepository;
  private final PasswordEncoder passwordEncoder;
  private final ObjectMapper objectMapper;

  public DataInitializer(
      UserRepository userRepository,
      TaskRepository taskRepository,
      PasswordEncoder passwordEncoder,
      ObjectMapper objectMapper) {
    this.userRepository = userRepository;
    this.taskRepository = taskRepository;
    this.passwordEncoder = passwordEncoder;
    this.objectMapper = objectMapper;
  }

  @Override
  public void run(String @NonNull ... args) throws Exception {
    if (userRepository.count() > 0) {
      log.info("Database already seeded — skipping initialization");
      return;
    }

    log.info("Database is empty — seeding from JSON files...");

    // load and save users
    List<SeedUser> seedUsers = loadJson("seed/users.json", new TypeReference<>() {
    });
    Map<String, User> emailToUser = seedUsers.stream()
        .map(su -> {
          User user = User.builder()
              .name(su.name())
              .email(su.email())
              .password(passwordEncoder.encode(su.password()))
              .role(Role.valueOf(su.role()))
              .build();
          return userRepository.save(user);
        })
        .collect(Collectors.toMap(User::getEmail, u -> u));

    log.info("Seeded {} users", emailToUser.size());

    // load and save tasks
    List<SeedTask> seedTasks = loadJson("seed/tasks.json", new TypeReference<>() {
    });
    int taskCount = 0;
    for (SeedTask st : seedTasks) {
      User owner = emailToUser.get(st.ownerEmail());
      if (owner == null) {
        log.warn("Skipping task '{}': owner email '{}' not found", st.title(), st.ownerEmail());
        continue;
      }

      Task task = Task.builder()
          .title(st.title())
          .description(st.description())
          .status(TaskStatus.valueOf(st.status()))
          .priority(TaskPriority.valueOf(st.priority()))
          .dueDate(LocalDate.parse(st.dueDate()))
          .user(owner)
          .build();

      taskRepository.save(task);
      taskCount++;
    }

    log.info("Seeded {} tasks", taskCount);
    log.info("Database initialization complete!");
  }

  private <T> T loadJson(String path, TypeReference<T> typeRef) throws Exception {
    ClassPathResource resource = new ClassPathResource(path);
    try (InputStream is = resource.getInputStream()) {
      return objectMapper.readValue(is, typeRef);
    }
  }

  // seed data records

  private record SeedUser(String name, String email, String password, String role) {
  }

  private record SeedTask(String title, String description, String status, String priority,
      String dueDate, String ownerEmail) {
  }
}
