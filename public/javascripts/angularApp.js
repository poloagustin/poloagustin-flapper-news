/// <reference path="../../typings/angularjs/angular.d.ts" />
/// <reference path="../../bower_components/angular-ui-router/api/angular-ui-router.d.ts" />

var app = angular.module('flapperNews', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function ($stateProvider, $urlRouterProvider) {
		$stateProvider.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl',
			resolve: {
				postPromise: [
					'posts', 
					function (posts) {
						return posts.getAll();
					}
				]
			}
		});
		
		$stateProvider.state('posts', {
			url: '/posts/{id}',
			templateUrl: '/posts.html',
			controller: 'PostsCtrl',
			resolve: {
				post: [
					'$stateParams', 
					'posts', 
					function ($stateParams, posts) {
						return posts.get($stateParams.id);
					}
				]
			}
		});
		
		$urlRouterProvider.otherwise('home');
	}
]);

app.factory('posts', [
	'$http', 
	function ($http) {
		var o = {
			posts: [],
			getAll: function () {
				return $http.get('/posts')
					.success(function (data) {
						angular.copy(data, o.posts);
					});
			},
			create: function (post) {
				return $http.post('/posts', post)
					.success(function (data) {
						o.posts.push(data);
					});
			},
			upvote: function (post) {
				return $http.put('/posts/' + post._id + '/upvote')
					.success(function (data) {
						post.upvotes += 1;
					});
			},
			get: function (id) {
				return $http.get('/posts/' + id)
					.success(function (res) {
						return res.data;
					});
			},
			addComment: function (id, comment) {
				return $http.post('/posts/' + id + '/comments', comment);
			},
			upvoteComment: function (post, comment) {
				return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
					.success(function (data) {
						comment.upvotes += 1;
					});
			},
			delete: function (post) {
				return $http.delete('/posts/' + post._id)
					.success(function () {
						var index = o.posts.indexOf(post);
						if (index > -1) {
							o.posts.splice(index, 1);
						}
					});
			}
		};
		
		return o;
	}
]);

app.controller('MainCtrl', [
	'$scope',
	'posts',
	function ($scope, posts) {
		$scope.test = 'Hello World!';
		$scope.posts = posts.posts;
		$scope.addPost = function () {
			if (!$scope.title || $scope.title === '') {
				return;
			}
			
			posts.create({
				title: $scope.title,
				link: $scope.link
			});
			
			$scope.title = '';
			$scope.link = '';
		};
		$scope.incrementUpvotes = function (post) {
			posts.upvote(post);
		};
		$scope.deletePost = function (post) {
			posts.delete(post);
		};
	}
]);

app.controller('PostsCtrl', [
	'$scope',
	'posts',
	'post',
	function ($scope, posts, post) {
		$scope.post = post;
		$scope.addComment = function () {	
			if ($scope.body === '') {
				return;
			}
			
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user'
			}).success(function (comment) {
				$scope.post.comments.push(comment);
			});

			$scope.body = '';
		};
		$scope.incrementUpvotes = function (comment) {
			posts.upvoteComment(post, comment);
		};
	}
]);
