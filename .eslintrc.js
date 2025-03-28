module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    es6: true,
  },
  overrides: [
    {
      files: ["*.ts"],
      parserOptions: {
        project: [
          "./projects/ng-recaptcha/tsconfig.spec.json",
          "./projects/ng-recaptcha/tsconfig.lib.json",
          "./projects/ng-recaptcha/tsconfig.lib.prod.json",
          "./projects/demo/cypress/tsconfig.json",
          "./projects/demo/tsconfig.app.json",
          "./tsconfig.node.json",
          "./tsconfig.json",
        ],
        createDefaultProgram: true,
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@angular-eslint/recommended",
        // This is required if you use inline templates in Components
        "plugin:@angular-eslint/template/process-inline-templates",
        "prettier",
        "plugin:deprecation/recommended",
      ],
      rules: {
        // this produces false-positives on `RecaptchaValueAccessorDirective.selector` (complains about absence of prefix in re-captcha[**formControlName])
        // "@angular-eslint/directive-selector": [
        //   "error",
        //   { type: "attribute", prefix: "re", style: "camelCase" },
        // ],
        "@angular-eslint/directive-selector": 0,
        "@angular-eslint/prefer-standalone": 0,
        "@angular-eslint/component-selector": ["error", { type: "element", prefix: "re", style: "kebab-case" }],
        "@typescript-eslint/no-namespace": [
          "error",
          {
            allowDeclarations: true,
          },
        ],
      },
    },
    {
      files: ["**/**.spec.ts", "**/test-utils/*.ts"],
      plugins: ["jest"],
      rules: {
        "@typescript-eslint/unbound-method": "off",
        "jest/unbound-method": "error",
      },
    },
    {
      files: ["*.html"],
      extends: ["plugin:@angular-eslint/template/recommended"],
      rules: {
        /**
         * Any template/HTML related rules you wish to use/reconfigure over and above the
         * recommended set provided by the @angular-eslint project would go here.
         */
      },
    },
  ],
};
