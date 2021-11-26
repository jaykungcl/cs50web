from django import forms
from .models import *

class UpdateProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['image']
        # labels = {
        #     'image': 'Upload Photo'
        # }
        # widgets = {
        #     "image": forms.ClearableFileInput(attrs={"class": "form-control-file"}),
        # }

class NewRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = ['title', 'ingredients', 'cooking_time', 'method', 'created_by']
        
    
# class NewIngredientForm(forms.ModelForm):
#     pass