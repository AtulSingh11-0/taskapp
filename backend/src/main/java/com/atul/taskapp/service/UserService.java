package com.atul.taskapp.service;

import com.atul.taskapp.dto.user.UserSummary;
import com.atul.taskapp.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

  private static final Logger log = LoggerFactory.getLogger(UserService.class);

  private final UserRepository userRepository;

  public UserService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  @Cacheable(value = "users", key = "'all'")
  public List<UserSummary> getAllUsers() {
    log.debug("Cache miss — loading all users from DB");

    // step-1: fetch all users from database
    // step-2: map each user to a user summary dto
    // step-3: collect into list and return
    return userRepository.findAll().stream()
        .map(u -> new UserSummary(
            u.getId(),
            u.getName(),
            u.getEmail(),
            u.getRole().name(),
            u.getCreatedAt() != null ? u.getCreatedAt().toString() : null))
        .toList();
  }
}
