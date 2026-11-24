package com.leetcodefake.api_service.judge.execution.process;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

public record WriterOutput(
        Thread writer,
        AtomicReference<IOException> readError
){
}
