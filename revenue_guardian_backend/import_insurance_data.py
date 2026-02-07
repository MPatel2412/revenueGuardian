import os
import sys
import django
import pandas as pd
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Optional, Union, Tuple
from django.db import transaction
from django.db.models import Q

# ==============================================================================
# SECTION 1: SETUP
# ==============================================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

# !!! UPDATE THIS TO YOUR PROJECT NAME !!!
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    django.setup()
except Exception as e:
    print(f"Error loading Django: {e}")
    sys.exit(1)

from django.conf import settings
from django.contrib.auth import get_user_model
# !!! UPDATE THIS TO YOUR APP NAME !!!
from policies.models import Client, Carrier, Policy 

User = get_user_model()

# ==============================================================================
# SECTION 2: HELPER FUNCTIONS & DATA CLASS
# ==============================================================================

def extract_period_dates(val: str) -> Tuple[Optional[date], Union[date, str, None]]:
    if pd.isna(val) or val == '': return None, None
    val = str(val).strip().upper()
    parts = val.split(' TO ')
    start_date, end_date = None, None
    
    def parse_dmy(date_str):
        try:
            return datetime.strptime(date_str.strip(), "%d/%m/%Y").date()
        except (ValueError, TypeError):
            return None

    if len(parts) >= 1: start_date = parse_dmy(parts[0])
    if len(parts) >= 2:
        raw_end = parts[1].strip()
        parsed_end = parse_dmy(raw_end)
        end_date = parsed_end if parsed_end else raw_end
    return start_date, end_date

@dataclass
class InsuranceRecord:
    transaction_date: Optional[date]
    insured_name: str
    policy_no: str
    po_no: str
    received_status: str
    policy_type: str
    premium: Decimal
    service_tax: Decimal
    sum_insured: Decimal
    period_start: Optional[date]
    period_end: Union[date, str, None]
    vehicle_no: str
    remark: Optional[str]
    company_name: str
    agent_name: str
    bank_name: str
    cheque_no: str
    agency_code: str
    od_net_premium: Decimal
    commission: Decimal

    @classmethod
    def from_dict(cls, row: dict):
        def to_decimal(val):
            if pd.isna(val) or val == '': return Decimal('0.00')
            try: return Decimal(str(val).replace(',', '').replace('$', '').strip())
            except InvalidOperation: return Decimal('0.00')

        def to_date(val):
            if isinstance(val, (datetime, pd.Timestamp)): return val.date()
            return None

        def clean_str(val):
            return "" if pd.isna(val) else str(val).strip()

        raw_period = clean_str(row.get('PERIOD'))
        p_start, p_end = extract_period_dates(raw_period)

        return cls(
            transaction_date=to_date(row.get('DATE')),
            insured_name=clean_str(row.get('INSURED  NAME')),
            policy_no=clean_str(row.get('POLICY NO')),
            po_no=clean_str(row.get('PONO')),
            received_status=clean_str(row.get(' RECEIVED')),
            policy_type=clean_str(row.get('POLICY TYPE')),
            premium=to_decimal(row.get('PREMIUM')),
            service_tax=to_decimal(row.get('S TAX')),
            sum_insured=to_decimal(row.get('SUM INSURED')),
            period_start=p_start,
            period_end=p_end,
            vehicle_no=clean_str(row.get('VEHICLE NO')),
            remark=clean_str(row.get('REMARK')) if row.get('REMARK') else None,
            company_name=clean_str(row.get('NAME OF CO')),
            agent_name=clean_str(row.get('AGENT NAME')),
            bank_name=clean_str(row.get('BANK')),
            cheque_no=clean_str(row.get('CHE NO')),
            agency_code=clean_str(row.get('AGENCY CODE')),
            od_net_premium=to_decimal(row.get('OD/NET')),
            commission=to_decimal(row.get('COMISION'))
        )

# ==============================================================================
# SECTION 3: IMPORT LOGIC (UPDATED)
# ==============================================================================

