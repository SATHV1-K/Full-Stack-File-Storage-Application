package com.example.fileplatform.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
public class HealthCheckController {

    /**
     * A simple health check endpoint to confirm the backend is operational.
     * The @CrossOrigin annotation is added to allow requests from our frontend development server.
     */
    @CrossOrigin(origins = "http://localhost:5173") // Allow requests from Vite's default port
    @GetMapping("/api/health")
    public String healthCheck() {
        return "Backend is running!";
    }
}