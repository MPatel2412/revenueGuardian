from django.urls import path
from .views import (
    ClientListCreateView, ClientDetailView,
    PolicyListCreateView, PolicyDetailView,
    CarrierListView
)

urlpatterns = [
    # Clients
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),

    # Policies
    path('policies/', PolicyListCreateView.as_view(), name='policy-list-create'),
    path('policies/<int:pk>/', PolicyDetailView.as_view(), name='policy-detail'),
    
    # Carriers
    path('carriers/', CarrierListView.as_view(), name='carrier-list'),
]