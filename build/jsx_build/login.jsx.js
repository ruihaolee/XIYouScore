/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	(function(){
		var Base = function(){};
		Base.prototype = {
			constructor : Base,
			baseAjax : function(url, data, type, callback){
				$.ajax({
					type : type,
					url : url,
					data : data,
					dataType : 'jsonp',
					success : function(data){
						callback(data);
					}
				});
			}
		};
		var base = {
			base : function(){
				return new Base();
			}
		};

		var isFinished = true;
		var InputMainBox = React.createClass({displayName: "InputMainBox",
			mixins : [base],
			PropTypes : {
				userNumber : React.PropTypes.string.isRequired,
				passWord : React.PropTypes.string.isRequired,
				inputChangeWatch : React.PropTypes.func.isRequired
			},
			getInitialState: function(){
				return {
					ifRemember :true
				}
			},
			trim : function(str){
				return str.replace(/[ ]/g, "");
			},	
			checkUserInput : function(inputData){
				var flag = false;
				for(var name in inputData){
					thisData = this.trim(inputData[name]);
					if (!thisData) {
						flag = true;
						alert('不允许账户或密码为空');
						return flag;
					}
					else{
						var result = thisData.search(/select|insert|update|delete|union|into|load_file|outfile/);
						if (result != -1) {
							flag = true;
							alert('你输入的字符非法');
							return flag;
						}
					}
				}
				return flag;
			},
			loginGoClickHandle : function(){
				var studentData = {
					username : this.props.userNumber,
					password : this.props.passWord
				};
				var checkResult = this.checkUserInput(studentData);
				if (checkResult == true) {
					return;
				}
				if (isFinished) {
					isFinished = false;
					this.base().baseAjax('http://score.northk.cn/users/login', studentData, 'GET', (function (result){
							isFinished = true;
							console.log(result);
							if (!result.error) {
								$.cookie('username', studentData.username, {expires : 1});
								$.cookie('password', studentData.password, {expires : 1});
								if (this.state.ifRemember) {
									$.cookie('ifRemember', true, {expires : 1});
								}
								else{
									$.cookie('ifRemember', {expires: -1});
								}
								var sessionId = result.result.session;
								window.location.href = 'score.html?sessionId=' + sessionId;
							}
							else{
								alert('账号或密码错误,请检查');
							}
						}).bind(this));				
				}
				else{
					alert('同学你的小爪子点击太快了');
				}
			},
			goLibClickHandle : function(){
				window.location.href = 'https://lib.xiyoumobile.com/';
			},
			rememberClickHandle : function(){
				if (!this.state.ifRemember) {
					this.refs.remember.src = 'src/img/jiget.png';
				}
				else{
					this.refs.remember.src = 'src/img/jinoget.png';
				}
				this.setState({
					ifRemember : !this.state.ifRemember
				});
			},
			render : function(){
				return (
					React.createElement("div", {id: "inputMainBox"}, 
						React.createElement("div", {id: "inputBox"}, 
							React.createElement("div", null, 
								React.createElement("input", {type: "text", id: "userNumber", onChange: this.props.inputChangeWatch, value: this.props.userNumber, placeholder: "账号"})
							), 
							React.createElement("div", null, 
								React.createElement("input", {type: "passWord", id: "passWord", onChange: this.props.inputChangeWatch, value: this.props.passWord, placeholder: "密码"})
							)
						), 
						React.createElement("div", {id: "remember"}, 
							React.createElement("div", {className: "remBox"}, 
								React.createElement("div", {className: "rememberPic", onClick: this.rememberClickHandle}, React.createElement("img", {src: "src/img/jiget.png", ref: "remember"})), 
								React.createElement("div", {className: "rememberText"}, "记住密码")
							)
						), 
						React.createElement("div", {id: "loginButton", onClick: this.loginGoClickHandle}, "登陆"), 
						React.createElement("div", {id: "libButton", onClick: this.goLibClickHandle}, "前往西邮图书馆"), 
						React.createElement("p", null, "西安邮电大学移动应用开发实验室")
					)			
				);
			}
		});
		var LoginContainer = React.createClass({displayName: "LoginContainer",
			getInitialState : function(){
				return {
					userNumber : '',
					passWord : ''
				}
			},
			render : function(){
				return (
					React.createElement("div", {id: "login", ref: "login"}, 
						React.createElement("div", {id: "title"}, 
							React.createElement("div", {className: "xiyouTitle", ref: "textTitle"}), 
							React.createElement("div", {className: "middleTitle", ref: "middleTitle"})
						), 
						React.createElement(InputMainBox, React.__spread({},  this.state, {inputChangeWatch: this.inputChangeWatch}))
					)
				);
			},
			componentWillMount : function(){
				if ($.cookie('ifRemember') == 'true') {
					this.setState({
						userNumber : $.cookie('username'),
						passWord : $.cookie('password')
					});	
				}
			},
			componentDidMount: function(){
				this.refs.login.style.height = document.documentElement.clientHeight + 'px';

				this.refs.textTitle.style.transform = 'rotateY(0deg)';
				setTimeout((function(){
					this.refs.middleTitle.style.top = '0';
				}).bind(this), 150);
			},
			inputChangeWatch : function(event){
				var event = event || window.event;
				var target = event.target || event.srcElement;
				var targetId = target.id;
				if (targetId == 'userNumber') {
					this.setState({
						userNumber : target.value
					});
				}	
				else if(targetId == 'passWord'){
					this.setState({
						passWord : target.value
					});
				}
			}
		});

		ReactDOM.render(
			React.createElement(LoginContainer, null),
			document.getElementById('loginBox')
		);
	})();


/***/ }
/******/ ]);