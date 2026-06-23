package com.geeknito.LMS_backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:postgresql://localhost:5432/lms_test",
    "spring.datasource.username=postgres",
    "spring.datasource.password=password",
    "spring.jpa.hibernate.ddl-auto=none"
})
class LMSBackendApplicationTests {

    @Test
    void contextLoads() {
    }
}
