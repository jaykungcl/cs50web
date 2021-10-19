from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from PIL import Image

class User(AbstractUser):
    def __str__(self):
        return f"{self.username}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default="default.png", upload_to="profile_pics")
    followers = models.ManyToManyField(User, blank=True, null=True, related_name="get_following")

    def __str__(self):
        return f"{self.user.username}'s Profile"

    def save(self):
        super().save()
        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
    
    def serialize(self, user):
        return {
            "id": self.user.id,
            "username": self.user.username,
            "img_url": self.image.url,
            "followers_num": self.followers.count(),
            "following_num": self.user.get_following.count(),
            "is_following": not user.is_anonymous and self in user.get_following.all(),
            "not_user": self.user != user,
            "user_logged_in": not user.is_anonymous,
        }       

class Post(models.Model):
    content = models.TextField(max_length=300)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="get_posts")
    liked_by = models.ManyToManyField(User, blank=True, null=True, related_name="get_liked_posts")
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.content} | {self.posted_by}"

    def serialize(self, user):
        return {
            "id": self.id,
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "user_id": self.posted_by.id,
            "posted_by": self.posted_by.username,
            "img_url": self.posted_by.profile.image.url,
            "likes": self.liked_by.count(),
            "liked": not user.is_anonymous and self in User.objects.get(id=user.id).get_liked_posts.all(),
            "editable": not user.is_anonymous and user.id == self.posted_by.id,
            "user_logged_in": not user.is_anonymous,
        }