from django.urls import path
from .views import (
    ClientListCreateView,
    PolicyListCreateView, PolicyDetailView,
    CarrierListView, ClientRetrieveUpdateDestroyView, PolicyRetrieveUpdateDestroyView
)

urlpatterns = [
    # Clients
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientRetrieveUpdateDestroyView.as_view(), name='client-detail'),

    # Policies
    path('policies/', PolicyListCreateView.as_view(), name='policy-list-create'),
    # path('policies/<int:pk>/', PolicyDetailView.as_view(), name='policy-detail'),
    path('policies/<int:pk>/', PolicyRetrieveUpdateDestroyView.as_view(), name='policy-detail'),
    
    # Carriers
    path('carriers/', CarrierListView.as_view(), name='carrier-list'),
]