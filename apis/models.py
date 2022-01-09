from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.fields import TextField
from django.utils import timezone
from PIL import Image
import math
# from django.contrib.postgres.fields import ArrayField

# Create your models here.
class User(AbstractUser):
    def __str__(self):
        return f"{self.username}"

    # def serialize(self):
    #     return {
    #         "id": self.id,
    #         "username": self.username
    #     }    

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default="default.jpg", upload_to="profile_pics")

    def __str__(self):
        return f"{self.user.username} Profile"  

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        img = Image.open(self.image.path)

        if img.height > 300 or img.width > 300:
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)

    def serialize(self):
        return {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "img_url": self.image.url
        }   

# class Ingredient(models.Model):
#     name = models.TextField(max_length=100, null=True)

#     def __str__(self):
#         return f"{self.name}"

#     def serialize(self):
#         return {
#             "name": self.name
#         }

class Recipe(models.Model):
    title = models.TextField(max_length=100, default="")
    # ingredients = models.ManyToManyField(Ingredient,related_name="ingredient_of")
    # ingredients = ArrayField(models.CharField(max_length=100), blank=True, null=True)
    ingredients = models.JSONField(default=dict)
    cooking_time = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, default="", on_delete=models.CASCADE, related_name="get_recipes")
    liked_by = models.ManyToManyField(User, null=True, blank=True, related_name="get_liked_recipes")
    method = models.TextField(max_length=1000, default="")
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title}"

    def format_time(self):
        t = self.cooking_time
        if t < 60:
            return f"{t} minutes"
        if t % 60 == 0:
            return f"{t / 60} hour(s)"
        return f"{math.floor(t / 60)} hour(s) {t % 60} minutes"

    def serialize(self, user):
        return {
            "id": self.id,
            "title": self.title,
            # "ingredients": [ing.serialize() for ing in self.ingredients.all()],
            # "ingredients": self.ingredients.all(),
            "ingredients": self.ingredients.get("ingredients"),
            "created_by": self.created_by.username,
            "created_by_id": self.created_by.id,
            "img_url": self.created_by.profile.image.url,
            "cooking_time": self.format_time(),
            "method": self.method,
            "likes": self.liked_by.count(),
            "liked": not user.is_anonymous and self in User.objects.get(id=user.id).get_liked_recipes.all(),
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
        }