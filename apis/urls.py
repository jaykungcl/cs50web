from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register, name="register"),
    path('login', views.login_user, name="login"),
    path('logout', views.logout_user, name="logout"),
    path('auth', views.loggedin_user, name="auth"),
    path('user/<str:pk>', views.profile, name="profile"),
    path('recipes', views.recipes, name="recipes"),
    path('recipes/favorite', views.fav_recipes, name="fav_recipes"),
    path('recipes/<str:pk>', views.recipe, name="recipe"),
]