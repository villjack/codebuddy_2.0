"""
CodeBuddy WebSocket routing configuration
"""
from django.urls import path
from apps.rooms import consumers

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/', consumers.ChatConsumer.as_asgi()),
    path('ws/room/<int:room_id>/', consumers.RoomConsumer.as_asgi()),
    path('ws/room/<int:room_id>/subroom/<int:subroom_id>/', consumers.SubRoomConsumer.as_asgi()),
]
