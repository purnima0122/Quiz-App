import json

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import PlayerProfile, QuizQuestion, QuizScore, UserToken


def get_request_data(request):
    if not request.body:
        return {}
    try:
        return json.loads(request.body.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return {}


def get_user_from_token(request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Token "):
        return None

    token_key = auth_header.replace("Token ", "", 1).strip()
    if not token_key:
        return None

    try:
        token = UserToken.objects.select_related("user").get(key=token_key)
    except UserToken.DoesNotExist:
        return None
    return token.user


def question_list(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    questions = QuizQuestion.objects.filter(is_active=True)
    return JsonResponse({"questions": [question.to_api_dict() for question in questions]})


@csrf_exempt
def quiz_scores(request):
    if request.method == "GET":
        scores = QuizScore.objects.all()[:10]

        data = []
        for score in scores:
            data.append(
                {
                    "id": score.id,
                    "player_name": score.player_name,
                    "score": score.score,
                    "wrong": score.wrong,
                    "difficulty": score.difficulty,
                    "created_at": score.created_at,
                }
            )
        return JsonResponse(data, safe=False)

    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    data = get_request_data(request)
    player_name = data.get("player_name")
    score = int(data.get("score", 0))
    wrong = int(data.get("wrong", 0))
    difficulty = data.get("difficulty", "easy")
    user = get_user_from_token(request)

    new_score = QuizScore.objects.create(
        player_name=player_name or "Guest",
        score=score,
        wrong=wrong,
        difficulty=difficulty,
        user=user,
    )

    if user:
        profile, _ = PlayerProfile.objects.get_or_create(user=user)
        profile.total_games += 1
        profile.total_correct += score
        profile.total_wrong += wrong
        if score > profile.best_score:
            profile.best_score = score
        profile.save()

    return JsonResponse({"message": "Score saved!", "id": new_score.id}, status=201)


@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    data = get_request_data(request)
    username = data.get("username")
    email = data.get("email", "")
    password = data.get("password")

    if not username or not password:
        return JsonResponse({"error": "Username and password are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    PlayerProfile.objects.create(user=user)
    token, _ = UserToken.get_or_create_for_user(user)

    return JsonResponse(
        {
            "message": "User created successfully!",
            "token": token.key,
            "user": {"id": user.id, "username": user.username, "email": user.email},
        },
        status=201,
    )


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    data = get_request_data(request)
    username = data.get("username")
    password = data.get("password")
    user = authenticate(username=username, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid credentials"}, status=401)

    token, _ = UserToken.get_or_create_for_user(user)
    profile, _ = PlayerProfile.objects.get_or_create(user=user)

    return JsonResponse(
        {
            "message": "Login successful!",
            "token": token.key,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "total_games": profile.total_games,
                "best_score": profile.best_score,
                "average_score": profile.average_score,
                "accuracy": profile.accuracy,
            },
        }
    )


@csrf_exempt
def logout(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = get_user_from_token(request)
    if user is None:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    UserToken.objects.filter(user=user).delete()
    return JsonResponse({"message": "Logged out successfully!"})


def user_profile(request):
    if request.method != "GET":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    user = get_user_from_token(request)
    if user is None:
        return JsonResponse({"error": "Not authenticated"}, status=401)

    profile, _ = PlayerProfile.objects.get_or_create(user=user)
    return JsonResponse(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "total_games": profile.total_games,
            "best_score": profile.best_score,
            "average_score": profile.average_score,
            "accuracy": profile.accuracy,
            "total_correct": profile.total_correct,
            "total_wrong": profile.total_wrong,
        }
    )
