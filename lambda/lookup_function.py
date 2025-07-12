import json
import boto3
import os
from decimal import Decimal

# A custom JSON encoder to handle DynamoDB's Decimal type
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Convert Decimal to an integer or float before JSON serialization
            return int(obj)
        return super(DecimalEncoder, self).default(obj)

# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('file-metadata')

def lambda_handler(event, context):
    """
    Scans the DynamoDB table and returns all file metadata.
    """
    try:
        # Perform the scan operation
        response = table.scan()
        items = response.get('Items', [])

        # The scan operation can be paginated. For this simple project, we'll
        # just get the first page of results. A production-ready application
        # would loop using the 'LastEvaluatedKey' from the response.

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', # Allow requests from any origin
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps(items, cls=DecimalEncoder)
        }

    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({'error': 'Could not fetch file metadata.'})
        }