from django.db import models
from django.contrib.auth.models import User
import secrets


class QuizQuestion(models.Model):
    OPTION_CHOICES = [
        ("A", "Option A"),
        ("B", "Option B"),
        ("C", "Option C"),
        ("D", "Option D"),
    ]

    question_text = models.CharField(max_length=255)
    option_a = models.CharField(max_length=150)
    option_b = models.CharField(max_length=150)
    option_c = models.CharField(max_length=150)
    option_d = models.CharField(max_length=150)
    correct_option = models.CharField(max_length=1, choices=OPTION_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.question_text

    def get_correct_answer_text(self):
        option_map = {
            "A": self.option_a,
            "B": self.option_b,
            "C": self.option_c,
            "D": self.option_d,
        }
        return option_map[self.correct_option]

    def to_api_dict(self):
        return {
            "id": self.id,
            "question": self.question_text,
            "options": [self.option_a, self.option_b, self.option_c, self.option_d],
            "answer": self.get_correct_answer_text(),
        }


class QuizScore(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    player_name = models.CharField(max_length=100)
    score = models.PositiveIntegerField(default=0)
    wrong = models.PositiveIntegerField(default=0)
    difficulty = models.CharField(max_length=20, default="easy")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-score", "-created_at"]

    def __str__(self):
        return f"{self.player_name} - {self.score}"


class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_games = models.PositiveIntegerField(default=0)
    total_correct = models.PositiveIntegerField(default=0)
    total_wrong = models.PositiveIntegerField(default=0)
    best_score = models.PositiveIntegerField(default=0)

    @property
    def average_score(self):
        if self.total_games == 0:
            return 0
        return round(self.total_correct / self.total_games, 2)

    @property
    def accuracy(self):
        total = self.total_correct + self.total_wrong
        if total == 0:
            return 0
        return round((self.total_correct / total) * 100, 2)

    def __str__(self):
        return self.user.username


class UserToken(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    key = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def generate_key(cls):
        return secrets.token_hex(32)

    @classmethod
    def get_or_create_for_user(cls, user):
        token, created = cls.objects.get_or_create(user=user, defaults={"key": cls.generate_key()})
        if not token.key:
            token.key = cls.generate_key()
            token.save(update_fields=["key"])
        return token, created

    def __str__(self):
        return f"Token for {self.user.username}"
