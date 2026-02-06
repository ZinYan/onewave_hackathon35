from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .serializers import SignupSerializer, MeSerializer, ProfileSerializer

@api_view(["POST"])
@permission_classes([AllowAny])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response({"id": user.id, "username": user.username, "email": user.email}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(MeSerializer(request.user).data)

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def onboarding_update(request):
    profile = request.user.profile
    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)

    # If all required fields exist, mark onboarding complete
    updated = serializer.save()
    if updated.major and updated.interest_field and updated.target_period_months:
        updated.onboarding_completed = True
        updated.save(update_fields=["onboarding_completed"])

    return Response({"onboarding_completed": updated.onboarding_completed, "profile": ProfileSerializer(updated).data})
