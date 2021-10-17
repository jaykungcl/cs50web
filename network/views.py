import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
# from django.views.generic import ListView
from django.core.paginator import Paginator

from .models import *
from .forms import NewPostForm

def index(request):
    if request.method == 'POST':
        post = request.POST.copy()
        post["posted_by"] = request.user
        request.POST = post

        new_post = NewPostForm(post)

        if new_post.is_valid():
            new_post.save()

        return HttpResponseRedirect(reverse("index"))

    return render(request, "network/index.html", {
        "form": NewPostForm(),
        "posts": Post.objects.all()
    })

def get_posts(request, page, page_num):

    # Filter posts return to fetch request
    if page == "all":
        posts = Post.objects.all()
        print(type(posts))
    elif page == "following":
        user = User.objects.get(id=request.user.id)
        profiles = user.get_following.all()
        following = User.objects.filter(profile__in=profiles)

        print(following)
        # for profile in following:
        #     profile = profile.user
        posts = Post.objects.filter(posted_by__in=following)
        # for user in following:
        #     posts.append(user.get_posts.all())

    else:
        user = User.objects.get(id=page)
        posts = user.get_posts.all()

    posts = posts.order_by("-timestamp").all()
    
    paginator = Paginator(posts, 10)
    # page_num = request.GET.get('page_num')
    paginated_posts = paginator.get_page(page_num)

    return JsonResponse({
        "posts": [post.serialize(request.user) for post in paginated_posts],
        "num_pages": paginator.num_pages
        }, safe=False)

# def paginate(post_list, page, limit):
#     try:
#         page = int(page)
#         if page < 1:
#             page = 1
#     except (TypeError, ValueError):
#         page = 1
    
#     try:
#         limit = int(limit)
#     except (TypeError, ValueError):
#         limit = 10

#     paginator = Paginator(post_list, limit)
#     try:
#         posts = paginator.page(page)
#     except PageNotAnInteger:
#         posts = paginator.page(1)
#     except EmptyPage:
#         posts = paginator.page(paginator.num_pages)
#     data = {
#         "previous_page": posts.has_previous() and posts.previous_page_number() or None,
#         "next_page": posts.has_next() and posts.next_page_number() or None,
#         "data": list(posts)
#     }
#     return data

@csrf_exempt
def view_profile(request, user_id):
    user = User.objects.get(id=user_id)
    profile = user.profile

    if request.method == 'PUT':
        
        data = json.loads(request.body)
        if(data.get("follow", "") != ""):
 
            follow = data.get("follow", "")
            if follow:
                profile.followers.add(request.user)
            else:
                profile.followers.remove(request.user)
            profile.save()

    return JsonResponse([profile.serialize(request.user)], safe=False)


@csrf_exempt
def edit_post(request, post_id):

    post = Post.objects.get(id=post_id)
    
    if request.method == 'PUT':
        data = json.loads(request.body)
        if(data.get("content", "")):
            content = data.get("content", "")
            post.content = content
            
        if(data.get("like", "") != ""):

            like = data.get("like", "")
            if like:
                post.liked_by.add(request.user)
            else:
                post.liked_by.remove(request.user)

        post.save()

    return JsonResponse([post.serialize(request.user)], safe=False)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
