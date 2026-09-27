"""
LegalEye — Seed Command

Creates initial data so the app works out of the box:
- Admin superuser (admin / password123)
- Demo organization
- Realistic litigation matter with key issues, timeline events, and documents

Usage: python manage.py seed
"""

import json
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.models import Organization, UserProfile, Matter, Document, KeyIssue, TimelineEvent


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
            defaults={'name': 'Mehta & Associates'},
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

        # 4. Clear existing data for clean seed
        Matter.objects.all().delete()
        self.stdout.write(self.style.WARNING('Cleared existing matters for fresh seed.'))

        # ─── Summary Text (Case Intelligence) ────────────────────────────
        summary_text = [
            {
                "paragraph": "Meridian Realty Group Pvt. Ltd. entered into a Joint Development Agreement dated 15th March 2022 with Apex Constructions Ltd. for the development of a residential project comprising 320 units across 4 towers on 5.2 acres in Sector 72, Gurugram. The total estimated project cost was Rs. 85 Crores, with Meridian contributing land valued at Rs. 32 Crores and Apex responsible for Rs. 53 Crores in construction investment.",
                "citations": [
                    {"label": "Doc 1, p.1", "docNum": 1, "page": 1, "docName": "Joint_Development_Agreement_2022.pdf"},
                    {"label": "Doc 1, p.2", "docNum": 1, "page": 2, "docName": "Joint_Development_Agreement_2022.pdf"}
                ]
            },
            {
                "paragraph": "The project has experienced significant delays and quality deficiencies. The Plaintiff's independent structural engineer reports only 45% completion as of January 2024 — well past the original March 2024 deadline — with critical findings including M-20 grade concrete (instead of mandated M-30), Fe-415 steel (instead of Fe-500D), and visible structural honeycombing in Tower A. The Defendant's engineer disputes this, claiming 78% completion with all materials IS-compliant.",
                "citations": [
                    {"label": "Doc 3, p.1", "docNum": 3, "page": 1, "docName": "Site_Inspection_Report_Plaintiff_Engineer.pdf", "isWarning": True},
                    {"label": "Doc 4, p.1", "docNum": 4, "page": 1, "docName": "Site_Inspection_Report_Defendant_Engineer.pdf", "isWarning": True},
                    {"label": "Doc 3, p.2", "docNum": 3, "page": 2, "docName": "Site_Inspection_Report_Plaintiff_Engineer.pdf"}
                ]
            },
            {
                "paragraph": "Financial analysis reveals a discrepancy of Rs. 5.75 Crores between total payments made (Rs. 20.25 Crores) and documented expenditure (Rs. 14.50 Crores). A payment of Rs. 2.80 Crores was diverted to a PNB account linked to the CMD's personal address. Board meeting minutes from September 2023 confirm the Board approved diverting Rs. 3.50 Crores from this project to service loan obligations for another project, with the Independent Director recording his dissent.",
                "citations": [
                    {"label": "Doc 5, p.3", "docNum": 5, "page": 3, "docName": "Payment_Schedule_Bank_Statements.pdf", "isWarning": True},
                    {"label": "Doc 8, p.1", "docNum": 8, "page": 1, "docName": "Board_Meeting_Minutes_Apex_Sep2023.pdf", "isWarning": True},
                    {"label": "Doc 8, p.2", "docNum": 8, "page": 2, "docName": "Board_Meeting_Minutes_Apex_Sep2023.pdf"}
                ]
            },
            {
                "paragraph": "An independent valuation by Cushman & Wakefield estimates the total loss to Meridian Realty at Rs. 52.65 Crores, comprising opportunity cost (Rs. 9.40 Cr), diminished project value (Rs. 38 Cr), remediation costs (Rs. 4.50 Cr), and regulatory penalties (Rs. 0.75 Cr). The land itself has appreciated 50% since the JDA, from Rs. 32 Crores to Rs. 48 Crores, which strengthens the Plaintiff's claim for return of possession.",
                "citations": [
                    {"label": "Doc 12, p.1", "docNum": 12, "page": 1, "docName": "Third_Party_Valuation_Report.pdf"},
                    {"label": "Doc 12, p.2", "docNum": 12, "page": 2, "docName": "Third_Party_Valuation_Report.pdf"}
                ]
            }
        ]

        # ─── Opposing Counsels ────────────────────────────────────────────
        opposing_counsels = [
            {
                "id": "oc-1",
                "name": "Adv. Sunil Khanna",
                "firm": "Khanna & Partners, Advocates & Solicitors",
                "email": "sunil.khanna@khannapartners.in"
            },
            {
                "id": "oc-2",
                "name": "Adv. Ritika Bose",
                "firm": "Khanna & Partners (Junior Counsel)",
                "email": "ritika.bose@khannapartners.in"
            }
        ]

        # ─── Create the Matter ────────────────────────────────────────────
        matter = Matter.objects.create(
            organization=org,
            code='MRG-2024-001',
            title='Meridian Realty v. Apex Constructions — Breach of JDA',
            case_description=(
                'Commercial dispute arising from breach of a Joint Development Agreement dated '
                '15.03.2022 for a residential project at Sector 72, Gurugram. The Plaintiff (landowner) '
                'alleges construction delays, use of substandard materials in violation of agreed IS '
                'specifications, fund diversion of approximately Rs. 5.75 Crores, and failure to comply '
                'with Supplementary Agreement obligations. The Defendant denies all allegations and '
                'claims delays were due to force majeure and non-cooperation by the Plaintiff.'
            ),
            client='Meridian Realty Group Pvt. Ltd.',
            jurisdiction='Delhi High Court, New Delhi',
            next_hearing='Nov 12, 2024',
            status='Active',
            internal_notes=(
                'Priority: Obtain interim injunction restraining Apex from selling any units or '
                'alienating the property. The Board minutes (Doc 8) are our strongest evidence of '
                'deliberate fund diversion — ensure certified copies are filed. CFO Kavita Nair\'s '
                'affidavit confirming the Rs. 5.75 Cr discrepancy is ready for filing. Senior Partner '
                'to review the Written Statement before the Nov 12 hearing.'
            ),
            missing_info_note=(
                'Awaiting: (1) Certified copies of Apex Constructions\' audited financial statements '
                'for FY 2022-23 and FY 2023-24 — critical for establishing fund diversion quantum. '
                '(2) NABL laboratory test reports referenced by Defendant\'s engineer (Report Nos. '
                'CT/2024/0145 to CT/2024/0168) — need to verify if these actually exist. '
                '(3) Bank statements for PNB A/c No. 6145002100098765 to confirm beneficiary identity. '
                '(4) M/s VM Enterprises incorporation documents and GST returns.'
            ),
            is_pinned=True,
            summary_text_json=json.dumps(summary_text),
            opposing_counsels_json=json.dumps(opposing_counsels),
        )

        # ─── Key Issues (5 realistic issues) ─────────────────────────────
        KeyIssue.objects.create(
            matter=matter,
            title='Material quality breach — M-20 concrete vs mandated M-30 (Clause 7.3 JDA)',
            status='warning',
            doc_ref='Doc 3, p.2',
        )
        KeyIssue.objects.create(
            matter=matter,
            title='Fund diversion — Rs. 5.75 Cr unaccounted, Board-approved transfer to Sector 89 project',
            status='warning',
            doc_ref='Doc 8, p.1',
        )
        KeyIssue.objects.create(
            matter=matter,
            title='Conflicting completion assessments — 45% (Plaintiff) vs 78% (Defendant)',
            status='warning',
            doc_ref='Doc 3, p.1',
        )
        KeyIssue.objects.create(
            matter=matter,
            title='Non-compliance with Supplementary Agreement — no escrow, no audit, no investment',
            status='check',
            doc_ref='Doc 2, p.2',
        )
        KeyIssue.objects.create(
            matter=matter,
            title='Validity of force majeure defence — timeline analysis pending',
            status='pending',
        )

        # ─── Timeline Events (7 realistic procedural events) ─────────────
        TimelineEvent.objects.create(
            matter=matter,
            date='Mar 15, 2022',
            title='Joint Development Agreement Executed',
            description='JDA executed between Meridian Realty and Apex Constructions for 320-unit residential project at Sector 72, Gurugram. Total project cost: Rs. 85 Crores.',
            status_color='#2D5A27',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Jul 12, 2022',
            title='HRERA Registration Obtained',
            description='Project registered with Haryana RERA (Reg. No. HRERA-GRG-PROJ-742-2022). Expected completion: March 2024.',
            status_color='#115fd4',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Oct 18, 2023',
            title='Supplementary Agreement / Addendum Signed',
            description='Completion deadline extended to June 2024. Penalties waived (Rs. 65L). Apex committed Rs. 8 Cr additional investment, Grade-A audit, and escrow account — none fulfilled.',
            status_color='#B45309',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Jan 15, 2024',
            title='Plaintiff\'s Site Inspection — 45% Complete',
            description='Independent structural engineer Er. Anand Krishnan inspected the site. Found 45% completion, substandard M-20 concrete, Fe-415 steel, and structural honeycombing.',
            status_color='#DC2626',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Feb 25, 2024',
            title='Legal Notice Served Under Section 80 CPC',
            description='Legal notice demanding Rs. 52.25 Crores (payments + penalty + damages) and return of possession. 30-day response period.',
            status_color='#0A192F',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Jun 10, 2024',
            title='Suit Filed — CS(COMM) 287/2024',
            description='Commercial suit filed before Delhi High Court seeking permanent injunction, recovery of Rs. 52.25 Crores, damages, and return of possession. Application for interim injunction under Order 39 filed simultaneously.',
            status_color='#0A192F',
        )
        TimelineEvent.objects.create(
            matter=matter,
            date='Nov 12, 2024',
            title='Next Hearing — Arguments on Interim Injunction',
            description='Listed for arguments on the ad-interim injunction application. Both parties to file written submissions 5 days prior. Court has directed Apex to file affidavit of assets.',
            status_color='#DC2626',
        )

        # ─── Seed Documents (matching the chunk data) ─────────────────────
        docs_data = [
            ("Joint_Development_Agreement_2022.pdf", "2.4 MB", 3),
            ("Supplementary_Agreement_Addendum_Oct2023.pdf", "1.8 MB", 2),
            ("Site_Inspection_Report_Plaintiff_Engineer.pdf", "3.1 MB", 2),
            ("Site_Inspection_Report_Defendant_Engineer.pdf", "2.7 MB", 2),
            ("Payment_Schedule_Bank_Statements.pdf", "1.5 MB", 3),
            ("Legal_Notice_Plaintiff_to_Defendant.pdf", "1.2 MB", 2),
            ("Reply_Legal_Notice_Defendant.pdf", "1.4 MB", 2),
            ("Board_Meeting_Minutes_Apex_Sep2023.pdf", "0.9 MB", 2),
            ("Email_Correspondence_Chain.pdf", "0.7 MB", 3),
            ("HRERA_Registration_Certificate.pdf", "0.4 MB", 1),
            ("Architect_Completion_Certificate.pdf", "1.1 MB", 2),
            ("Third_Party_Valuation_Report.pdf", "2.3 MB", 2),
        ]

        for file_name, file_size, pages in docs_data:
            Document.objects.create(
                matter=matter,
                file_name=file_name,
                file_size=file_size,
                pages=pages,
                queued='completed',
                ocr='completed',
                classifying='completed',
                indexed='completed',
                progress_label=f'Indexed {pages} pages',
            )

        self.stdout.write(self.style.SUCCESS(
            'Created matter: %s -- %s\n'
            '  - %d key issues\n'
            '  - %d timeline events\n'
            '  - %d documents' % (
                matter.code, matter.title,
                matter.key_issues.count(),
                matter.timeline_events.count(),
                matter.documents.count(),
            )
        ))

        self.stdout.write(self.style.SUCCESS('\nSeed complete! You can log in with: admin / password123'))
