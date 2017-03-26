var user = {
	name: "john",
	internalObj: {
		name: "internal",
		callName: function(arg, arg2) {
			console.log(this.name + arg + arg2)
		}
	}
	
};

var client = {
	name: "sania"
}

user.internalObj.callName.apply(client, ["-wer-", 34]);
//var clientCallName = user.internalObj.callName.bind(client, "-los");


user.internalObj.callName("-kon", 23);
//clientCallName(55)

 
 
 
 
 
