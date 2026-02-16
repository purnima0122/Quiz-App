from django.db import models


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
