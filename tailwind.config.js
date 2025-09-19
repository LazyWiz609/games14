module.exports = {
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-40px)' },
        },
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
      },
    },
  },
};
