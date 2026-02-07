from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Client, Policy, Carrier
from .serializers import ClientSerializer, PolicySerializer, CarrierSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth

class CarrierListView(generics.ListAPIView):
    queryset = Carrier.objects.all()
    serializer_class = CarrierSerializer
    permission_classes = [permissions.IsAuthenticated]


# --- Client Views ---
class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        SECURITY: Only return clients belonging to the logged-in agent.
        """
        return Client.objects.filter(agent=self.request.user)

    def perform_create(self, serializer):
        """
        AUTOMATION: Auto-assign the logged-in user as the 'agent'.
        """
        serializer.save(agent=self.request.user)

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Prevents Agent A from accessing Agent B's client via ID URL
        return Client.objects.filter(agent=self.request.user)

class ClientRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    Handles GET, PUT, PATCH, DELETE for a single Client instance.
    """
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Crucial security filter: Agents can only view/update their own clients.
        return Client.objects.filter(agent=self.request.user)

# --- Policy Views ---
class PolicyListCreateView(generics.ListCreateAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return policies where the client belongs to the logged-in agent
        # return Policy.objects.filter(client__agent=self.request.user)
        
        # 1. Start with all policies owned by this agent
        queryset = Policy.objects.filter(client__agent=self.request.user)
        
        # 2. Check if the URL has ?client_id=X
        client_id = self.request.query_params.get('client_id')
        
        # 3. If yes, filter further
        if client_id:
            queryset = queryset.filter(client_id=client_id)
            
        return queryset

class PolicyRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Security: Only allow agents to edit their own policies
        return Policy.objects.filter(client__agent=self.request.user)

class PolicyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Policy.objects.filter(client__agent=self.request.user)


class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({"clients": [], "policies": []})

        user = request.user

        # 1. Search Clients (Name, Email, Phone) belonging to this agent
        clients = Client.objects.filter(
            agent=user
        ).filter(
            Q(name__icontains=query) | 
            Q(email__icontains=query) | 
            Q(phone__icontains=query)
        )[:5] # Limit to 5 results

        # 2. Search Policies (Policy Number, Vehicle Number) belonging to this agent
        policies = Policy.objects.filter(
            client__agent=user
        ).filter(
            Q(policy_number__icontains=query) | 
            Q(vehicle_number__icontains=query) |
            Q(prev_policy_number__icontains=query)
        )[:5] # Limit to 5 results

        return Response({
            "clients": ClientSerializer(clients, many=True).data,
            "policies": PolicySerializer(policies, many=True).data
        })

class CommissionSummaryView(APIView):
    """
    Returns monthly aggregation of commissions and business volume.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # 1. Get all active policies for this agent
        # We filter by 'start_date' to see when the business was booked
        queryset = Policy.objects.filter(
            client__agent=request.user,
            status='ACTIVE'
        ).annotate(
            month=TruncMonth('start_date')
        ).values('month').annotate(
            total_commission=Sum('commission_amount'),
            total_premium=Sum('premium_amount'),
            policy_count=Count('id')
        ).order_by('-month') # Most recent first

        return Response(queryset)
