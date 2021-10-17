import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import *
from .forms import NewPostForm

def index(request):
    # Check if request method is post (send new post)
    if request.method == 'POST':
        post = request.POST.copy()
        post["posted_by"] = request.user
        request.POST = post
        new_post = NewPostForm(post)

        if new_post.is_valid():
            new_post.save()

        # Return to index page and update posts
        return HttpResponseRedirect(reverse("index"))

    # Render new post form
    return render(request, "network/index.html", {
        "form": NewPostForm()
    })

def get_posts(request, page, page_num):
    profile_name = ""

    # Get all posts
    if page == "all":
        posts = Post.objects.all()

    # Get only posts from following account
    elif page == "following":
        user = User.objects.get(id=request.user.id)
        profiles = user.get_following.all()
        following = User.objects.filter(profile__in=profiles)

        posts = Post.objects.filter(posted_by__in=following)

    # Get posts of profile's user
    else:
        user = User.objects.get(id=page)
        posts = user.get_posts.all()
        profile_name = user.username
        print(profile_name)

    # Order newest post first
    posts = posts.order_by("-timestamp").all()
    
    # Paginator divide posts to 10 posts/page
    paginator = Paginator(posts, 10)
    
    # Get page requested via fetch
    paginated_posts = paginator.get_page(page_num)

    # Return only posts from requested page
    return JsonResponse({
        "posts": [post.serialize(request.user) for post in paginated_posts],
        "num_pages": paginator.num_pages,
        "profile_name": profile_name
        }, safe=False)

@csrf_exempt
def view_profile(request, user_id):
    user = User.objects.get(id=user_id)
    profile = user.profile

    # Check for fetch request to follow/unfollow
    if request.method == 'PUT':
        data = json.loads(request.body)

        if(data.get("follow", "") != ""):
            follow = data.get("follow", "")

            # Change to follow
            if follow:
                profile.followers.add(request.user)

            # Change to unfollow
            else:
                profile.followers.remove(request.user)
            profile.save()

    return JsonResponse([profile.serialize(request.user)], safe=False)


@csrf_exempt
def edit_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        post = ''
    # print(post)
    # print(type(post))
    
    # Check for PUT request on post
    if request.method == 'PUT':
        data = json.loads(request.body)

        # If request to edit/save changes to post
        if(data.get("content", "")):
            content = data.get("content", "")
            post.content = content
            
        # If request to like/unlike post
        if(data.get("like", "") != ""):
            like = data.get("like", "")
            if like:
                post.liked_by.add(request.user)
            else:
                post.liked_by.remove(request.user)

        post.save()
    
    # Check for DELETErequest on post
    elif request.method == 'DELETE':
        if(post):
            post.delete()
        else:
            return JsonResponse({"message": "Post does not exist."}, status=403)

        return JsonResponse({"message": "Post deleted."}, status=204)

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
