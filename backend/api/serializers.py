from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Post, Comment, Like, Repost, CommentLike, Bookmark, Follow, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    followers_count = serializers.ReadOnlyField()
    following_count = serializers.ReadOnlyField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'bio', 'avatar',
            'company', 'date_joined', 'followers_count', 'following_count', 'is_following'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user != obj:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'parent', 'likes_count', 'created_at', 'replies', 'is_liked']
        read_only_fields = ['id', 'author', 'likes_count', 'created_at']

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return CommentLike.objects.filter(user=request.user, comment=obj).exists()
        return False

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    is_liked = serializers.SerializerMethodField()
    is_reposted = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'company_name', 'company_anonymous', 'reason_category',
            'title', 'content', 'image', 'is_anonymous', 'likes_count', 'comments_count',
            'reposts_count', 'bookmarks_count', 'created_at', 'updated_at',
            'comments', 'is_liked', 'is_reposted', 'is_bookmarked'
        ]
        read_only_fields = [
            'id', 'author', 'likes_count', 'comments_count', 'reposts_count',
            'bookmarks_count', 'created_at', 'updated_at'
        ]

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_reposted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Repost.objects.filter(user=request.user, post=obj).exists()
        return False

    def get_is_bookmarked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Bookmark.objects.filter(user=request.user, post=obj).exists()
        return False

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['company_name', 'company_anonymous', 'reason_category', 'title', 'content', 'image', 'is_anonymous']

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'actor', 'notification_type', 'post', 'comment', 'is_read', 'created_at']
