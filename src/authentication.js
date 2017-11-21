const HEADER_REGEX = /bearer token-(.*)$/;

//replace token logic with JWT (https://jwt.io/)

module.exports.authenticate = async ({headers: {authorization}}, Users) => {
	//console.log(headers);
	console.log(authorization);
	const result = HEADER_REGEX.exec(authorization);
	console.log(result);
	if(result){
		const email = authorization && HEADER_REGEX.exec(authorization)[1];
		return email && await Users.findOne({email});
	}
}
