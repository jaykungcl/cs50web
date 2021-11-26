import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.shortcuts import render
from django.http.response import JsonResponse
from django.views.decorators import csrf
from django.views.decorators.csrf import csrf_exempt
from .models import *
from .forms import *

# Create your views here.
def register(request):
    if request.method == "POST":
        print('regis')
        data = json.loads(request.body)

        username = data.get("username", "")
        email = data.get("email", "")

        # Ensure password matches confirmation
        password = data.get("password", "")
        confirmation = data.get("confirmation", "")
        if password != confirmation:
            return JsonResponse({"error": "Passwords must match."}, safe=False)

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return JsonResponse({"error": "Username already taken."}, safe=False)
        
        login(request, user)
        return JsonResponse(user.profile.serialize(), safe=False)

@csrf_exempt
def profile(request, pk):


    user = User.objects.get(id=pk)

    if request.method == "POST":

        img = UpdateProfileForm(request.POST, request.FILES, instance=user.profile)
        print(img)

        img.save()

        return JsonResponse("saved", safe=False)
    
    recipes = Recipe.objects.filter(created_by=user)

    return JsonResponse([recipe.serialize(request.user) for recipe in recipes], safe=False)

@csrf_exempt
def login_user(request):
    # if request.method == "POST":

    data = json.loads(request.body)

    username = data.get("username", "")
    password = data.get("password", "")
    user = authenticate(request, username=username, password=password)

    # Check if authentication successful
    if user is not None:
        login(request, user)
        return JsonResponse(user.profile.serialize(), safe=False)
    else:
        return JsonResponse({ "error": "Invalid username and/or password." }, safe=False)

def logout_user(request):

    logout(request)
    return JsonResponse({ "message": "Logout susccess" }, safe=False)

def loggedin_user(request):
    print(request.user)
    try:
        user = request.user.profile.serialize()
    except AttributeError:
        user = None
    return JsonResponse(user, safe=False)

@csrf_exempt
def recipes(request):
    if request.method == "POST":
        # print(request.user)
        data = json.loads(request.body)
        # data = request.POST.copy()
        # data["created_by"] = request.user
        # request.POST = data
        # print(data)
        # for x in data:
        #     print(x)
        print(data)

        title = data.get("title", "")
        ingredients = data.get("ingredients", "")
        method = data.get("method", "")
        cooking_time = int(data.get("cooking_time", ""))
        user = data.get("created_by", "")
        print(type(user))
        created_by = User.objects.get(id=user.get("id"))
        print('userfromfront', created_by)
        # created_by = User.objects.get(id=request.user.id)

        recipe = Recipe(
            title=title, 
            ingredients=ingredients, 
            method=method, 
            cooking_time=cooking_time, 
            created_by=created_by
        )

        recipe.save()

        return JsonResponse(recipe.serialize(request.user), safe=False)

    recipes = Recipe.objects.all()

    return JsonResponse([recipe.serialize(request.user) for recipe in recipes], safe=False)

def recipe(request, pk):
    recipe = Recipe.objects.get(id=pk)

    if request.method == "PUT":
        data = json.loads(request.body)
        print(request.user)

        if (data.get("like", "") != ""):
            like = data.get("like", "")
            print(like)
            if like:
                print("added")
                recipe.liked_by.add(request.user)
            else:
                print("removed")
                recipe.liked_by.remove(request.user)
        
        print(type(recipe), recipe.serialize(request.user))
        recipe.save()

    return JsonResponse(recipe.serialize(request.user), safe=False)

# def edit_recipe(request, pk):
#     recipe = Recipe.objects.get(id=pk)

#     return JsonResponse(recipe.serialize(request.user), safe=False)

def fav_recipes(request):
    # recipes = Recipe.objects.filter(created_by=request.user)
    user = User.objects.get(id=request.user.id)

    recipes = user.get_liked_recipes.all()

    return JsonResponse([recipe.serialize(request.user) for recipe in recipes], safe=False)

