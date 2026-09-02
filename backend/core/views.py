from rest_framework import viewsets, status
from rest_framework.decorators import api_view, parser_classes, action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from django.contrib.auth.models import User

from .models import Organization, UserProfile, Matter, Document, KeyIssue, TimelineEvent, AiChatLog
from .serializers import (
    OrganizationSerializer, UserProfileSerializer, MatterSerializer, 
    DocumentSerializer, KeyIssueSerializer, TimelineEventSerializer, AiChatLogSerializer
)
from .rag import ingest_document, retrieve_chunks, generate_grounded_response, generate_draft_text, analyze_contradictions


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer

class MatterViewSet(viewsets.ModelViewSet):
    queryset = Matter.objects.all()
    serializer_class = MatterSerializer

    @action(detail=True, methods=['post'])
    def generate_draft(self, request, pk=None):
        matter = self.get_object()
        data = request.data
        document_type = data.get('documentType', 'Pleading')
        tone = data.get('tone', 'Formal/Aggressive')
        include_citations = data.get('includeCitations', True)
        
        # Retrieve all chunks for context (could limit or filter if too many)
        chunks = retrieve_chunks(matter.id, "", top_k=20)
        
        draft_text = generate_draft_text(matter.title, document_type, tone, include_citations, chunks)
        return Response({'text': draft_text})

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        matter = self.get_object()
        chunks = retrieve_chunks(matter.id, "", top_k=20)
        
        findings = analyze_contradictions(matter.title, chunks)
        return Response({'findings': findings})

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    
    def get_queryset(self):
        queryset = Document.objects.all()
        matter_id = self.request.query_params.get('matter_id')
        if matter_id:
            queryset = queryset.filter(matter_id=matter_id)
        return queryset

class KeyIssueViewSet(viewsets.ModelViewSet):
    queryset = KeyIssue.objects.all()
    serializer_class = KeyIssueSerializer

class TimelineEventViewSet(viewsets.ModelViewSet):
    queryset = TimelineEvent.objects.all()
    serializer_class = TimelineEventSerializer

class AiChatLogViewSet(viewsets.ModelViewSet):
    queryset = AiChatLog.objects.all()
    serializer_class = AiChatLogSerializer


# ─── RAG API Endpoints ───────────────────────────────────────────────────────

@api_view(['POST'])
def chat_with_matter(request):
    """
    POST /api/chat/
    Body: { "matter_id": int, "query": str }
    
    Retrieves relevant chunks from ChromaDB, generates a grounded AI response,
    and persists the exchange to AiChatLog.
    """
    matter_id = request.data.get('matter_id')
    query = request.data.get('query', '').strip()

    if not matter_id or not query:
        return Response(
            {'error': 'Both matter_id and query are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        matter = Matter.objects.get(id=matter_id)
    except Matter.DoesNotExist:
        return Response(
            {'error': 'Matter not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # 1. Retrieve relevant chunks from the vector DB
    chunks = retrieve_chunks(matter_id=matter.id, query=query, top_k=5)

    # 2. Generate a grounded AI response
    ai_result = generate_grounded_response(
        query=query,
        chunks=chunks,
        matter_title=matter.title,
    )

    # 3. Persist to AiChatLog
    AiChatLog.objects.create(
        matter=matter,
        user=request.user if request.user.is_authenticated else None,
        role='user',
        content=query,
    )
    AiChatLog.objects.create(
        matter=matter,
        user=None,
        role='assistant',
        content=ai_result['text'],
    )

    return Response({
        'text': ai_result['text'],
        'citations': ai_result['citations'],
        'confidence': ai_result['confidence'],
        'chunks_used': len(chunks),
    })


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def ingest_document_view(request):
    """
    POST /api/documents/ingest/
    Form data: file (PDF), matter_id (int)
    
    Uploads a PDF, extracts text, chunks it, and indexes into ChromaDB.
    Also creates/updates the Document record in the database.
    """
    matter_id = request.data.get('matter_id')
    uploaded_file = request.FILES.get('file')

    if not matter_id or not uploaded_file:
        return Response(
            {'error': 'Both matter_id and file are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        matter = Matter.objects.get(id=int(matter_id))
    except Matter.DoesNotExist:
        return Response(
            {'error': 'Matter not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    # Read the file bytes
    file_bytes = uploaded_file.read()
    file_name = uploaded_file.name
    file_size_kb = len(file_bytes) / 1024

    # Create the Document record
    doc = Document.objects.create(
        matter=matter,
        file=uploaded_file,
        file_name=file_name,
        file_size=f"{file_size_kb:.1f} KB",
        queued='completed',
        ocr='processing',
        classifying='pending',
        indexed='pending',
        progress_label='Extracting text...',
    )

    try:
        # Extract and index into ChromaDB
        chunks_indexed = ingest_document(
            matter_id=matter.id,
            document_id=doc.id,
            file_name=file_name,
            file_bytes=file_bytes,
        )

        # Count pages from PyPDF2
        from PyPDF2 import PdfReader
        from io import BytesIO
        reader = PdfReader(BytesIO(file_bytes))
        page_count = len(reader.pages)

        # Update document status
        doc.pages = page_count
        doc.ocr = 'completed'
        doc.classifying = 'completed'
        doc.indexed = 'completed'
        doc.progress_label = f'Indexed {chunks_indexed} chunks'
        doc.save()

        return Response({
            'id': doc.id,
            'file_name': file_name,
            'pages': page_count,
            'chunks_indexed': chunks_indexed,
            'status': 'completed',
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        doc.ocr = 'error'
        doc.error_message = str(e)
        doc.progress_label = 'Failed'
        doc.save()

        return Response(
            {'error': f'Ingestion failed: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
