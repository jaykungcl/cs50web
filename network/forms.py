from django import forms
from .models import *

class NewPostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['content', 'posted_by']
        labels = {
            'content': 'New Post'
        }
        widgets = {
            'content': forms.Textarea(attrs={
                "class": "form-control", 
                "rows": 3,
                "placeholder": "What's on your mind?"
            }),
            'posted_by': forms.HiddenInput()
        }

class UpdateUserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username']
        help_texts = {
            'username': None,
        }
        widgets = {
            "username": forms.TextInput(attrs={"class": "form-control col-md-8"}),
        }

class UpdateProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['image']
        labels = {
            'image': 'Upload Photo'
        }
        widgets = {
            "image": forms.ClearableFileInput(attrs={"class": "form-control-file"}),
        }