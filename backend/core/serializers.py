from rest_framework import serializers
from .models import Organization, UserProfile, Matter, Document, KeyIssue, TimelineEvent, AiChatLog
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = UserProfile
        fields = '__all__'

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'

class KeyIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyIssue
        fields = '__all__'

class TimelineEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEvent
        fields = '__all__'

class AiChatLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiChatLog
        fields = '__all__'

class MatterSerializer(serializers.ModelSerializer):
    documents = DocumentSerializer(many=True, read_only=True)
    key_issues = KeyIssueSerializer(many=True, read_only=True)
    timeline_events = TimelineEventSerializer(many=True, read_only=True)
    chat_logs = AiChatLogSerializer(many=True, read_only=True)
    
    # Custom fields for frontend matching
    documentsCount = serializers.SerializerMethodField()
    indexedCount = serializers.SerializerMethodField()

    class Meta:
        model = Matter
        fields = '__all__'

    def get_documentsCount(self, obj):
        return obj.documents.count()

    def get_indexedCount(self, obj):
        return obj.documents.filter(indexed='completed').count()
