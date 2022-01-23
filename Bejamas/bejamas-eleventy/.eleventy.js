const { EleventyServerlessBundlerPlugin } = require("@11ty/eleventy");

module.exports = function(eleventyConfig) {
	eleventyConfig.addPlugin(EleventyServerlessBundlerPlugin, {
		name: "bejamas", // The serverless function name from your permalink object
		functionsDir: "./netlify/functions/",
	});
	eleventyConfig.addFilter("horoscopeAPIList", (name) => {
		const list = axios
			.get(
				`http://horoscope-api.herokuapp.com/`
			)
			.then((res) => {
				console.log(res.data.results);
				let i = res.data.results
				return i
			})
			.catch((err) => console.log(err));
		return list
	});
};
