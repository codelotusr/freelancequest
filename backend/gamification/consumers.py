import json

from channels.generic.websocket import AsyncWebsocketConsumer


class GamificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if not self.user.is_authenticated:
            await self.close()
            return

        self.group_name = f"user_{self.user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def gamification_event(self, event):
        await self.send(text_data=json.dumps(event["event"]))

    async def receive(self, text_data):
        print("Unexpected receive:", text_data)

    async def websocket_receive(self, message):
        print("Fallback websocket_receive triggered:", message)
