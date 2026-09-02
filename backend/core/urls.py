from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    OrganizationViewSet, UserProfileViewSet, MatterViewSet,
    DocumentViewSet, KeyIssueViewSet, TimelineEventViewSet, AiChatLogViewSet,
    chat_with_matter, ingest_document_view,
)

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet)
router.register(r'userprofiles', UserProfileViewSet)
router.register(r'matters', MatterViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'keyissues', KeyIssueViewSet)
router.register(r'timelineevents', TimelineEventViewSet)
router.register(r'chatlogs', AiChatLogViewSet)

urlpatterns = [
    path('chat/', chat_with_matter, name='chat_with_matter'),
    path('documents/ingest/', ingest_document_view, name='ingest_document'),
    path('', include(router.urls)),
]
