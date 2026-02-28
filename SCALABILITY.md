# TaskApp Scalability Note

As TaskApp grows in user volume and data complexity, the architecture must evolve to ensure high availability and low latency. The application is designed to scale horizontally, leveraging stateless capabilities, but further optimizations will be required.

## 1. Stateless Authentication & Load Balancing
The current application architecture uses stateless JWTs served via `HttpOnly` cookies. Because the backend does not maintain session state in memory, we can trivially scale out.
- **Action**: Deploy multiple instances of the TaskApp backend behind an HTTP Load Balancer (e.g., NGINX, AWS ALB).
- **Benefit**: Incoming traffic is distributed across all healthy backend nodes, preventing any single point of failure.

## 2. Distributed Caching (Redis)
High-read endpoints (such as `GET /api/tasks`) can overwhelm the primary database under heavy load. The application currently has the infrastructure laid out for Redis integration.
- **Action**: Implement `@Cacheable` on service layer read operations, and `@CacheEvict` when states change (which is already implemented in `TaskService` and `UserService`). Set TTLs (Time-to-Live) to ensure stale data is rotated automatically.
- **Benefit**: Extremely fast read responses (<5ms), drastically reducing MySQL compute and IOPS loads.

## 3. Database Scaling & Optimization
As the `tasks` and `users` tables grow to millions of rows, database access will become the primary bottleneck.
- **Scaling Up**: Utilize read replicas for computationally heavy `GET` requests (like Admin reporting), while directing all `POST/PUT/DELETE` mutations to the primary writer node.
- **Indexing**: Ensure critical lookup columns (e.g., `user_id`, `status`, `dueDate`) have appropriate B-Tree composite indexes.
- **Connection Pooling**: The application is already tuned with `HikariCP` for production (`maximum-pool-size: 20` in `application-prod.yaml`) to avoid connection churn.

## 4. Microservices Evolution
If the application boundaries expand (for instance, adding Notifications, Billing, or complex Analytics), a monolithic approach will slow down deployment capability and team velocity.
- **Action**: The current clean codebase structure allows smooth transition into microservices via Domain-Driven Design (DDD). We can extract `TaskManagement`, `UserIdentity`, and `Notification` services into isolated Spring Boot applications.
- **Benefit**: Services can scale independently. For example, the `TaskManagement` service could scale to 10 instances during peak hours, while `UserIdentity` remains at 2 instances.

## 5. Message Brokers (Asynchronous Processing)
Long-running background tasks (e.g., generating end-of-week task reports, sending email reminders) should not block HTTP threads.
- **Action**: Introduce a message broker like Apache Kafka or RabbitMQ. When a user creates a task, publish an event. A worker service consumes the event asynchronously to send an email.
- **Benefit**: Decouples heavy processing from the primary REST APIs, ensuring UI response times remain instant.
