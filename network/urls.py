
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API routes
    path("posts/<str:page>/<str:page_num>", views.get_posts, name="get_posts"),
    path("edit/<str:post_id>", views.edit_post, name="edit_post"),
    path("profile/<str:user_id>", views.view_profile, name="view_profile")
]