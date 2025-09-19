# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



<div className="max-w-md mx-auto">
            <Link
              to="/games/1"
              className="relative block overflow-visible rounded-3xl bg-gradient-to-r from-pink-400 via-pink-500 to-orange-400 p-6 shadow-lg transition-transform transform hover:-translate-y-1"
              aria-label="Go to Game 1"
            >
              {/* balloon image overlapping top-right */}
              <img
                src="./balloon.png"
                alt="balloon"
                className="pointer-events-none absolute -top-6 -right-6 w-28 h-28 object-contain drop-shadow-2xl"
              />

              {/* left content */}
              <div className="flex items-start gap-4">
                <div className="flex flex-col">
                  <div className="flex gap-3">
                    {/* small pill with Game 1 label and play button */}

                    <span
                      className="ml-1 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/90 text-pink-600 shadow-sm transition-transform transform hover:scale-105"
                      aria-hidden
                    >
                      {/* simple play triangle */}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-white/90 font-medium">Game 1</p>
                  {/* Title */}
                  <h3 className="mt-4 text-xl font-semibold text-white drop-shadow-sm">
                    Risk Taking &amp; Reward
                  </h3>
                </div>
              </div>
            </Link>
          </div>