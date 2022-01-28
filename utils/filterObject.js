const filterObject = (object, ...allowedFields) => {
	const newObject = {};

	Object.keys(object).forEach(key => {
		if (allowedFields.includes(key)) newObject[key] = object[key];
	});

	return newObject;
};

module.exports = { filterObject };
