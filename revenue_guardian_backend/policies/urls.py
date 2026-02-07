from django.urls import path
from .views import (
    ClientListCreateView,
    PolicyListCreateView, PolicyDetailView,
    CarrierListView, ClientRetrieveUpdateDestroyView, PolicyRetrieveUpdateDestroyView, GlobalSearchView, CommissionSummaryView
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

    # Global Search
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('reports/commission-summary/', CommissionSummaryView.as_view(), name='commission-summary'),
]