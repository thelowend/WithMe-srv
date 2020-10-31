const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2019-07-12',
  iam_apikey: process.env.NLU_KEY,
  url: process.env.NLU_URL,
  disable_ssl_verification: true
});

class NLU {
  constructor(nluService) {
    this.nluService = nluService
  }
  analyzeText(input) {
    return this.nluService.analyze({
      'text': input,
      'language': 'en',
      'features': {
        'sentiment': {},
        'emotion': {},
      }
    })
  }
  getPostScore(analysis) {
    return analysis.sentiment.document.score;
  }
}

module.exports = new NLU(naturalLanguageUnderstanding)
