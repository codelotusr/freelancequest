from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def notify_user_gamification(user, payload: dict):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.pk}",
        {
            "type": "gamification_event",
            "event": payload,
        },
    )
