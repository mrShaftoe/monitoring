const pup = require("puppeteer");
const url = "https://xn--80aesfpebagmfblc0a.xn--p1ai/news/?page="

const fetchNews = async (url) => {
  const getPageData = async (pageNumber) => {
    const page = await browser.newPage();
    await page.goto(`${url}${pageNumber}`, { waitUntil: "networkidle2"});
  
    const result = await page.evaluate(() => {
      const parseDate = (rawDate) => {
        return {
          'year': rawDate.slice(0, 4),
          'month': rawDate.slice(4, 6),
          'date': rawDate.slice(6, 8)
        }
      }
      
      const getNewsData = (newsItem) => {
        const href = newsItem.querySelector("a").href;
        const rawDate = href.split("/").slice(-1)[0].split('-')[0];
        const date = parseDate(rawDate);
        const title = newsItem.querySelector("h2").textContent;
      
        return {
          href, 
          date,
          title
        }
      }
  
      const newsList = document.querySelector(".cv-news-page__news-list");
      const news = Array.from(newsList.querySelectorAll(".cv-news-page__news-list-item"));
      return news.map(getNewsData);
    });
    page.close();
    return result;
  }

  const browser = await pup.launch({
    headless: false,
    defaultViewport: null
  });

  const results = [];
  for (let i=1; i < 10; i++) {
    const newData = await getPageData(i);
    results.push(...newData);
  }
  console.log(results);
  console.log(results.length);
}

fetchNews(url);