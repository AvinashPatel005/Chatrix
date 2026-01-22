const { translate } = require('google-translate-api-x');
const translateText = async (text, targetLang) => {
    try {
        // google-translate-api-x expects 'es', 'fr', etc.
        // If targetLang is 'en', it works seamlessly.
        const res = await translate(text, { to: targetLang, forceBatch: false });
        return res.text;
    } catch (error) {
        console.error('Translation Error:', error.message);
        // Fallback if API fails
        return `[${targetLang}] ${text}`;
    }
};
translateText("Hello", "Bengali").then(console.log);