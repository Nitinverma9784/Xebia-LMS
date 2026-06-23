package com.geeknito.LMS_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class LMSBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LMSBackendApplication.class, args);
    }
}
