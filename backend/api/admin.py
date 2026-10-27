from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Post, Comment, Like, Repost, Bookmark, Follow, CommentLike, Notification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'company', 'is_staff', 'date_joined']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra', {'fields': ('bio', 'avatar', 'company', 'is_anonymous_default')}),
    )

for model in (Post, Comment, Like, Repost, Bookmark, Follow, CommentLike, Notification):
    admin.site.register(model)
