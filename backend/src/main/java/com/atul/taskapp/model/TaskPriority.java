package com.atul.taskapp.model;

public enum TaskPriority {
  HIGH(0),
  MEDIUM(1),
  LOW(2);

  private final int order;

  TaskPriority(int order) {
    this.order = order;
  }

  public int getOrder() {
    return order;
  }
}
