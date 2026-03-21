"""
Centralized exception handler for the ResuMatch API.
Provides consistent error responses across all endpoints.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    """Custom exception handler with logging and consistent format"""
    response = exception_handler(exc, context)
    
    # Get view and request info for logging
    view = context.get('view', None)
    request = context.get('request', None)
    
    if response is not None:
        custom_response = {
            'success': False,
            'status_code': response.status_code,
            'errors': response.data,
        }
        
        # Log 5xx errors
        if response.status_code >= 500:
            logger.error(
                f"Server Error [{response.status_code}] in {view.__class__.__name__ if view else 'Unknown'}: "
                f"{response.data}",
                exc_info=True
            )
        elif response.status_code >= 400:
            logger.warning(
                f"Client Error [{response.status_code}] in {view.__class__.__name__ if view else 'Unknown'}: "
                f"{response.data}"
            )
        
        response.data = custom_response
        return response
    
    # Unhandled exceptions
    logger.critical(
        f"Unhandled Exception in {view.__class__.__name__ if view else 'Unknown'}: {str(exc)}",
        exc_info=True
    )
    
    return Response({
        'success': False,
        'status_code': 500,
        'errors': {'detail': 'An unexpected error occurred. Please try again.'},
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
