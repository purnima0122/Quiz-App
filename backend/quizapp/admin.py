from django.contrib import admin

from .models import QuizQuestion


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "question_text", "correct_option", "is_active")
    list_filter = ("is_active", "correct_option")
    search_fields = ("question_text", "option_a", "option_b", "option_c", "option_d")
