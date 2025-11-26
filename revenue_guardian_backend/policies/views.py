from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Client, Policy, Carrier
from .serializers import ClientSerializer, PolicySerializer, CarrierSerializer


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


# --- Policy Views ---
class PolicyListCreateView(generics.ListCreateAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return policies where the client belongs to the logged-in agent
        return Policy.objects.filter(client__agent=self.request.user)

class PolicyDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PolicySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Policy.objects.filter(client__agent=self.request.user)
