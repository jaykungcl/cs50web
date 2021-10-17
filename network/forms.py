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