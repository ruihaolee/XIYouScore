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
	var InputMainBox = React.createClass({
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
				<div id='inputMainBox'> 
					<div id='inputBox'>
						<div>
							<input type='text' id='userNumber' onChange={this.props.inputChangeWatch} value={this.props.userNumber} placeholder='账号'/>
						</div>
						<div>
							<input type='passWord' id='passWord' onChange={this.props.inputChangeWatch} value={this.props.passWord} placeholder='密码'/>
						</div>
					</div>
					<div id='remember'>
						<div className='remBox'>
							<div className='rememberPic' onClick={this.rememberClickHandle}><img src='src/img/jiget.png' ref='remember'/></div>
							<div className='rememberText'>记住密码</div>
						</div>
					</div>
					<div id='loginButton' onClick={this.loginGoClickHandle}>登陆</div>
					<div id='libButton' onClick={this.goLibClickHandle}>前往西邮图书馆</div>
					<p>西安邮电大学移动应用开发实验室</p>
				</div>			
			);
		}
	});
	var LoginContainer = React.createClass({
		getInitialState : function(){
			return {
				userNumber : '',
				passWord : ''
			}
		},
		render : function(){
			return (
				<div id='login' ref='login'>
					<div id='title'>
						<div className='xiyouTitle' ref='textTitle'></div>
						<div className='middleTitle' ref='middleTitle'></div>
					</div>
					<InputMainBox {...this.state} inputChangeWatch={this.inputChangeWatch}></InputMainBox>
				</div>
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
		<LoginContainer/>,
		document.getElementById('loginBox')
	);
})();
