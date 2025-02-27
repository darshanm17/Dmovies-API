// Initializing the port
const port = 3000;

// importing modules
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

// initializing the server
const app = express();

const newsPaper = [
  {
    name: "Hollywood Reporter",
    url: "https://www.hollywoodreporter.com/",
  },
  {
    name: "rotten tomatoes",
    url: "https://editorial.rottentomatoes.com/",
  },
];

app.get("/", async (req, res) => {
  res.json({ message: "Welcome to the project" });
  console.log("Welcome to the project");
});
// getting the news
app.get("/news", async (req, res) => {
  const MAXPAGE = 11;
  let hasNextPages = true;
  let page = 1;
  let articles = [];
  try {
    while (page <= MAXPAGE && hasNextPages) {
      let url = `https://editorial.rottentomatoes.com/news?wpv_view_count=9675&wpv_paged=${page}`;
      console.log(`fetching url: ${url}`);
      const response = await axios.get(url);
      const html = response.data;
      const $ = cheerio.load(html);
      $(".newsItem", html).each(function () {
        // console.log(this)
        const title = $(this)
          .closest("div")
          .find('p[class*="title"]')
          .text() // Extract text
          .replace(/\s+/g, " ") // Replace multiple spaces/newlines/tabs with a single space
          .trim();
        const url = $(this).attr("href");
        const publicationDate = $(this)
          .closest("div")
          .find('p[class*="publication"]')
          .text()
          .replace(/\s+/g, " ")
          .trim();
        const img = $(this).closest("div").find("img").attr("src");

        articles.push({
          title,
          publicationDate,
          img,
          url,
        });
      });
      const next = $('a[class*="next"]').attr("href");
      hasNextPages = next ? true : false;
      page++;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    res.json(articles);
  } catch (error) {
    res.json(`Error: ${error}`);
  }
});

// Getting the information about the movies in theaters
app.get("/movies-in-theaters", async (req, res) => {
  let movies = [];
  try {
    const url = "https://www.fandango.com/movies-in-theaters";
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    $(".poster-card", html).each(function () {
      const url = $(this).find("a").attr("href");
      const img = $(this).find("img").attr("src");
      const length = $("div.now-playing__wrap ul li").length;
      console.log("Total list items:", length);
      //  const title=$(this).find('ul[class*=browse-movielist]').closest('li')
      //  console.log(ul)
      const title = $(this)
        .find("span[class*=poster-card--title]")
        .text()
        .replace(/\s+/g, " ")
        .trim();
      movies.push({
        title,
        img,
        url,
      });
    });
    res.json(movies);
  } catch (error) {
    res.json(`Error: ${error}`);
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
