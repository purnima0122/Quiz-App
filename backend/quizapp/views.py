from django.http import JsonResponse
from django.views.decorators.http import require_GET

from .models import QuizQuestion


@require_GET
def question_list(request):
    questions = QuizQuestion.objects.filter(is_active=True)
    return JsonResponse({"questions": [question.to_api_dict() for question in questions]})
