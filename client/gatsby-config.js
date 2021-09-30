const { createProxyMiddleware } = require("http-proxy-middleware")

module.exports = {
  siteMetadata: {
    title: `Exchange`,
    description: `Kick off your next, great Gatsby project with this default starter. This barebones starter ships with the main Gatsby configuration files you might need.`,
    author: `@gatsbyjs`,
    siteUrl: `https://gatsbystarterdefaultsource.gatsbyjs.io/`,
  },
  plugins: [],
  developMiddleware: app => {
    app.use(
      "/api",
      createProxyMiddleware({
        target: "http://localhost:3000",
        pathRewrite: {
          "/api": "",
        },
      })
    )
  },
}
