package com.example.fileplatform.controller;

import com.example.fileplatform.model.FileMetadata;
import com.example.fileplatform.service.DynamoDbService;
import com.example.fileplatform.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
public class FileUploadController {

    private final S3Service s3Service;
    private final DynamoDbService dynamoDbService;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Autowired
    public FileUploadController(S3Service s3Service, DynamoDbService dynamoDbService) {
        this.s3Service = s3Service;
        this.dynamoDbService = dynamoDbService;
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping("/api/upload")
    public ResponseEntity<Map<String, String>> handleFileUpload(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Upload the file to S3
            String fileUrl = s3Service.uploadFile(bucketName, file);
            System.out.println("File uploaded to S3: " + fileUrl);

            // 2. Create metadata object
            FileMetadata metadata = new FileMetadata(
                    fileUrl,
                    file.getOriginalFilename(),
                    System.currentTimeMillis()
            );

            // 3. Save metadata to DynamoDB
            dynamoDbService.saveMetadata(metadata);

            Map<String, String> response = Map.of(
                "message", "File uploaded and metadata saved successfully!",
                "url", fileUrl
            );
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            Map<String, String> response = Map.of("message", "Error processing file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @DeleteMapping("/api/delete/{fileKey}")
    public ResponseEntity<Map<String, String>> handleDeleteFile(@PathVariable String fileKey) {
        try {
            // 1. Delete the file from S3
            s3Service.deleteFile(bucketName, fileKey);
            System.out.println("File deleted from S3: " + fileKey);

            // 2. Delete metadata from DynamoDB
            dynamoDbService.deleteMetadata(fileKey);

            Map<String, String> response = Map.of("message", "File deleted successfully!");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> response = Map.of("message", "Error deleting file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}