"""
LegalEye — Seed Command

Creates initial data so the app works out of the box:
- Admin superuser (admin / password123)
- Demo organization
- Sample matter with key issues and timeline events

Usage: python manage.py seed
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Organization, UserProfile, Matter, KeyIssue, TimelineEvent


class Command(BaseCommand):
    help = 'Seed the database with initial data for development'

    def handle(self, *args, **options):
        # 1. Create superuser
        if User.objects.filter(username='admin').exists():
            user = User.objects.get(username='admin')
            self.stdout.write(self.style.WARNING('Admin user already exists — skipping.'))
        else:
            user = User.objects.create_superuser(
                username='admin',
                email='admin@legaleye.in',
                password='password123',
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin / password123'))

        # 2. Create organization
        org, created = Organization.objects.get_or_create(
            id=1,
            defaults={'name': 'LegalEye Demo Firm'},
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created organization: {org.name}'))
        else:
            self.stdout.write(self.style.WARNING(f'Organization already exists: {org.name}'))

        # 3. Create user profile
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'organization': org, 'role': 'ADMIN'},
        )
        if created:
            self.stdout.write(self.style.SUCCESS('Created user profile for admin'))

        # 4. Create a sample matter (if none exist)
        if Matter.objects.exists():
            self.stdout.write(self.style.WARNING('Matters already exist — skipping sample matter.'))
        else:
            matter = Matter.objects.create(
                organization=org,
                code='LE-2024-001',
                title='Sharma Industries v. Global Tech Solutions — IP Infringement',
                case_description=(
                    'Dispute involving alleged infringement of proprietary industrial design patents '
                    'held by Sharma Industries Pvt Ltd. The Defendant, Global Tech Solutions, is accused '
                    'of manufacturing and distributing products that replicate patented schematics without '
                    'licensing or authorisation under the Patents Act, 1970.'
                ),
                client='Sharma Industries Pvt Ltd',
                jurisdiction='Delhi High Court, New Delhi',
                next_hearing='Oct 15, 2024',
                status='Active',
                internal_notes=(
                    'Client has expressed urgency regarding interim injunction. '
                    'Senior Partner to review the draft Written Statement before filing.'
                ),
                missing_info_note=(
                    'Awaiting certified copies of patent registration certificates (Patent Nos. 2019/DEL/001234 '
                    'and 2020/DEL/005678). Also pending: Defendant\'s audited financial statements for FY 2022-23 '
                    'to establish quantum of damages.'
                ),
                is_pinned=True,
            )

            # Key Issues
            KeyIssue.objects.create(
                matter=matter,
                title='Validity of Patent Registration under Section 3(d)',
                status='check',
                doc_ref='Doc 1, p.3',
            )
            KeyIssue.objects.create(
                matter=matter,
                title='Prior art defence — public domain disclosure before priority date',
                status='warning',
                doc_ref='Doc 2, p.7',
            )
            KeyIssue.objects.create(
                matter=matter,
                title='Calculation of damages under Section 108 of Patents Act',
                status='pending',
            )

            # Timeline events
            TimelineEvent.objects.create(
                matter=matter,
                date='Jan 15, 2024',
                title='Suit Filed — CS(COMM) 412/2024',
                description='Original suit filed before Delhi High Court (Commercial Division) seeking permanent injunction and damages.',
                status_color='#2D5A27',
            )
            TimelineEvent.objects.create(
                matter=matter,
                date='Feb 22, 2024',
                title='Summons Issued to Defendant',
                description='Court issued summons to Global Tech Solutions through registered post and email service.',
                status_color='#115fd4',
            )
            TimelineEvent.objects.create(
                matter=matter,
                date='Apr 10, 2024',
                title='Written Statement Filed by Defendant',
                description='Defendant filed Written Statement denying all allegations and raising prior art defence under Section 64.',
                status_color='#B45309',
            )
            TimelineEvent.objects.create(
                matter=matter,
                date='Jun 5, 2024',
                title='Application for Interim Injunction (Order 39 Rules 1 & 2)',
                description='Plaintiff filed application seeking ad-interim injunction restraining Defendant from manufacturing the impugned products.',
                status_color='#0A192F',
            )
            TimelineEvent.objects.create(
                matter=matter,
                date='Oct 15, 2024',
                title='Next Hearing — Arguments on Injunction Application',
                description='Listed for arguments on the interim injunction application. Both parties to file written submissions 3 days prior.',
                status_color='#DC2626',
            )

            self.stdout.write(self.style.SUCCESS(f'Created sample matter: {matter.code} — {matter.title}'))

        self.stdout.write(self.style.SUCCESS('\nSeed complete! You can log in with: admin / password123'))
