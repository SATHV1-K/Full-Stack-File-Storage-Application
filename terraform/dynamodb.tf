# Define the DynamoDB table for storing file metadata
resource "aws_dynamodb_table" "file_metadata_table" {
  name         = "file-metadata"
  hash_key     = "fileName"

  attribute {
    name = "fileName"
    type = "S"
  }

  stream_enabled   = true
  stream_view_type   = "NEW_IMAGE"
  billing_mode   = "PAY_PER_REQUEST"
}