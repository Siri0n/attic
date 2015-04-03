var tokens = [
	{
		regex: /^[0-9]+/,
		type: "leaf"
	},
	{
		regex: /^\-/,
		type: "infix",
		association: "left",
		func: "minus",
		defaultarg: 0,
		priority: 2
	},
	{
		regex: /^\+/,
		type: "infix",
		func: "plus",
		priority: 1
	},
	{
		regex: /^\*/,
		type: "infix",
		func: "mul",
		pretty: "\u00D7",
		priority: 3
	},
	{
		regex: /^\(/,
		type: "brackets",
		priority: -1
	},	
	{
		regex: /^\)/,
		type: "close"
	},
	{
		regex: /^,/,
		type: "infix",
		func: "comma",
		priority: 0
	},
	{
		regex: /^max/,
		type: "prefix",
		func: "max",
		priority: 5
	},
	{
		regex: /^min/,
		type: "prefix",
		func: "min",
		priority: 5
	},
	{
		regex: /^\^/,
		type: "infix",
		association: "right",
		func: "pow",
		priority: 4
	},
	{
		regex: /^\!/,
		type: "postfix",
		func: "factorial",
		priority: 6
	}
];


function Node(value){
	var self = this;
	var parent = null;
	var children = [];
	this.value = function(){
		return value;
	}
	this.parent = function(){
		if(value.type == "root"){
			throw new Error("I am orphan");
		}
		return parent;
	}
	this.setParent = function(newparent){
		parent = newparent;
	}
	function full(){
		if(value.type == "leaf"){
			return true;
		}
		if(value.type == "prefix" || value.type == "postfix" || value.type == "brackets" || value.type == "root"){
			return children.length >= 1;
		}
		if(value.type == "infix"){
			return children.length >= 2;
		}
		console.log("Look here:", value);
		throw new Error("Unknown Fucking Bullshit detected.");
	}
	this.push = function(node){
		if(full()){
			throw new Error("I am " + value.value + " and my family is full");
		}else{
			children.push(node);
			node.setParent(self);
		}
	}
	this.pop = function(){
		if(children.length == 0){
			throw new Error("I'm so alone...");
		}else{
			var node = children.pop();
			node.setParent(null);
			return node;
		}
	}
	this.children = function(n){
		if(typeof n == "undefined"){
			return children;
		}else{
			return children[n];
		}
	}
}

function tokenize(str){
	var result = [];
	var flag;
	while(str){
		flag = true;
		tokens.forEach(function(token){
			var match = (token.regex.exec(str) || [null])[0];
			if(match){
				var lastType = result.length ? result[result.length-1].type : "begin";
				if(token.type == "infix" && (lastType == "begin" || lastType == "brackets" || lastType == "infix")){
					result.push({
						value: token.defaultarg,
						type: "leaf"
					})
				}
				result.push({
					value: match,
					type: token.type,
					leftAssociated: token.association == "left",
					priority: token.priority,
					func: token.func,
					pretty: token.pretty
				});
				str = str.replace(token.regex, "");
				flag = false;
			}
		});
		if(flag){
			throw new Error("Parse error: unknown token.");
		}
	}
	console.log(JSON.parse(JSON.stringify(result)));
	return result;
}

function tree(tokenArray){
	var root = new Node({type: "root", priority: -1});
	var currentNode = new Node(tokenArray.shift());
	var parent;
	root.push(currentNode);
	while(tokenArray.length){
		token = tokenArray.shift();
		if(token.type == "close"){
			currentNode = currentNode.parent();
			while(currentNode.value().type != "brackets"){
				currentNode = currentNode.parent();
			}
		}else{
			var node = new Node(token);
			if(token.type == "leaf" || token.type == "prefix" || token.type == "brackets"){
				currentNode.push(node);
				currentNode = node;
			}else if(token.type == "postfix"){
				do{
					currentNode = currentNode.parent();
				}while(!(currentNode.value().priority < token.priority));
				node.push(currentNode.pop());
				currentNode.push(node);
				currentNode = node;
			}else if(token.type == "infix"){
				do{
					currentNode = currentNode.parent();
				}while(!(currentNode.value().priority < token.priority) && (currentNode.value().value != token.value));
				if((currentNode.value().value == token.value) && token.leftAssociated){
					var parent = currentNode.parent();
					node.push(parent.pop());
					parent.push(node);
				}else{
					node.push(currentNode.pop());
					currentNode.push(node);
				}
				currentNode = node;
			}
		}
	}
	return root;
}

function render(node){
	var type = node.value().type;
	console.log(type);
	if(type == "leaf"){
		return "<div>" + node.value().value + "</div>";
	}else if(type == "prefix" || type == "postfix"){
		return "<div><span data-func='" + node.value().func + "'>" + (node.value().pretty || node.value().value) + "</span><br>" + render(node.children(0)) + "</div>";
	}else if(type == "infix"){
		if(node.value().value == ","){
			return render(node.children(0)) + render(node.children(1));
		}else{
			return "<div><span data-func='" + node.value().func + "'>" + (node.value().pretty || node.value().value) + "</span><br>" + render(node.children(0)) + render(node.children(1)) + "</div>";
		}
	}else{
		return render(node.children(0));
	}
}

function evaluationStart(event){
	if(!event.target.dataset.func){
		return;
	}
	event.target.parentNode.innerHTML = evaluateNode(event.target.parentNode);
}

var funcs = {
	plus: function(args){
		return (args[0] - 0) + (args[1] - 0);
	},
	minus: function(args){
		return args[0]-args[1];
	},
	mul: function(args){
		return args[0]*args[1];
	},
	max: function(args){
		return Math.max.apply(Math, args);
	},
	min: function(args){
		return Math.min.apply(Math, args);
	},
	pow: function(args){
		if(args[1] < 0){
			return "error";
		}else{
			return Math.pow(args[0], args[1]);
		}
	},
	factorial: function(args){
		var result = 1;
		var mult = 1;
		while(mult <= args[0]){
			result *= mult++;
		}
		return result;
	}
}

Object.keys(funcs).forEach(function(key){
	var oldfunc = funcs[key];
	funcs[key] = function(args){
		var error = args.reduce(function(flag, val){
			return flag || (val == "error");
		}, false);
		if(error){
			return "error";
		}else{
			return oldfunc(args);
		}
	}
});

function evaluateNode(node, callback){
	if(!node.children.length){
		return node.innerHTML;
	}else{
		var children = [].slice.call(node.children, 2);
		var func = node.children[0].dataset.func;
		return funcs[func](children.map(evaluateNode));
	}
	
}

function parse(){
	var formula = document.getElementById("formula").value;
	var treeDiv = document.getElementById("tree");
	var message = document.querySelector(".message");
	try{
		treeDiv.innerHTML = render(tree(tokenize(formula)));
		message.classList.remove("error");
		message.innerHTML = "Click operation sign to evaluate.";
	}catch(e){
		console.log(e);
		message.innerHTML = "Something is wrong with your formula.<br>" +
			"Availible operations: + - * ^ ! max min.<br>" +
			"Only whole numbers allowed.";
		message.classList.add("error");
	}
}
