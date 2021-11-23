module.exports = {
  extends: [
      "@gliff-ai"
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  overrides: [
      {
          files: ["*.ts", "*.tsx"],
          rules: {}        
      }]
};