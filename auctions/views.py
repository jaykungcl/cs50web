from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import *
from .forms import *

def index(request):

    return render(request, "auctions/index.html", {
        "listings": Listing.objects.filter(active=True)
    })

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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def watchlist(request):

    return render(request, "auctions/watchlist.html", {
        "listings": Listing.objects.filter(watchers=request.user)
    })

@login_required
def listing(request, listing_id):

    # Get listing for id provided
    try:
        listing = Listing.objects.get(id=listing_id)
    except:
        return render(request, "auctions/notfound.html")
    
    # Alert message when task is done or error
    alert_message = ''
    alert_danger = ''

    if request.method == "POST":
    
        # Detect place bid button submit
        if 'place_bid' in request.POST:
            
            # Set value for user and auction field
            post = request.POST.copy()
            post["user"] = request.user
            post["auction"] = listing
            request.POST = post

            bid = NewBidForm(request.POST)

            offer = float(bid['offer'].value())
            print(type(bid['offer'].value()))
            print(type(listing.starting_bid))
            
            if bid.is_valid():
                # Check if bid amount is valid
                if listing.current_bid:
                    if offer > listing.current_bid:
                        listing.current_bid = offer
                        listing.winner = request.user
                        bid.save()
                        listing.save()
                        alert_message = 'Bidded'
                    else:
                        alert_danger = 'Invalid amount, bid price must be higher than current price'
                else:
                    if offer >= listing.starting_bid:
                        listing.current_bid = offer
                        listing.winner = request.user
                        bid.save()
                        listing.save()
                        alert_message = 'Bidded'
                    else:
                        alert_danger = 'Invalid amount, first bid price must be equal or higher than starting price'
            else:
                alert_danger = 'Invalid information, please try again'
        
        # Detect new comment button submit
        elif 'new_comment' in request.POST:
            
            # Set value for user and listing field
            post = request.POST.copy()
            post["user"] = request.user
            post["listing"] = listing
            request.POST = post
            
            comment = NewCommentForm(request.POST)
            
            if comment.is_valid():
                comment.save()
                alert_message = 'Comment added'
            else:
                alert_danger = 'Something wet wrong, please try again'
        
        # Detect toggle watchlist button submit
        elif 'toggle_watchlist' in request.POST:
            if request.user in listing.watchers.all():
                listing.watchers.remove(request.user)
                alert_message = 'Removed from Watchlist'
            else:
                listing.watchers.add(request.user)
                alert_message = 'Added to Watchlist'

        # Detect close auction button submit
        elif 'close_auction' in request.POST:
            if listing.active:
                listing.active = False
                listing.save()
        
    return render(request, "auctions/listing.html", {
        "listing": listing,
        "alert_message": alert_message,
        "alert_danger": alert_danger,
        "in_watchlist": request.user in listing.watchers.all(),
        "bid_form": NewBidForm(),
        "comments": listing.get_comments.all(),
        "comment_form": NewCommentForm()
    })

@login_required
def categories(request):
    categories = Category.objects.all()

    return render(request, "auctions/categories.html", {
        "categories": categories
    })

@login_required
def category(request, category_id):
    listings = Listing.objects.filter(category=category_id)

    # Get category if exist
    try:
        category = Category.objects.get(id=category_id)
    except:
        return render(request, "auctions/notfound.html")

    return render(request, "auctions/category.html", {
        "category": category,
        "listings": listings
    })

@login_required
def create(request):
    if request.method == "POST":

        # Set value for listed_by field
        post = request.POST.copy()
        post["listed_by"] = request.user
        request.POST = post

        form = NewListingForm(request.POST, request.FILES)

        if form.is_valid():
            listing = form.save()
            return HttpResponseRedirect(reverse("listing", kwargs={"listing_id": listing.id}))
        else:
            return render(request, "auctions/create.html", {
                "form": form,
                "error": True
            })
    else:
        return render(request, "auctions/create.html", {
            "form": NewListingForm()
        })