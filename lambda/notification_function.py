import json
import boto3
import os
import logging
from botocore.exceptions import ClientError

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize SES client
ses = boto3.client('ses', region_name='us-east-1')

# Get email addresses from environment variables
SENDER_EMAIL = os.environ.get('SENDER_EMAIL')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL')

def lambda_handler(event, context):
    """
    This function is triggered by an S3 event. It parses the event,
    constructs an email, and sends it using Amazon SES.
    """
    # Verify that environment variables are set
    if not SENDER_EMAIL or not RECIPIENT_EMAIL:
        logger.error("SENDER_EMAIL and RECIPIENT_EMAIL environment variables must be set.")
        return {
            'statusCode': 500,
            'body': json.dumps('Configuration error: Missing sender or recipient email.')
        }

    logger.info("## EVENT RECEIVED")
    logger.info(json.dumps(event))

    try:
        # Extract file information from the S3 event record
        s3_record = event['Records'][0]['s3']
        bucket_name = s3_record['bucket']['name']
        file_key = s3_record['object']['key']
        file_size = s3_record['object']['size']

        # Construct the email
        subject = f"New File Uploaded to S3: {file_key}"
        
        body_html = f"""
        <html>
        <head></head>
        <body>
          <h1>New File Upload Notification</h1>
          <p>A new file has been successfully uploaded to your S3 bucket.</p>
          <h3>File Details:</h3>
          <ul>
            <li><b>File Name:</b> {file_key}</li>
            <li><b>Bucket:</b> {bucket_name}</li>
            <li><b>Size:</b> {file_size} bytes</li>
          </ul>
        </body>
        </html>
        """
        
        body_text = (
            "A new file has been successfully uploaded to your S3 bucket.\n\n"
            f"File Details:\n"
            f"  - File Name: {file_key}\n"
            f"  - Bucket: {bucket_name}\n"
            f"  - Size: {file_size} bytes"
        )

        # Send the email using SES
        response = ses.send_email(
            Source=SENDER_EMAIL,
            Destination={'ToAddresses': [RECIPIENT_EMAIL]},
            Message={
                'Subject': {'Charset': 'UTF-8', 'Data': subject},
                'Body': {
                    'Html': {'Charset': 'UTF-8', 'Data': body_html},
                    'Text': {'Charset': 'UTF-8', 'Data': body_text}
                }
            }
        )

        logger.info(f"Email sent! Message ID: {response['MessageId']}")
        return {
            'statusCode': 200,
            'body': json.dumps('Email sent successfully!')
        }

    except KeyError as e:
        logger.error(f"Error parsing S3 event. Missing key: {e}")
        return {
            'statusCode': 400,
            'body': json.dumps(f"Error processing S3 event: {str(e)}")
        }
    except ClientError as e:
        error_message = e.response.get('Error', {}).get('Message', 'An unknown SES error occurred.')
        logger.error(f"SES Client Error: {error_message}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Failed to send email: {error_message}")
        }
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"An unexpected error occurred: {str(e)}")
        }