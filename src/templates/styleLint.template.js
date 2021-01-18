const styleLintTemplate = () => {
  return `{
  "rules": {
    "indentation": 2,
    "block-no-empty": true,
    "block-opening-brace-space-before": "always-multi-line",
    "declaration-colon-space-after": "always",
    "declaration-block-semicolon-newline-after": "always",
    "rule-empty-line-before": [
      "always",
      {
        "ignore": ["after-comment", "first-nested"]
      }
    ],
    "comment-whitespace-inside": "always",
    "max-empty-lines": 1
  },
  "ignoreFiles": ["src/styles/Swiper.scss"]
}`
}

module.exports = {
  styleLintTemplate
}
