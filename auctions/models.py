from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    
    @property
    def watchlist_num(self):
        return len(self.watchlist.all())

class Category(models.Model):
    category = models.CharField(max_length=30)

    def __str__(self):
        return f"{self.category}"
    
    @property
    def lenght(self):
        return len(self.listings.all())


class Listing(models.Model):
    title = models.CharField(max_length=60)
    description = models.TextField(max_length=300)
    image = models.ImageField(default="default.jpg", upload_to="images/")
    active = models.BooleanField(default=True)
    starting_bid = models.FloatField()
    current_bid = models.FloatField(blank=True, null=True)
    listed_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name="listings")
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="listings", blank=True, null=True)
    watchers = models.ManyToManyField(User, related_name="watchlist", blank=True, null=True)
    winner = models.ForeignKey(User, on_delete=models.PROTECT, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.title}"

    @property
    def bid_times(self):
        return len(self.get_bids.all())


class Bid(models.Model):
    auction = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="get_bids")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    offer = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.auction} / {self.user} / {self.offer}"


class Comment(models.Model):
    comment = models.TextField(max_length=300)
    user = models.ForeignKey(User, on_delete=models.PROTECT)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="get_comments")
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.comment}"
