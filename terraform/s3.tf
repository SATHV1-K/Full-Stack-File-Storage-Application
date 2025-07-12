# Define the S3 bucket for storing uploaded files
resource "aws_s3_bucket" "file_upload_bucket" {
  bucket = "file-uploading-project-bucket-${random_id.bucket_suffix.hex}" # Creates a unique bucket name

  tags = {
    Name    = "FileUploadBucket"
    Project = "FileUploadingProject"
  }
}

# A random suffix to ensure the S3 bucket name is unique
resource "random_id" "bucket_suffix" {
  byte_length = 8
}

# Block all public access to the bucket
resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.file_upload_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Configure S3 bucket to trigger the notification Lambda on file creation
resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = aws_s3_bucket.file_upload_bucket.id

  lambda_function {
    lambda_function_arn = aws_lambda_function.notification_lambda.arn
    events              = ["s3:ObjectCreated:*"]
  }

  depends_on = [aws_lambda_permission.s3_permission]
}

# Output the bucket name after creation
output "s3_bucket_name" {
  value       = aws_s3_bucket.file_upload_bucket.id
  description = "The name of the S3 bucket."
}