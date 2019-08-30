// tr 行
// td 列
// rayNum 雷数量

function Ray(tr, td, rayNum) {
	this.tr = tr;
	this.td = td;
	this.rayNum = rayNum;

	//存储所有方块的信息，二维数组，按行与列的顺序排放
	this.squareAll = [];

	//存储单元格的DOM(二维数组)
	this.tds = [];
	//剩余雷数量
	this.remaining = rayNum;
	//判断右键是否正确为雷
	this.compareRay = false;

	this.parent = document.getElementsByClassName('chessboard')[0];

}

Ray.prototype.init = function () {

	var rNum = this.randomRay();
	var n = 0;



	//用n来不断累加，通过判断随机出来的数是否与n相同，是的话就记录该位置信息为雷的信息，反之……	
	for (var i = 0; i < this.tr; i ++) {
		this.squareAll[i] = [];
		for (var j = 0; j < this.td; j ++) {
			if (rNum.indexOf(++n) != -1) {
				this.squareAll[i][j] = 	{
					type: "ray", 
					x: j,
					y: i
				}
			} else {
				this.squareAll[i][j] = {
					type: "num",
					x: j,
					y: i,
					value: 0
				}
			}

		}
	}

	this.parent.oncontextmenu = function (e) {
		return false;
	}

	// console.log(this.squareAll);

	this.updateNum();
	this.createChess();

	this.remaining = this.rayNum;
	this.rayNumDom = document.getElementsByClassName('rayNum')[0];
	this.rayNumDom.innerText = this.remaining;

}

//随机出雷的位置
Ray.prototype.randomRay = function () {
	var squares = new Array(this.tr * this.td);
	for (var i = 0; i < squares.length; i ++) {
		squares[i] = i;
	}
	squares.sort(function () {
		return 0.5 - Math.random();
	})
	// console.log(squares.slice(0, this.rayNum));
	return squares.slice(0, this.rayNum);
}

//创建场地
Ray.prototype.createChess = function () {
	var self = this;
	var table = document.createElement('table');
	for (var i = 0; i < this.tr; i ++) {
		var domTr = document.createElement('tr');
		this.tds[i] = [];
		for (var j = 0; j < this.td; j ++) {
			var domTd = document.createElement('td');
			this.tds[i][j] = domTd;

			domTd.pos = [i, j]	//把对应格子的行和列存在格子上，为了下面通过这个值到数组内取到对应的数据
			domTd.onmousedown = function (e) {
				self.play(e, this);
			}

			// if (this.squareAll[i][j].type == "ray") {
			// 	domTd.className = "ray";
			// } else {
			// 	domTd.innerText = this.squareAll[i][j].value;
			// }

			domTr.appendChild(domTd);
		}
		table.appendChild(domTr);
	}
	this.parent.innerHTML = '';
	this.parent.appendChild(table);
}

//找雷周围的格子
Ray.prototype.getAround = function (square) {
	var x = square.x;
	var y = square.y;
	var result = [];	//返回找到的坐标

	for (var i = x - 1; i <= x + 1; i ++) {
		for (var j = y - 1; j <= y + 1; j ++) {
			if (i < 0 || j < 0 || i > this.td - 1 || j > this.tr - 1 || (i == x && j == y) || this.squareAll[j][i].type == "ray") {
				continue;
			}
			result.push([j, i]);
		}
	}

	return result;
}

//更新数字
Ray.prototype.updateNum = function () {
	for (var i = 0; i < this.tr; i ++) {
		for (var j = 0; j < this.td; j ++) {
			//只更新雷周围的数字
			if (this.squareAll[i][j].type == "num") {
				continue;
			}
			var num = this.getAround(this.squareAll[i][j]);
			// console.log(num);
			for (var k = 0; k < num.length; k ++) {
				this.squareAll[num[k][0]][num[k][1]].value += 1;
			}
		}
	}
	// console.log(this.squareAll);
}

//开玩
Ray.prototype.play = function (e, obj) {
	var self = this;
	if (e.which == 1 && obj.className != 'flag') {
		var curSquare = this.squareAll[obj.pos[0]][obj.pos[1]];
		var colorArr = ["one", "two", "three", "four", "five", "six", "seven", "eight"];
		obj.className = colorArr[curSquare.value];
		// console.log(curSquare);
		if (curSquare.type == "num") {
			obj.innerText = curSquare.value;
			if (curSquare.value == 0) {

				obj.innerText = '';

				function getSame (square) {
					var around = self.getAround(square);
					for (var i = 0; i < around.length; i ++) {
						var x = around[i][0];
						var y = around[i][1];
						self.tds[x][y].className = colorArr[self.squareAll[x][y].value];
					}
					if (self.squareAll[x][y].value == 0) {
						if (!self.tds[x][y].check) {
							self.tds[x][y] = true;
							getSame(self.squareAll[x][y]);
						}
					}
					self.tds[x][y].innerText = self.squareAll[x][y].value;
				}
				getSame(curSquare);
			}
		} else {
			//雷
			this.gameOver(obj);
		}
	}
	if (e.which == 3) {
		if (obj.className && obj.className != 'flag') {
			return;
		}
		obj.className = obj.className == 'flag' ? '' : 'flag';

		if (this.squareAll[obj.pos[0]][obj.pos[1]].type == 'ray') {
			this.allRight = true;
		} else {
			this.allRight = false;
		}

		if (obj.className == 'flag') {
			this.rayNumDom.innerText = --this.remaining;
		} else {
			this.rayNumDom.innerText = ++this.remaining;
		}

		if (this.remaining == 0) {
			if (this.allRight) {
				alert('Game Win!');
			} else {
				alert('Game Over');
			}
		}

	}
}

Ray.prototype.gameOver = function (clickTd) {
	for (var i = 0; i < this.tr; i ++) {
		for (var j = 0; j < this.td; j ++) {
			if (this.squareAll[i][j].type == 'ray') {
				this.tds[i][j].className = "ray";
			}
			this.tds[i][j].onmousedown = null;
		}
	}
	if (clickTd) {
		clickTd.style.borderColor = 'red';
	}
	alert('Game Over')
}

var ray = new Ray(10, 10, 10);
ray.init();

var rest = document.getElementsByClassName('rest')[0];
rest.onclick = function () {
	ray.init();
}













