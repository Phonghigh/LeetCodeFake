package com.leetcodefake.api_service.judge;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

public record ReaderOutput(
        Thread reader,
        ByteArrayOutputStream outputStream,
        AtomicBoolean memoryLimitExceeded,
        AtomicReference<IOException> readError
){
}
