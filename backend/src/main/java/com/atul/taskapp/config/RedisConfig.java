package com.atul.taskapp.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${app.cache.ttl-tasks:600}")
    private long tasksTtlSeconds;

    @Value("${app.cache.ttl-lists:300}")
    private long listsTtlSeconds;

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .entryTtl(Duration.ofSeconds(tasksTtlSeconds))
                .disableCachingNullValues();

        RedisCacheConfiguration listsConfig = defaultConfig
                .entryTtl(Duration.ofSeconds(listsTtlSeconds));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withCacheConfiguration("tasks", defaultConfig)
                .withCacheConfiguration("users", defaultConfig)
                .withCacheConfiguration("user_tasks", listsConfig)
                .withCacheConfiguration("all_tasks", listsConfig)
                .build();
    }
}
