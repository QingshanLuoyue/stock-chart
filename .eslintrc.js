module.exports = {
    root: true,
    parserOptions: {
        sourceType: 'module',
        parser: 'babel-eslint'
    },
    env: {
        browser: true,
        node: true
    },
    extends: [
        'plugin:vue/essential',
        'eslint:recommended'
    ],
    rules: {
        camelcase: 'off',
        indent: ['error', 4, { 'SwitchCase': 1 }],
        'no-new': 'off',
        'standard/no-callback-literal': 0,
        'space-before-function-paren': ['error', 'never'],
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
        'no-unused-vars': 'off'
    }
}
