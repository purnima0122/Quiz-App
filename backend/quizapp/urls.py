from django.urls import path

from .views import login, logout, question_list, quiz_scores, register, user_profile

urlpatterns = [
    path("questions/", question_list, name="question-list"),
    path("scores/", quiz_scores, name="quiz-scores"),
    path("register/", register, name="register"),
    path("login/", login, name="login"),
    path("logout/", logout, name="logout"),
    path("profile/", user_profile, name="user-profile"),
]