def get_agent_by_name(name_str):
    """
    Tries to find a Django User matching the Excel name.
    1. Checks username (exact match)
    2. Checks first_name (case-insensitive)
    """
    if not name_str: return None
    
    # Try exact username match first
    user = User.objects.filter(username__iexact=name_str).first()
    if user: return user

    # Try First Name match
    user = User.objects.filter(first_name__iexact=name_str).first()
    if user: return user
    
    return None

def load_excel_to_django(file_path):
    print(f"Reading file: {file_path}...")
    try:
        df = pd.read_excel(file_path, parse_dates=['DATE'])
    except Exception as e:
        print(f"Error reading Excel file: {e}")
        return

    success_count = 0
    errors = []

    print("Starting import...")

    for index, row in df.iterrows():
        try:
            record = InsuranceRecord.from_dict(row.to_dict())
            
            # --- 1. FIND THE SPECIFIC AGENT ---
            # We look up the user based on the 'AGENT NAME' column
            agent_user = get_agent_by_name(record.agent_name)
            # print(agent_user)
            if not agent_user:
                # OPTION A: Skip row if agent not found
                raise Exception(f"Agent '{record.agent_name}' not found in Database. Please create this user first.")
                
                # OPTION B (Alternative): If you want to default to Admin if not found, uncomment below:
                # agent_user = User.objects.filter(is_superuser=True).first()

            with transaction.atomic():
                # --- 2. CARRIER ---
                carrier_name = record.company_name if record.company_name else "Unknown Carrier"
                carrier, _ = Carrier.objects.get_or_create(name=carrier_name)

                # --- 3. CLIENT (Linked to the Specific Agent) ---
                client, created = Client.objects.get_or_create(
                    name=record.insured_name,
                    agent=agent_user,  # <--- LINKING TO SPECIFIC AGENT HERE
                    defaults={
                        'email': 'unknown@example.com',
                        'phone': '0000000000',
                        'gender': 'O',
                        'address': 'Imported from Excel',
                    }
                )

                # --- 4. POLICY ---
                final_start_date = record.period_start if record.period_start else date.today()
                
                # Date Logic
                extra_remarks = ""
                if isinstance(record.period_end, date):
                    final_end_date = record.period_end
                    final_renewal_date = record.period_end
                else:
                    final_end_date = final_start_date 
                    final_renewal_date = final_start_date
                    if record.period_end:
                        extra_remarks = f" [End Period Text: {record.period_end}]"

                full_remarks = (record.remark or "") + extra_remarks

                if not Policy.objects.filter(policy_number=record.policy_no).exists():
                    Policy.objects.create(
                        client=client,
                        carrier=carrier,
                        policy_number=record.policy_no,
                        prev_policy_number=record.po_no,
                        policy_type=record.policy_type,
                        status='ACTIVE',
                        premium_amount=record.premium,
                        s_tax=record.service_tax,
                        sum_insured=record.sum_insured,
                        start_date=final_start_date,
                        end_date=final_end_date,
                        renewal_date=final_renewal_date,
                        vehicle_number=record.vehicle_no,
                        bank_name=record.bank_name,
                        cheque_number=record.cheque_no,
                        agency_code=record.agency_code,
                        od_net_amount=record.od_net_premium,
                        commission_amount=record.commission,
                        remarks=full_remarks.strip()
                    )
                    success_count += 1
                else:
                    errors.append(f"Skipped duplicate Policy No: {record.policy_no}")

        except Exception as e:
            errors.append(f"Row {index} Error: {e}")

    print(f"\n--- Import Complete ---")
    print(f"Successfully imported: {success_count}")
    if errors:
        print(f"Errors ({len(errors)}):")
        for err in errors:
            print(f" - {err}")

if __name__ == "__main__":
    EXCEL_FILE_PATH = '/home/manthan-patel/Desktop/ExcelToPostgres/data_modified.xlsx'  # Update this path
    if os.path.exists(EXCEL_FILE_PATH):
        load_excel_to_django(EXCEL_FILE_PATH)
    else:
        print(f"File not found: {EXCEL_FILE_PATH}")