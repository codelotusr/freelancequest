import json

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model

from .models import Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.other_username = self.scope["url_route"]["kwargs"]["username"]

        if not self.user.is_authenticated:
            await self.close()
            return

        self.room_name = "_".join(sorted([self.user.username, self.other_username]))
        self.room_group_name = f"chat_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name") and self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name, self.channel_name
            )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "").strip()
        if not message:
            return

        recipient = await User.objects.aget(username=self.other_username)
        sender = await sync_to_async(lambda: User.objects.get(id=self.user.id))()

        msg = await Message.objects.acreate(
            sender=sender,
            recipient=recipient,
            content=message,
        )

        serialized_msg = await sync_to_async(lambda: MessageSerializer(msg).data)()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                **serialized_msg,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
