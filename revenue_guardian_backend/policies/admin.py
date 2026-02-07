from django.contrib import admin
from .models import Client, Carrier, Policy

# Register your models here.

admin.site.register(Client)
admin.site.register(Carrier)
admin.site.register(Policy)
