from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("listing/<str:listing_id>", views.listing, name="listing"),
    path("categories", views.categories, name="categories"),
    path("categories/<str:category_id>", views.category, name="category"),
    path("create", views.create, name="create"),
    path("watchlist", views.watchlist, name="watchlist")
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
