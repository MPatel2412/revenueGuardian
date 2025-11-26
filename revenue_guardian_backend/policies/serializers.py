from rest_framework import serializers
from .models import Client, Policy, Carrier

class CarrierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrier
        fields = '__all__'

class ClientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Client model.
    The 'agent' field is ReadOnly because it is set automatically by the backend.
    """
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'phone', 'age', 'gender', 'address', 'total_policies', 'created_at']
        read_only_fields = ['agent'] 

class PolicySerializer(serializers.ModelSerializer):
    """
    Serializer for the Policy model.
    """
    # These allow us to see the NAMES in the JSON response, not just IDs
    client_details = ClientSerializer(source='client', read_only=True)
    carrier_details = CarrierSerializer(source='carrier', read_only=True)
    
    class Meta:
        model = Policy
        fields = [
            'id', 'policy_number', 'client', 'carrier', 
            'client_details', 'carrier_details', # Nested data for display
            'policy_type', 'status', 'premium_amount', 
            'sum_insured', 'start_date', 'end_date', 'renewal_date', 'policy_file'
        ]

    def validate(self, data):
        """
        Check that end_date is after start_date.
        Handles both Create (all data present) and Update (partial data).
        """
        # 1. Get the instance being updated (if it exists)
        instance = getattr(self, 'instance', None)

        # 2. Get start_date: Use incoming data, fallback to existing DB instance, or None
        start_date = data.get('start_date', instance.start_date if instance else None)
        
        # 3. Get end_date: Use incoming data, fallback to existing DB instance, or None
        end_date = data.get('end_date', instance.end_date if instance else None)

        # 4. Perform the check only if we have both dates
        if start_date and end_date:
            if start_date > end_date:
                raise serializers.ValidationError("End date must be after start date.")
        
        return data