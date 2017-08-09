module.exports = {
    extends: 'eslint:recommended',
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: false,
        jquery: false
    },
    parserOptions: {
        ecmaVersion: 8,
        sourceType: 'module',
        ecmaFeatures: {
            arrowFunctions: true,
            binaryLiterals: true,
            blockBindings: true,
            classes: true,
            defaultParams: true,
            destructuring: true,
            forOf: true,
            generators: true,
            modules: true,
            objectLiteralComputedProperties: true,
            objectLiteralDuplicateProperties: true,
            objectLiteralShorthandMethods: true,
            objectLiteralShorthandProperties: true,
            octalLiterals: true,
            regexUFlag: true,
            regexYFlag: true,
            spread: true,
            superInFunctions: true,
            templateStrings: true,
            unicodeCodePointEscapes: true,
            globalReturn: true,
            jsx: true,
            experimentalObjectRestSpread: true
        }
    },
    plugins: [
        'react'
    ],
    rules: {
        'strict': 'warn',
        'semi': 'warn',
        'quotes': ['warn', 'single', {
            avoidEscape: true,
            allowTemplateLiterals: true
        }],
        'no-cond-assign': 'off',
        'no-console': 'off',
        'indent': ['warn', 4],
        'no-undef': 'warn',
        'no-global-assign': 'warn',
        'comma-dangle': 'warn',
    },
    globals: {
        DI: false
    }
}