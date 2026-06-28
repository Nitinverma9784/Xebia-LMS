package com.geeknito.LMS_backend.controller;

import com.geeknito.LMS_backend.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse("File is empty", null), HttpStatus.BAD_REQUEST);
        }

        try {
            // Ensure uploads directory exists
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Create a unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFileName);

            // Copy file content
            Files.copy(file.getInputStream(), filePath);

            // Prepare response data
            Map<String, Object> data = new HashMap<>();
            data.put("url", "/uploads/" + uniqueFileName);
            data.put("name", originalFileName);
            data.put("size", file.getSize());

            return new ResponseEntity<>(new ApiResponse("Upload successful", data), HttpStatus.OK);

        } catch (IOException e) {
            return new ResponseEntity<>(new ApiResponse("Failed to save file: " + e.getMessage(), null), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
