import json
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
    """
    Serializer that outputs camelCase fields matching the frontend Matter type.
    
    Frontend expects:
      id, code, title, client, caseDescription, jurisdiction, nextHearing,
      status, isPinned, isArchived, isCollaborative, keyIssues[], timeline[],
      documentsCount, indexedCount, missingInfoNote, internalNotes,
      summaryText[], members[], opposingCounsels[], documents[]
    """
    
    class Meta:
        model = Matter
        fields = '__all__'

    def to_representation(self, instance):
        """Transform model → camelCase JSON for frontend."""
        # Get related objects
        key_issues = instance.key_issues.all()
        timeline_events = instance.timeline_events.all()
        documents = instance.documents.all()
        
        # Parse JSON fields
        try:
            summary_text = json.loads(instance.summary_text_json) if instance.summary_text_json else []
        except (json.JSONDecodeError, TypeError):
            summary_text = []

        try:
            opposing_counsels = json.loads(instance.opposing_counsels_json) if instance.opposing_counsels_json else []
        except (json.JSONDecodeError, TypeError):
            opposing_counsels = []

        return {
            'id': str(instance.id),
            'code': instance.code,
            'title': instance.title,
            'client': instance.client,
            'caseDescription': instance.case_description or '',
            'jurisdiction': instance.jurisdiction,
            'nextHearing': instance.next_hearing or '',
            'status': instance.status,
            'isPinned': instance.is_pinned,
            'isArchived': instance.is_archived,
            'isCollaborative': instance.is_collaborative,
            'internalNotes': instance.internal_notes or '',
            'missingInfoNote': instance.missing_info_note or '',
            
            # Nested related data
            'keyIssues': [
                {
                    'id': str(ki.id),
                    'title': ki.title,
                    'status': ki.status,
                    'docRef': ki.doc_ref or '',
                }
                for ki in key_issues
            ],
            'timeline': [
                {
                    'id': str(te.id),
                    'date': te.date,
                    'title': te.title,
                    'description': te.description,
                    'statusColor': te.status_color or '#0A192F',
                }
                for te in timeline_events
            ],
            'documents': DocumentSerializer(documents, many=True).data,
            'documentsCount': documents.count(),
            'indexedCount': documents.filter(indexed='completed').count(),
            
            # JSON-stored structured data
            'summaryText': summary_text,
            'opposingCounsels': opposing_counsels,
            
            # Members don't have a backend model yet — return empty
            'members': [],
        }

    def to_internal_value(self, data):
        """Transform camelCase JSON from frontend → snake_case for model."""
        internal = {}
        
        # Direct mappings
        field_map = {
            'code': 'code',
            'title': 'title',
            'client': 'client',
            'jurisdiction': 'jurisdiction',
            'status': 'status',
            'organization': 'organization',
            # camelCase → snake_case
            'caseDescription': 'case_description',
            'case_description': 'case_description',
            'nextHearing': 'next_hearing',
            'next_hearing': 'next_hearing',
            'internalNotes': 'internal_notes',
            'internal_notes': 'internal_notes',
            'missingInfoNote': 'missing_info_note',
            'missing_info_note': 'missing_info_note',
            'isPinned': 'is_pinned',
            'is_pinned': 'is_pinned',
            'isArchived': 'is_archived',
            'is_archived': 'is_archived',
            'isCollaborative': 'is_collaborative',
            'is_collaborative': 'is_collaborative',
        }
        
        for input_key, model_field in field_map.items():
            if input_key in data:
                internal[model_field] = data[input_key]
        
        # Handle organization as FK
        if 'organization' in internal:
            org_val = internal['organization']
            if isinstance(org_val, dict):
                internal['organization'] = org_val.get('id', org_val)
        
        return internal

    def create(self, validated_data):
        # Remove any nested fields that aren't direct model fields
        validated_data.pop('keyIssues', None)
        validated_data.pop('timeline', None)
        validated_data.pop('summaryText', None)
        validated_data.pop('members', None)
        validated_data.pop('opposingCounsels', None)
        # Convert organization int → organization_id for Django FK assignment
        if 'organization' in validated_data and isinstance(validated_data['organization'], int):
            validated_data['organization_id'] = validated_data.pop('organization')
        return Matter.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Remove nested fields before update
        validated_data.pop('keyIssues', None)
        validated_data.pop('timeline', None)
        validated_data.pop('summaryText', None)
        validated_data.pop('members', None)
        validated_data.pop('opposingCounsels', None)
        # Convert organization int → organization_id for Django FK assignment
        if 'organization' in validated_data and isinstance(validated_data['organization'], int):
            validated_data['organization_id'] = validated_data.pop('organization')
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
