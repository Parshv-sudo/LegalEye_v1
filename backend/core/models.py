from django.db import models
from django.contrib.auth.models import User

class Organization(models.Model):
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    role = models.CharField(max_length=50, choices=[
        ('ADMIN', 'Admin'),
        ('PARTNER', 'Partner'),
        ('ASSOCIATE', 'Associate'),
        ('GUEST', 'Guest')
    ], default='ASSOCIATE')

    def __str__(self):
        return self.user.username

class Matter(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    code = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    case_description = models.TextField(blank=True)
    client = models.CharField(max_length=255)
    jurisdiction = models.CharField(max_length=100)
    next_hearing = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=50)
    internal_notes = models.TextField(blank=True)
    missing_info_note = models.TextField(blank=True)
    is_pinned = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    is_collaborative = models.BooleanField(default=False)
    # JSON fields for structured data without separate models
    summary_text_json = models.TextField(blank=True, default='[]')
    opposing_counsels_json = models.TextField(blank=True, default='[]')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} - {self.title}"

class Document(models.Model):
    matter = models.ForeignKey(Matter, related_name='documents', on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/', null=True, blank=True)
    file_name = models.CharField(max_length=255)
    file_size = models.CharField(max_length=50)
    pages = models.IntegerField(default=0)
    queued = models.CharField(max_length=20, default='completed')
    ocr = models.CharField(max_length=20, default='completed')
    classifying = models.CharField(max_length=20, default='completed')
    indexed = models.CharField(max_length=20, default='completed')
    progress_label = models.CharField(max_length=100, blank=True)
    error_message = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

class KeyIssue(models.Model):
    matter = models.ForeignKey(Matter, related_name='key_issues', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=50, default='pending')
    doc_ref = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title

class TimelineEvent(models.Model):
    matter = models.ForeignKey(Matter, related_name='timeline_events', on_delete=models.CASCADE)
    date = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status_color = models.CharField(max_length=20, blank=True)

    def __str__(self):
        return f"{self.date}: {self.title}"

class AiChatLog(models.Model):
    matter = models.ForeignKey(Matter, related_name='chat_logs', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    role = models.CharField(max_length=50, choices=[('user', 'User'), ('assistant', 'Assistant'), ('system', 'System')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"[{self.timestamp}] {self.role}: {self.content[:50]}"
