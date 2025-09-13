"""
CodeBuddy URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', TemplateView.as_view(template_name='home.html'), name='home'),

    # Authentication
    path('auth/', include('apps.authentication.urls')),
    path('accounts/', include('allauth.urls')),

    # Main apps
    path('rooms/', include('apps.rooms.urls')),
    path('analytics/', include('apps.analytics.urls')),

    # API endpoints
    path('api/auth/', include('apps.authentication.urls', namespace='api-auth')),
    path('api/rooms/', include('apps.rooms.urls', namespace='api-rooms')),
    path('api/analytics/', include('apps.analytics.urls', namespace='api-analytics')),

    # Health check
    path('health/', TemplateView.as_view(template_name='health.html'), name='health'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

# Admin customization
admin.site.site_header = 'CodeBuddy Administration'
admin.site.site_title = 'CodeBuddy Admin'
admin.site.index_title = 'Welcome to CodeBuddy Administration'
