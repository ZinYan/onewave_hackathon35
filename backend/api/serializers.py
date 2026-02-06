from rest_framework import serializers


class OnboardingRequestSerializer(serializers.Serializer):
    user_input = serializers.CharField()

    def validate_user_input(self, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("User input must not be empty.")
        return cleaned


class OnboardingResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    final_company = serializers.CharField(allow_blank=True)
    final_role = serializers.CharField(allow_blank=True)
