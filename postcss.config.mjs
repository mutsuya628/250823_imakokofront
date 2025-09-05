const config = {
  plugins: {
    "@tailwindcss/postcss": {
      content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}",
        "./src/lib/**/*.{js,ts,jsx,tsx}",
      ],
    },
  },
};

export default config;
