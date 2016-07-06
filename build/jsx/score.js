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
		},
		getSession : function(){
			var sessionStr = window.location.search;
			var reg = new RegExp('sessionId=[^&]*');
			var result = reg.exec(sessionStr);
			if (!result) {
				return null;
			}
			else{
			    var session = result[0].substr(10);
			    return session;
			}
		}		
	};

	var ScoreTitle = React.createClass({
		backClickHandle : function(){
			$.cookie('username', {expires: -1});
			$.cookie('password', {expires: -1});
			window.location.href = 'index.html';
		},
		shouldComponentUpdate : function(){
			return false;
		},
		render : function(){
			return (
				<div id='scoreTitle'>
					<div id='backLogin' onClick={this.backClickHandle}></div>
					<div id='titleBox'>
						<div id='xiyouLogo'></div>
						<div>西邮成绩</div>
					</div>
				</div>
			);
		}
	});
	var StudentMessage = React.createClass({
		PropTypes : {
			studentData : React.PropTypes.object.isRequired
		},
		mixins : [base],
		componentWillMount : function(){
		},
		shouldComponentUpdate : function(nextProps){
			return nextProps.studentData !== this.props.studentData;
		},
		componentDidMount : function(){//第一次同步到DOM后调用
			var urlString = 'http://score.northk.cn/users/img?username=' + $.cookie('username') + '&session=' + this.getSession(); 
			this.refs.studentImg.src = urlString;
		},
		componentDidUpdate : function(){//组建同步到DOM后调用
			this.refs.name.innerHTML = this.props.studentData.name;
			this.refs.number.innerHTML = '学号: ' + this.props.studentData.username;
			this.refs.class.innerHTML = this.props.studentData.college + ' ' + this.props.studentData.class;			
		},
		render : function(){
			return (
				<div id='studentData'>
					<div id='outCircle'>
						<div id='inCircle'>
						 	<img src="src/img/personal.png" ref="studentImg" />
						</div>
					</div>
					<div id='studentText'>
						<div ref='name'></div>
						<div id='bottomText'>	
							<div ref='number'></div>
							<div ref='class'></div>
						</div>
					</div>
				</div>
			);
		}
	});
	var ChooseScore = React.createClass({
		mixins : [base],
		PropTypes : {
			studentYear : React.PropTypes.string.isRequired,
			studentQuery : React.PropTypes.object.isRequired,
			changeStudentQuery : React.PropTypes.func.isRequired
		},
		getInitialState : function(){
			return {
				years : []
			}
		},
		computeYearsRange : function(studentYear){
			var nowDate = new Date();
			var selectYearArr = [];
			var nowYear = nowDate.getFullYear(),
				studentYear = parseInt(studentYear);
			for(var i = studentYear; i < nowYear; i++){
				var yearString = i + '-' + (i + 1);
				selectYearArr.push(yearString + ' 第一学期');
				selectYearArr.push(yearString + ' 第二学期');
			}
			this.setState({
				years : selectYearArr
			});
		},
		componentWillReceiveProps : function (props){
			this.computeYearsRange(props.studentYear);
		},
		findParentElement : function(element){
			while(element){
				if (element.className == 'picButton') {
					return element;
				}
				element = element.parentNode;
			}
		},
		chooseButtonClickHandle : function(event){
			var queryData = this.props.studentQuery;
			var buttonPicArr = ['get', 'noget', 'begin'];
			var event = event || window.event,
				target = event.target || event.srcElement;
			var buttonBox = this.findParentElement(target);
			if (!buttonBox) {
				return;
			}

			var	buttonBoxName = buttonBox.getAttribute('name');
			for(var i = 0; i < buttonPicArr.length; i++){
				if (buttonPicArr[i] == buttonBoxName) {
					this.refs[buttonBoxName].setAttribute('src', 'src/img/' + buttonBoxName + '.png');
					switch(buttonBoxName){
						case 'get' :    queryData.ifPass = true;
										break;
						case 'noget':   queryData.ifPass = false;
										break;
						case 'begin': 	queryData.ifPass = 'bukao';
										break;
					}
				}
				else{
					this.refs[buttonPicArr[i]].setAttribute('src', 'src/img/' + buttonPicArr[i] + '-w.png')					
				}
			}
			//console.log(queryData);
			this.props.changeStudentQuery(queryData);
		},
		selectChange : function(event){
			var event = event || window.event,
				target = event.target || event.srcElement;
			var queryData = this.props.studentQuery;
			queryData.selectYear = target.value.substr(0, 9);//获取学年
			var semester = target.value.substr(11, 1);
			switch(semester){//获取学期
				case '一':
						queryData.semester = 1;
						break;
				case '二':
						queryData.semester = 2;
						break;
			}
			//console.log(queryData);
			this.props.changeStudentQuery(queryData);
		},	
		render : function(){
			return (
				<div id='chooseBox'>
					<div id='selectBox'>
						<select onChange={this.selectChange}>
							{
								this.state.years.map(function (yearString, index){
									//console.log(yearString);
									return <option value={yearString} key={parseInt(yearString.substr(0, 4)) + parseInt(yearString.substr(5,4)) + index}>{'学年 | ' + yearString}</option>
								})
							}
						</select>						
					</div>
					<div id='chooseButtonBox' onClick={this.chooseButtonClickHandle}>
						<div className='picButton' name='get'>
							<div><img src='src/img/get.png' ref='get'/></div>
							<div>已通过</div>
						</div>
						<div className='picButton' name='noget'>
							<div><img src='src/img/noget-w.png' ref='noget'/></div>
							<div>未通过</div>
						</div>
						<div className='picButton' name='begin'>
							<div><img src='src/img/begin-w.png' ref='begin'/></div>
							<div>补考查询</div>
						</div>
					</div>
				</div>
			);
		}
	});
	var ScoreMain = React.createClass({
		mixins : [base],
		PropTypes : {
			studentQuery : React.PropTypes.object.isRequired,
			firstChangeQuery : React.PropTypes.func.isRequired
		},
		getInitialState : function(){
			return {
				updateTime : '',
				scoreData : [],
				makeupData : {},
				viewData : []
			}
		},
		componentWillMount : function(){
			var postData = {
				session : this.getSession(),
				username : $.cookie('username'),
				password : $.cookie('password')
			};
			this.base().baseAjax('http://score.northk.cn/score/year', postData, 'GET', (function (scoreData){
				//console.log(scoreData);
				var updateTime = scoreData.result.updateTime.substr(4, 20).replace(/ /g, '/');
				this.setState({
					scoreData : scoreData.result.score,
					updateTime : updateTime
				});
				this.props.firstChangeQuery();
			}).bind(this));
		},
		componentDidMount : function(){//第一次渲染完成之后绑定Touch事件
			this.refs.scoreItem.addEventListener('touchend', (function(){
				this.refs.flushText.style.display = 'none'; 
			}).bind(this));
		},
		componentWillReceiveProps : function(props){
			var queryData = props.studentQuery;
			var fir_score = [],
				end_score = [];
			for(var i = 0; i < this.state.scoreData.length; i++){
				if (this.state.scoreData[i].year == queryData.selectYear) {
					if (queryData.semester == 1 || queryData.semester == 2) {
						if(queryData.ifPass == 'bukao'){
							for(var k = 0; k < this.state.scoreData[i].Terms[queryData.semester - 1].Scores.length; k++){
								var oneScore = this.state.scoreData[i].Terms[queryData.semester - 1].Scores[k];
								result = oneScore.Exam.search(/补考/);
								if (result != -1) {
									fir_score.push(oneScore);
								}
							} 				
						}
						else{
							fir_score = this.state.scoreData[i].Terms[queryData.semester - 1].Scores;
						}
					}
					break;
				}
			}
			//console.log(fir_score);
			if(queryData.ifPass !== 'bukao'){//不是补考成绩才进入
				for(var i = 0; i < fir_score.length; i++){
					if(queryData.ifPass){
						if ((parseInt(fir_score[i].EndScore) >= 60) || (parseInt(fir_score[i].ReScore) >= 60)) {
							end_score.push(fir_score[i]);
						}
					}
					else{
						if (parseInt(fir_score[i].EndScore) < 60 && (parseInt(fir_score[i].ReScore) < 60)) {
							end_score.push(fir_score[i]);
						}
					}
				}				
			}
			else{
				end_score = fir_score;
			}
			//console.log(end_score);
			this.checkTitleLength(end_score);
		},
		checkTitleLength : function(end_score){
			for(var i = 0; i < end_score.length; i++){
				var thisScore = end_score[i];
				if (thisScore.Title.length > 9) {
					var nowTitle = thisScore.Title.substr(0, 8);
					nowTitle += '...';
					thisScore.Title = nowTitle;
				}
			}
			//console.log(end_score);
			this.setState({
				viewData : end_score
			});
		},
		backClickHandle : function(){
			// $.cookie('username', {expires: -1});
			// $.cookie('password', {expires: -1});
			window.location.href = 'index.html';
		},
		flushDataHandle : function(){
			var postData = {
				session : this.getSession(),
				username : $.cookie('username'),
				password : $.cookie('password'),
				update : 'ruihaolee'
			};
			if (!this.flushDataHandle.lastFlushTime) {
				this.flushDataHandle.lastFlushTime = Date.parse(new Date());
			}
			else{
				var nowFlushTime = Date.parse(new Date());
				var timeCut = (nowFlushTime - this.flushDataHandle.lastFlushTime) / 1000;
				if (timeCut < 20) {
					alert('同学你刷新太频繁,请' + (20 - timeCut) + "秒后再试");
					return;
				}
				this.flushDataHandle.lastFlushTime = nowFlushTime;
				// console.log(timeCut);
			}



			//刷新转动
			if (!this.flushDataHandle.circleRotateTime) {
				this.flushDataHandle.circleRotateTime = 1;
			}
			else{
				this.flushDataHandle.circleRotateTime++;
			}		
			//console.log(this.flushDataHandle.circleRotateTime);
			var nowDeg = this.flushDataHandle.circleRotateTime * 360;
			this.refs.flushCircle.style.transform = 'rotate(' + nowDeg + 'deg)';
			//刷新请求部分
			this.base().baseAjax('http://score.northk.cn/score/year', postData, 'GET', (function (scoreData){
				var updateTime = scoreData.result.updateTime.substr(4, 20).replace(/ /g, '/');
				this.setState({
					scoreData : scoreData.result.score,
					updateTime : updateTime
				});
			}).bind(this));
			this.refs.flushText.style.display = 'block';
			setTimeout((function(){
				this.refs.flushText.style.display = 'none';		
			}).bind(this), 5000);
		},
		componentDidUpdate : function(){
			//console.log(1);
			// console.log(this.state.viewData.length);
			if (!this.state.viewData.length) {
				// var noDataString = '<div id="noData"></div>';
				// this.refs.scoreItem.innerHTML = noDataString;
				this.refs.flushText.style.display = 'none';
				this.refs.bigButtonBox.style.display = 'none';
				this.refs.noData.style.display = 'block';
			}
			else{
				// this.refs.sc
				this.refs.flushText.style.display = 'block';
				this.refs.bigButtonBox.style.display = 'block';
				this.refs.noData.style.display = 'none';
			}
		},
		render : function(){
			return (
				<div id='mainBox'>
					<div id='scoreItem' ref='scoreItem'>
						{
							this.state.viewData.map((function (oneScore, index){
									return <div className='oneScore' key={index} style={index%2 == 0 ? {backgroundColor:'#F8F8F8'} : {backgroundColor:"#18B3C5"}}>
												<div className='scoreText'>
													<div className='name'>
														<div>{oneScore.Title}</div>
														<div>{oneScore.Type}</div>
													</div>
												</div>
												<table>
													<tbody>
														<tr>
															<td>{this.props.studentQuery.ifPass == 'bukao' ? "补考成绩: " + (oneScore.ReScore ? oneScore.ReScore : 0) : '最终成绩: ' + oneScore.EndScore}</td>
															<td>{'绩点 : ' + oneScore.Credit}</td>
														</tr>
														<tr>
															<td>{'平时分数: ' + oneScore.UsualScore}</td>
															<td>{'卷面分数: ' + oneScore.RealScore}</td>
															<td>{oneScore.Exam}</td>
														</tr>
													</tbody>
												</table>
											</div>
								}).bind(this))
						}
						<div id="noData" ref='noData'></div>
					</div>
					<div className='bigButtonBox' ref='bigButtonBox'>
						<div className='backButton' onClick={this.backClickHandle}></div>
						<div className='flushButton' onClick={this.flushDataHandle}>
							<div className='rotateCircle' ref='flushCircle'></div>
						</div>
					</div>
					<div className='flushText' ref='flushText'>
						<div className='textBox'>
							<p>请及时更新,获得最新数据哦~</p>
							<p>{"上次更新时间:" + this.state.updateTime}</p>
						</div>
						<div className='littleS'></div>
					</div>
				</div>
			);
		}
	});	
	var ScoreContent = React.createClass({
		mixins : [base],
		getInitialState : function(){
			return {
				studentYear : '',
				studentQuery : {
					semester : 1,
					ifPass : true,
					selectYear : ''
				},
				studentData : {}
			}
		},
		changeStudentYear : function(getYear){
			//初始学年
			var studentQuery = this.state.studentQuery;
			studentQuery.selectYear =getYear + '-' + (getYear + 1);
			this.setState({
				studentYear : getYear,
				studentQuery : studentQuery
			});

		},
		componentWillMount : function(){
			var getMessageData = null;
			var session = this.getSession();
			if (!session) {
				alert('同学你好,请先登录');
				window.location.href = 'index.html';
			}
			else{
				getMessageData = {
					username : $.cookie('username'),
					password : $.cookie('password'),
					session : session
				};
				this.base().baseAjax('http://score.northk.cn/users/info', getMessageData, 'GET', (function (data){
					this.setState({
						studentData : data.result
					});		//更新state 重新渲染

					var studentYear = "201" + data.result.username[3];
					var studentQuery = this.state.studentQuery;
					studentQuery.selectYear =studentYear + '-' + (parseInt(studentYear) + 1);
					//console.log(studentQuery.selectYear);
					this.setState({
						studentYear : studentYear,
						studentQuery : studentQuery
					});
				}).bind(this));
			}
		},
		changeStudentQuery : function(newQuery){
			this.setState({
				studentQuery : newQuery
			});
		},
		firstChangeQuery : function(){
			this.setState({
				studentQuery : this.state.studentQuery
			});
		},
		render : function(){
			return(
				<div>
					<div id='blueBack'>
						<StudentMessage studentData={this.state.studentData}></StudentMessage>
						<ChooseScore {...this.state} changeStudentQuery={this.changeStudentQuery}></ChooseScore>
					</div>
					<ScoreMain studentQuery={this.state.studentQuery} firstChangeQuery={this.firstChangeQuery}></ScoreMain>
				</div>				
			);
		}
	});	


	ReactDOM.render(
		<ScoreContent/>,
		document.getElementById('scroeContainer')
	);
})();