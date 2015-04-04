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

function evalTree(node){
	var type = node.value().type;
	var result="lol";
	if(type == "leaf"){
		result = node.value().value;
	}else if(type == "brackets" || type=="root"){
		result = evalTree(node.children(0));
	}else if(type == "prefix" || type == "postfix" || type == "infix"){
		result = funcs[node.value().func](node.children().map(evalTree));
	}
	node.value().eval = result;
	console.log(result);
	return result;
}

function render(node){
	var type = node.value().type;
	if(type == "leaf"){
		return "<div class='leaf'><span>" + node.value().value + "</span></div>";
	}else if(type == "prefix" || type == "postfix"){
		return "<div><span class='val'>" + (node.value().pretty || node.value().value) + "</span>" + 
		"<span class='eval'>" + node.value().eval + "</span><br>" + render(node.children(0)) + "</div>";
	}else if(type == "infix"){
		if(node.value().value == ","){
			return render(node.children(0)) + render(node.children(1));
		}else{
			return "<div><span class='val'>" + (node.value().pretty || node.value().value) + "</span>" +
			"<span class='eval'>" + node.value().eval + "</span><br>" + render(node.children(0)) + render(node.children(1)) + "</div>";
		}
	}else{
		return render(node.children(0));
	}
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
	},
	comma: function(args){
		if(Array.isArray(args[0])){
			return args[0].concat([args[1]]);
		}else{
			return [args[0], args[1]];
		}
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

function parse(){
	var formula = document.getElementById("formula").value;
	var treeDiv = document.getElementById("tree");
	try{
		var root = tree(tokenize(formula));
		console.log(evalTree(root));
		treeDiv.innerHTML = render(root);
		[].slice.call(treeDiv.getElementsByTagName("div"))
			.forEach(function(elem){
				elem.addEventListener("mouseover", function(e){
					e.target.classList.add("hover");
					e.stopPropagation();
					return false;
				}, false);
				elem.addEventListener("mouseout", function(e){
					e.target.classList.remove("hover");
					e.stopPropagation();
					return false;
				}, false);
				elem.addEventListener("click", function(e){
					if(!e.target.classList.contains("leaf")){
						e.target.classList.toggle("closed");
					}
					e.stopPropagation();
					return false;
				}, false);
			});
	}catch(e){
		console.log(e);
		treeDiv.innerHTML = "<div class='error'>Something is wrong with your formula.<br>" +
			"Available operations: + - * ^ ! max min.<br>" +
			"Only integers are allowed.</div>";
	}
}
