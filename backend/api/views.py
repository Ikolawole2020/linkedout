from django.contrib.auth import update_session_auth_hash
from rest_framework import generics, status, viewsets
from django.contrib.auth.password_validation import validate_password
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count
from .models import Post, Comment, Like, Repost, CommentLike, Bookmark, Follow, Notification
from .serializers import (
    UserSerializer, RegisterSerializer, PostSerializer, PostCreateSerializer,
    CommentSerializer, NotificationSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return User.objects.all()
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not request.user.check_password(old_password):
            return Response({'error': 'Wrong password'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new_password, request.user)
        except Exception as e:
            return Response({'error': list(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'status': 'password changed'})

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        user_to_follow = self.get_object()
        if user_to_follow == request.user:
            return Response({'error': 'Cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
        if not created:
            follow.delete()
            return Response({'following': False})
        Notification.objects.create(
            recipient=user_to_follow,
            actor=request.user,
            notification_type='follow'
        )
        return Response({'following': True})

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        user = self.get_object()
        posts = Post.objects.filter(author=user)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('author').prefetch_related('comments', 'likes', 'reposts', 'bookmarks')
    permission_classes = [IsAuthenticatedOrReadOnly]
    serializer_class = PostSerializer

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PostCreateSerializer
        return PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        company = self.request.query_params.get('company')
        reason = self.request.query_params.get('reason')
        search = self.request.query_params.get('search')
        sort = self.request.query_params.get('sort', 'newest')

        if company:
            queryset = queryset.filter(company_name__icontains=company)
        if reason:
            queryset = queryset.filter(reason_category=reason)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search) | Q(company_name__icontains=search)
            )

        if sort == 'top':
            queryset = queryset.order_by('-likes_count', '-created_at')
        elif sort == 'discussed':
            queryset = queryset.order_by('-comments_count', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def destroy(self, request, *args, **kwargs):
        post = self.get_object()
        if post.author != request.user:
            return Response({'error': 'You can only delete your own posts'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            post.likes_count = max(0, post.likes_count - 1)
        else:
            post.likes_count += 1
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author, actor=request.user,
                    notification_type='like', post=post
                )
        post.save(update_fields=['likes_count'])
        return Response({'liked': created, 'likes_count': post.likes_count})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bookmark(self, request, pk=None):
        post = self.get_object()
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            bookmark.delete()
            post.bookmarks_count = max(0, post.bookmarks_count - 1)
        else:
            post.bookmarks_count += 1
        post.save(update_fields=['bookmarks_count'])
        return Response({'bookmarked': created, 'bookmarks_count': post.bookmarks_count})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def repost(self, request, pk=None):
        post = self.get_object()
        comment = request.data.get('comment', '')
        repost, created = Repost.objects.get_or_create(user=request.user, post=post, defaults={'comment': comment})
        if not created:
            repost.delete()
            post.reposts_count = max(0, post.reposts_count - 1)
        else:
            post.reposts_count += 1
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author, actor=request.user,
                    notification_type='repost', post=post
                )
        post.save(update_fields=['reposts_count'])
        return Response({'reposted': created, 'reposts_count': post.reposts_count})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def comment(self, request, pk=None):
        post = self.get_object()
        parent_id = request.data.get('parent')
        serializer = CommentSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            comment = serializer.save(author=request.user, post=post, parent_id=parent_id if parent_id else None)
            post.comments_count += 1
            post.save(update_fields=['comments_count'])
            if post.author != request.user:
                Notification.objects.create(
                    recipient=post.author, actor=request.user,
                    notification_type='comment', post=post, comment=comment
                )
            return Response(CommentSerializer(comment, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def bookmarks(self, request):
        posts = Post.objects.filter(bookmarks__user=request.user)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def following_feed(self, request):
        following_ids = request.user.following.values_list('following_id', flat=True)
        posts = Post.objects.filter(author_id__in=following_ids)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def companies(self, request):
        companies = (
            Post.objects.values('company_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:30]
        )
        return Response(list(companies))

    @action(detail=False, methods=['get'])
    def by_company(self, request):
        company = request.query_params.get('name', '')
        posts = Post.objects.filter(company_name__iexact=company)
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related('author')
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        comment = self.get_object()
        like, created = CommentLike.objects.get_or_create(user=request.user, comment=comment)
        if not created:
            like.delete()
            comment.likes_count = max(0, comment.likes_count - 1)
        else:
            comment.likes_count += 1
        comment.save(update_fields=['likes_count'])
        return Response({'liked': created, 'likes_count': comment.likes_count})

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'marked as read'})
