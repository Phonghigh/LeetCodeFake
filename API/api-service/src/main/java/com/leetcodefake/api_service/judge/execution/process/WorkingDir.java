package com.leetcodefake.api_service.judge.execution.process;

import lombok.Getter;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.SimpleFileVisitor;

@Getter
public class WorkingDir implements AutoCloseable{
    private final Path path;

    public WorkingDir(Path path) {
        this.path = path;
    }

    @Override
    public void close() throws IOException {
        File file = path.toFile();
        if (file.exists()) {
            Files.walkFileTree(path, new SimpleFileVisitor<>() {
                @Override
                public java.nio.file.FileVisitResult visitFile(java.nio.file.Path file, java.nio.file.attribute.BasicFileAttributes attrs) throws IOException {
                    Files.delete(file);
                    return java.nio.file.FileVisitResult.CONTINUE;
                }

                @Override
                public java.nio.file.FileVisitResult postVisitDirectory(java.nio.file.Path dir, IOException exc) throws IOException {
                    Files.delete(dir);
                    return java.nio.file.FileVisitResult.CONTINUE;
                }

            });
        }
    }
}
