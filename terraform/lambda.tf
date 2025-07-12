# --- Resources for File Lookup Lambda ---

# Package the lookup function
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.root}/../lambda/lookup_function.py"
  output_path = "${path.root}/lookup_function.zip"
}

# Create the lookup Lambda function
resource "aws_lambda_function" "file_lookup_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "file-lookup-function"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "lookup_function.lambda_handler"
  runtime          = "python3.9"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

# API Gateway and related resources for the lookup function
resource "aws_apigatewayv2_api" "lambda_api" {
  name          = "file-lookup-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_route" "api_route" {
  api_id    = aws_apigatewayv2_api.lambda_api.id
  route_key = "GET /files"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.lambda_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.file_lookup_lambda.invoke_arn
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.lambda_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.file_lookup_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda_api.execution_arn}/*/*"
}

output "api_endpoint_url" {
  value = aws_apigatewayv2_stage.default_stage.invoke_url
  description = "The base URL for the file lookup API."
}

# --- Resources for Notification Lambda ---

# Package the notification function
data "archive_file" "notification_lambda_zip" {
  type        = "zip"
  source_file = "${path.root}/../lambda/notification_function.py"
  output_path = "${path.root}/notification_function.zip"
}

# Create the notification Lambda function
resource "aws_lambda_function" "notification_lambda" {
  filename         = data.archive_file.notification_lambda_zip.output_path
  function_name    = "file-notification-function"
  role             = aws_iam_role.notification_lambda_role.arn
  handler          = "notification_function.lambda_handler"
  runtime          = "python3.9"
  source_code_hash = data.archive_file.notification_lambda_zip.output_base64sha256

  environment {
    variables = {
      # IMPORTANT: Replace with your verified SES email address
      SENDER_EMAIL    = "jastisatvik@gmail.com"
      RECIPIENT_EMAIL = "jastisatvik@gmail.com"
    }
  }
}

# Allow S3 to invoke the notification Lambda function
resource "aws_lambda_permission" "s3_permission" {
  statement_id  = "AllowS3Invoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notification_lambda.arn
  principal     = "s3.amazonaws.com"
  source_arn    = aws_s3_bucket.file_upload_bucket.arn
}