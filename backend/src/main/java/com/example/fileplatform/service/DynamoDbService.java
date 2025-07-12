package com.example.fileplatform.service;

import com.example.fileplatform.model.FileMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.Key;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;

@Service
public class DynamoDbService {

    private final DynamoDbTable<FileMetadata> fileMetadataTable;
    public static final String TABLE_NAME = "file-metadata";

    @Autowired
    public DynamoDbService(DynamoDbClient dynamoDbClient) {
        DynamoDbEnhancedClient enhancedClient = DynamoDbEnhancedClient.builder()
                .dynamoDbClient(dynamoDbClient)
                .build();

        this.fileMetadataTable = enhancedClient.table(TABLE_NAME, TableSchema.fromBean(FileMetadata.class));
    }

    public void saveMetadata(FileMetadata metadata) {
        fileMetadataTable.putItem(metadata);
        System.out.println("Successfully saved metadata for file: " + metadata.getFileName());
    }

    public void deleteMetadata(String fileName) {
        Key key = Key.builder().partitionValue(fileName).build();
        fileMetadataTable.deleteItem(key);
        System.out.println("Successfully deleted metadata for file: " + fileName);
    }
}