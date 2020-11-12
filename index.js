const pup = require("puppeteer");
const dayjs = require('dayjs');
const fs = require('fs');

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

    return result.map((elem) => {
      const date = elem.date;
      elem.date = new Date(date.year, date.month - 1, date.date);
      return elem;
    });
  }

  const browser = await pup.launch({
    headless: true,
    defaultViewport: null
  });

  const results = [];
  let loading = true;
  let i = 1;
  const today = dayjs().startOf('day');
  const startDay = today.subtract(4,'day');
  while (loading) {
    const newData = await getPageData(i++);
    results.push(...newData);
    
    const lastResult = results.slice(-1)[0];
    if (startDay.isSame(lastResult.date, 'day')) {
      loading = false;
    };
  }
  console.log(`Parsing finished. ${results.length} news added`);
  const filteredResults = results.filter(({date}) => !startDay.isSame(date, 'day'));
  console.log(`Results filtered. There are ${filteredResults.length} new now`);
  browser.close();

  const jsonData = JSON.stringify(results);
  fs.writeFile('data.json', jsonData, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

fetchNews(url);