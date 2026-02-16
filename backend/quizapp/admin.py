from django.contrib import admin

from .models import PlayerProfile, QuizQuestion, QuizScore, UserToken


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question_text", "correct_option", "is_active")
    list_filter = ("is_active", "correct_option")
    search_fields = ("question_text", "option_a", "option_b", "option_c", "option_d")


@admin.register(QuizScore)
class QuizScoreAdmin(admin.ModelAdmin):
    list_display = ("id", "player_name", "score", "wrong", "difficulty", "created_at")
    list_filter = ("difficulty",)
    search_fields = ("player_name",)


@admin.register(PlayerProfile)
class PlayerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "total_games", "best_score", "total_correct", "total_wrong")
    search_fields = ("user__username", "user__email")


@admin.register(UserToken)
class UserTokenAdmin(admin.ModelAdmin):
    list_display = ("user", "key", "created_at")
    search_fields = ("user__username", "user__email", "key")
