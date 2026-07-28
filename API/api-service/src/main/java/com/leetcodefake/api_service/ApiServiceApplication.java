package com.leetcodefake.api_service;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiServiceApplication {

	public static void main(String[] args) {
		// The JVM resolves the Windows "SE Asia Standard Time" zone to the legacy IANA alias
		// "Asia/Saigon", which the Postgres container's tzdata doesn't recognize.
		// TimeZone.setDefault (not System.setProperty) is required here: setProperty has no
		// effect once anything has already called TimeZone.getDefault() and cached it.
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
		SpringApplication.run(ApiServiceApplication.class, args);
	}

}
