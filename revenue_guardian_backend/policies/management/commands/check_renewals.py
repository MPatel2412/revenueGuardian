from django.core.management.base import BaseCommand
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from policies.models import Policy
from datetime import timedelta

class Command(BaseCommand):
    help = 'Checks for policies expiring in 90, 60, or 30 days and sends alerts'

    def handle(self, *args, **kwargs):
        today = timezone.now().date()
        intervals = [90, 60, 30]
        
        self.stdout.write("🔎 Checking for upcoming renewals...")

        total_alerts = 0

        for days in intervals:
            target_date = today + timedelta(days=days)
            
            # Find policies expiring exactly 'days' from now
            # AND that are currently Active or already Pending (to avoid alerting on Cancelled/Lapsed)
            expiring_policies = Policy.objects.filter(
                renewal_date=target_date,
                status__in=['ACTIVE', 'PENDING']
            )

            for policy in expiring_policies:
                # 1. Update Status to PENDING (if not already)
                if policy.status != 'PENDING':
                    policy.status = 'PENDING'
                    policy.save()
                    self.stdout.write(f"Updated status for Policy {policy.policy_number}")

                # 2. Send Email Alert
                self.send_renewal_alert(policy, days)
                total_alerts += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Process Complete. Sent {total_alerts} alerts."))

    def send_renewal_alert(self, policy, days_left):
        """
        Constructs and sends the email.
        """
        agent = policy.client.agent
        subject = f"⚠️ Action Required: Renewal in {days_left} Days - {policy.client.name}"
        
        message = (
            f"Hello {agent.username},\n\n"
            f"The policy for {policy.client.name} (Policy #: {policy.policy_number}) "
            f"is expiring on {policy.renewal_date}.\n\n"
            f"Carrier: {policy.carrier.name}\n"
            f"Premium: ${policy.premium_amount}\n\n"
            f"Please contact the client immediately to secure the renewal.\n\n"
            f"Client Phone: {policy.client.phone}\n"
            f"Client Email: {policy.client.email}\n"
        )

        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_FROM_ADDRESS,
                [agent.email], # Send to the Agent
                fail_silently=False,
            )
            self.stdout.write(f"   -> Email sent to {agent.email} for Client {policy.client.name}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"   -> Failed to send email: {e}"))