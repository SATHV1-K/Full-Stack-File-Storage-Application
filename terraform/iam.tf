# ----------------------------------------------------
# --- IAM Resources for File Lookup Lambda ---
# ----------------------------------------------------

# IAM Role for the file-lookup Lambda function
resource "aws_iam_role" "lambda_exec_role" {
  name = "file-lookup-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# IAM Policy that grants permission to read from the DynamoDB table
resource "aws_iam_policy" "dynamodb_read_policy" {
  name        = "file-lookup-dynamodb-read-policy"
  description = "Allows Lambda to scan the file-metadata table"

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action   = [
        "dynamodb:Scan"
      ],
      Effect   = "Allow",
      Resource = aws_dynamodb_table.file_metadata_table.arn
    }]
  })
}

# IAM policy for Lambda to write logs to CloudWatch (used by both functions)
resource "aws_iam_policy" "lambda_logging_policy" {
  name        = "lambda-logging-policy"
  description = "Allows Lambda functions to create and write to CloudWatch logs"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "arn:aws:logs:*:*:*"
      }
    ]
  })
}

# Attach policies to the file-lookup Lambda role
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.dynamodb_read_policy.arn
}

resource "aws_iam_role_policy_attachment" "lookup_lambda_logging_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_logging_policy.arn
}

# ----------------------------------------------------
# --- IAM Resources for Notification Lambda ---
# ----------------------------------------------------

# Role for the notification Lambda
resource "aws_iam_role" "notification_lambda_role" {
  name = "notification-lambda-exec-role"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Policy to allow reading from the DynamoDB Stream
resource "aws_iam_policy" "dynamodb_stream_policy" {
  name = "notification-dynamodb-stream-policy"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = [
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:DescribeStream",
        "dynamodb:ListStreams"
      ],
      Resource = aws_dynamodb_table.file_metadata_table.stream_arn
    }]
  })
}

# Policy to allow sending emails via SES
resource "aws_iam_policy" "ses_send_policy" {
  name = "notification-ses-send-policy"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Effect   = "Allow",
      Action   = "ses:SendEmail",
      Resource = "arn:aws:ses:us-east-1:296062569059:identity/jastisatvik@gmail.com"
    }]
  })
}

# Attach policies to the notification Lambda role
resource "aws_iam_role_policy_attachment" "notification_ses_attach" {
  role       = aws_iam_role.notification_lambda_role.name
  policy_arn = aws_iam_policy.ses_send_policy.arn
}

resource "aws_iam_role_policy_attachment" "notification_logging_attach" {
  role       = aws_iam_role.notification_lambda_role.name
  policy_arn = aws_iam_policy.lambda_logging_policy.arn # Reuse the logging policy
}

# ----------------------------------------------------
# --- IAM Resources for Backend Application ---
# ----------------------------------------------------

resource "aws_iam_role" "backend_app_role" {
  name = "backend-app-exec-role"

  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        # This should be updated based on where the backend is hosted
        # e.g., "Service": "ec2.amazonaws.com" for an EC2 instance
        Service = "ec2.amazonaws.com" 
      }
    }]
  })
}

resource "aws_iam_policy" "backend_s3_policy" {
  name        = "backend-app-s3-policy"
  description = "Allows backend to put and delete objects in the S3 bucket"

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action   = [
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      Effect   = "Allow",
      Resource = "${aws_s3_bucket.file_upload_bucket.arn}/*" # Access to objects within the bucket
    }]
  })
}

resource "aws_iam_policy" "backend_dynamodb_policy" {
  name        = "backend-app-dynamodb-policy"
  description = "Allows backend to manage items in the DynamoDB table"

  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [{
      Action   = [
        "dynamodb:PutItem",
        "dynamodb:DeleteItem"
      ],
      Effect   = "Allow",
      Resource = aws_dynamodb_table.file_metadata_table.arn
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_s3_attachment" {
  role       = aws_iam_role.backend_app_role.name
  policy_arn = aws_iam_policy.backend_s3_policy.arn
}

resource "aws_iam_role_policy_attachment" "backend_dynamodb_attachment" {
  role       = aws_iam_role.backend_app_role.name
  policy_arn = aws_iam_policy.backend_dynamodb_policy.arn
}