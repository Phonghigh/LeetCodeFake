package com.leetcodefake.api_service.redisService;

import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RedisQueueService {
    private final RedisTemplate<Object, Object> redisTemplate;
    private final ListOperations<Object, Object> listOps;

    public RedisQueueService(RedisTemplate<Object, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.listOps = redisTemplate.opsForList();
    }

    // Equivalent to LPUSH
    public void enqueue(String queueKey, Object value) {
        listOps.leftPush(queueKey, value);
    }

    // Equivalent to RPOP
    public Object dequeue(String queueKey) {
        return listOps.rightPop(queueKey);
    }
}
