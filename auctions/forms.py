from .models import *
from django import forms

class NewListingForm(forms.ModelForm):
    class Meta:
        model = Listing
        fields = ["title", "description", "image", "starting_bid", "category", "listed_by"]
        widgets = {
            "title": forms.TextInput(attrs={"class": "form-control"}),
            "description": forms.Textarea(attrs={"class": "form-control"}),
            "image": forms.ClearableFileInput(attrs={"class": "form-control-file"}),
            "starting_bid": forms.NumberInput(attrs={"class": "form-control"}),
            "category": forms.Select(attrs={"class": "form-control form-check"}),
            "listed_by": forms.HiddenInput()
        }

class NewBidForm(forms.ModelForm):
    class Meta:
        model = Bid
        fields = ["offer", "auction", "user"]
        widgets = {
            "offer": forms.NumberInput(attrs={"class": "form-control"}),
            "auction": forms.HiddenInput(),
            "user": forms.HiddenInput()
        }

class NewCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ["comment", "user", "listing"]
        widgets = {
            "comment": forms.TextInput(attrs={"class": "form-control"}),
            "user": forms.HiddenInput(),
            "listing": forms.HiddenInput()
        }